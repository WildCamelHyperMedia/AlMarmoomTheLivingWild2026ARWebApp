// Makes hardcoded root-absolute asset paths (e.g. "/videos/x.mp4") resolve
// correctly whether the app is served from the domain root (custom domain /
// org page) or from a GitHub Pages project subpath (e.g.
// "/AlMarmoomTheLivingWild2026ARWebApp/").
//
// At root, BASE_URL === "/" so asset("/videos/x") returns "/videos/x" unchanged
// — i.e. this is a no-op and completely safe for a root deployment.

const BASE = import.meta.env.BASE_URL.replace(/\/$/, ""); // "" at root, "/Repo" under a subpath

export function asset(path: string): string {
  if (!path) return path;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path; // external / inline URLs are never rebased
  }
  return BASE + (path.startsWith("/") ? path : "/" + path);
}

// Optional CDN offload for heavy video files. If VITE_VIDEO_BASE is set at
// build time (e.g. an R2 / Bunny / CloudFront origin), videos load from there
// and the Pages site itself stays small. If unset, videos fall back to local
// (base-aware) paths — identical to asset().
const VIDEO_BASE = (import.meta.env.VITE_VIDEO_BASE || "").replace(/\/$/, "");

export function videoAsset(path: string): string {
  if (!path) return path;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("blob:")) return path;
  if (VIDEO_BASE) return VIDEO_BASE + (path.startsWith("/") ? path : "/" + path);
  return asset(path);
}
