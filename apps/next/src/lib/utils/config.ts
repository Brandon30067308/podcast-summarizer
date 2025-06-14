export function getURL() {
  let url =
    process.env?.NEXT_PUBLIC_BASE_URL ??
    process.env?.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000/";
  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to including trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
}
