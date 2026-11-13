import type { ReactNode } from "react";
import "./style.css";
export const metadata = {
  title: "WebDecoy | Next.js bot traffic walkthrough",
  description:
    "Verify monitor-mode bot detection with your own requests and dashboard.",
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
