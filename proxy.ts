import webdecoy from "@webdecoy/nextjs/vercel";

// Detection starts in monitor mode. This example configures no clearance gate.
export default webdecoy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
