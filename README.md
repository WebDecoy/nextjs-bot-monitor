# Next.js on Vercel: verify WebDecoy reporting

A standalone Next.js 16 App Router example using the published WebDecoy 0.23.0 Vercel entry point. Maintained by WebDecoy.

## Run locally

Requires Node.js 20.9 or later.

```sh
npm ci
cp .env.example .env.local
# Set your own WEBDECOY_API_KEY in .env.local for cloud reporting.
npm run dev
```

Open http://127.0.0.1:3107. The page shows actual request verdict headers and whether an API key is configured; neither proves cloud delivery.

```sh
curl -i -A 'WebDecoy-Test/1.0' http://127.0.0.1:3107/api/inspect
```

With a valid API key, find the **Test** record for this path and timestamp in your own WebDecoy site's Detections page. Without a key, the page is served but no detection reports. Never commit `.env.local` or put the key in a `NEXT_PUBLIC_` variable.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWebDecoy%2Fnextjs-bot-monitor&env=WEBDECOY_API_KEY&envDescription=Your+property-scoped+WebDecoy+reporting+API+key.+It+stays+server-side.&envLink=https%3A%2F%2Fwebdecoy.com%2Fblog%2Fsee-bots-ai-crawlers-nextjs%2F&project-name=webdecoy-nextjs-monitor&repository-name=webdecoy-nextjs-monitor&demo-title=WebDecoy+Next.js+Bot+Traffic+Monitor&demo-description=Verify+bot+detection+reporting+with+a+labeled+request+in+Next.js+16.&demo-url=https%3A%2F%2Fwebdecoy-nextjs-monitor-demo.vercel.app)

[Explore the live diagnostic UI](https://webdecoy-nextjs-monitor-demo.vercel.app). The public UI is a setup demonstration, not a customer traffic dashboard. Deploy your own copy to inspect your own requests.

The button copies only this standalone example directory and prompts for your own server-side reporting key. It does not copy our demo credentials.

Import the example as a Next.js project, using this folder as the project root if importing the website repository. Set `WEBDECOY_API_KEY` in the intended Vercel environment and deploy. Use the deployed hostname in the test command. Vercel preview protection, your authentication, or a firewall can prevent a request from reaching the app: do not disable them simply to make the test pass.

`proxy.ts` is for Next.js 16. Existing projects must compose with their existing authentication/redirect proxy; do not overwrite it or add a second request hook. On Next.js 13–15 the equivalent filename is `middleware.ts`.

This example enables detection reporting only. It configures no clearance gate and makes no policy changes to a WebDecoy site. Existing environment variables for a clearance gate or enforcement settings must be reviewed separately before using this in an existing project.

## Local verification

```sh
npm run build
npm test
```

- The production Next.js app serves ordinary and reserved test requests without an API key, and explicitly reports that no key or verdict is present.
- The published core Vercel middleware sends the reserved test flag through real HTTP to a **local API fixture**, forwards the fixture's verdict, strips forged inbound verdict headers, and continues in monitor mode.

These tests do not deploy to Vercel or write a record to WebDecoy cloud. An HTTP 200 or a fixture ID does not prove live delivery. The dashboard check above is a separate step.

## Next

- [Full walkthrough](https://webdecoy.com/blog/see-bots-ai-crawlers-nextjs/)
- [SDK repository](https://github.com/WebDecoy/node)
- [Vercel middleware setup](https://docs.webdecoy.com/installation/vercel-middleware/)
- [AI traffic learning hub](https://webdecoy.com/learn/ai-traffic/)

The middleware can observe only requests that reach it and match its scope. A crawler name is a claim unless verified. AI referrals are attributable visitor arrivals, not crawler request counts; browser/referral collection is a separate setup.
