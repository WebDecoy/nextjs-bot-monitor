import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { createVercelMiddleware } from "@webdecoy/node/vercel";

// Real published middleware and HTTP transport; the receiving API is a local
// fixture, not WebDecoy cloud. The key below is deliberately not a credential.
test("Vercel middleware reports the labeled test and continues in monitor mode", async () => {
  const received = [];
  const api = createServer(async (req, res) => {
    let text = "";
    for await (const chunk of req) text += chunk;
    received.push({ path: req.url, body: JSON.parse(text) });
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        decision: "block",
        confidence: 100,
        threat_level: "HIGH",
        bot_detected: true,
        detection_id: "local-fixture-test",
        rule_enforced: false,
      }),
    );
  });
  api.listen(0, "127.0.0.1");
  await once(api, "listening");
  try {
    const middleware = createVercelMiddleware({
      apiKey: "sk_test_local_fixture_only",
      apiUrl: `http://127.0.0.1:${api.address().port}`,
      mode: "monitor",
      siteKey: "",
      scannerId: "",
      sensorKey: "",
    });
    const result = await middleware(
      new Request("https://example.test/api/inspect", {
        headers: {
          "user-agent": "WebDecoy-Test/1.0",
          "x-webdecoy-detection-id": "client-forged",
          "x-webdecoy-would-block": "false",
        },
      }),
    );
    assert.equal(received.length, 1);
    assert.equal(received[0].path, "/api/v1/sdk/detect");
    assert.equal(
      received[0].body.request_metadata.user_agent,
      "WebDecoy-Test/1.0",
    );
    assert.ok(received[0].body.local_analysis.flags.includes("test_trigger"));
    assert.equal(result.headers.get("x-middleware-next"), "1");
    assert.equal(
      result.headers.get("x-middleware-request-x-webdecoy-detection-id"),
      "local-fixture-test",
    );
    assert.equal(
      result.headers.get("x-middleware-request-x-webdecoy-would-block"),
      "true",
    );
  } finally {
    await new Promise((resolve) => api.close(resolve));
  }
});

test("built Next.js app serves ordinary and test requests without a key; does not claim delivery", async () => {
  const reservation = createServer();
  reservation.listen(0, "127.0.0.1");
  await once(reservation, "listening");
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1" };
  for (const key of [
    "WEBDECOY_API_KEY",
    "WEBDECOY_SITE_KEY",
    "WEBDECOY_SCANNER_ID",
    "WEBDECOY_SENSOR_KEY",
  ])
    delete env[key];
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    { env, stdio: ["ignore", "pipe", "pipe"] },
  );
  let logs = "";
  for (const stream of [child.stdout, child.stderr])
    stream.on("data", (chunk) => {
      logs = (logs + chunk).slice(-5000);
    });
  const origin = `http://127.0.0.1:${port}`;
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      if (child.exitCode !== null) throw Error(logs);
      try {
        const r = await fetch(origin);
        if (r.ok) {
          ready = true;
          break;
        }
      } catch {}
      await delay(100);
    }
    assert.ok(ready, "Next.js production server started");
    const home = await fetch(origin);
    assert.equal(home.status, 200);
    assert.match(await home.text(), /Verify the detection/);
    const test = await fetch(origin + "/api/inspect", {
      headers: {
        "user-agent": "WebDecoy-Test/1.0",
        "x-webdecoy-decision": "forged",
        "x-webdecoy-would-block": "true",
      },
    });
    assert.equal(test.status, 200);
    const json = await test.json();
    assert.equal(json.reportingConfigured, false);
    assert.equal(json.decision, null);
    assert.equal(json.wouldBlock, null);
    assert.match(json.note, /Confirm the Test record/);
  } finally {
    child.kill("SIGTERM");
    await once(child, "exit");
  }
});
