import { headers } from "next/headers";
export const dynamic = "force-dynamic";
export default async function Home() {
  const h = await headers();
  const configured = Boolean(process.env.WEBDECOY_API_KEY?.trim());
  return (
    <main>
      <header>
        <a href="https://github.com/WebDecoy/node">
          WebDecoy <span>/ Node.js</span>
        </a>
        <span className="pill">MONITOR MODE WALKTHROUGH</span>
      </header>
      <section className="intro">
        <p className="eyebrow">NEXT.JS 16 · VERCEL ENTRY POINT</p>
        <h1>
          See the request.
          <br />
          <em>Verify the detection.</em>
        </h1>
        <p className="lead">
          Send a labeled test through your app. Then find its record in your
          WebDecoy dashboard.
        </p>
      </section>
      <section className="grid">
        <article>
          <p className="step">01 / CONFIGURE</p>
          <h2>{configured ? "API key is configured." : "Add your API key."}</h2>
          <p>
            Set <code>WEBDECOY_API_KEY</code> server-side in{" "}
            <code>.env.local</code>, or in your Vercel project’s environment.
            Restart locally or redeploy on Vercel.
          </p>
          <p className="small">
            This page never displays the key. A configured key alone does not
            prove delivery.
          </p>
        </article>
        <article>
          <p className="step">02 / SEND</p>
          <h2>Make one test request.</h2>
          <pre>
            curl -i -A 'WebDecoy-Test/1.0' http://127.0.0.1:3107/api/inspect
          </pre>
          <p>
            On Vercel, replace the local origin with your deployed domain. Keep
            the request on a path covered by your matcher.
          </p>
        </article>
        <article>
          <p className="step">03 / CONFIRM</p>
          <h2>Open Detections.</h2>
          <p>
            Find the record labeled <strong>Test</strong> in your own site’s{" "}
            <a href="https://app.webdecoy.com/">WebDecoy dashboard</a>. Check
            the path and timestamp.
          </p>
          <p className="small">
            A test verifies reporting. It is not a real crawler visit.
          </p>
        </article>
        <article className="request">
          <p className="step">THIS PAGE REQUEST</p>
          <h2>Request diagnostic headers</h2>
          <dl>
            <div>
              <dt>Decision</dt>
              <dd>
                {(configured && h.get("x-webdecoy-decision")) ||
                  "No verdict received"}
              </dd>
            </div>
            <div>
              <dt>Would block</dt>
              <dd>
                {(configured && h.get("x-webdecoy-would-block")) ||
                  "Not reported"}
              </dd>
            </div>
          </dl>
          <p className="small">
            Monitor mode serves the request. These headers are an application
            diagnostic, not a dashboard-delivery receipt.
          </p>
        </article>
      </section>
      <footer>
        <p>
          Observed crawlers and visits referred by AI assistants answer
          different questions. Keep their counts separate.
        </p>
        <nav>
          <a href="https://github.com/WebDecoy/node">SDK source ↗</a>
          <a href="https://docs.webdecoy.com/installation/vercel-middleware/">
            Vercel setup ↗
          </a>
        </nav>
      </footer>
    </main>
  );
}
