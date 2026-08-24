export function isEmbedded() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("embedded") === "1") return true;
  try {
    return sessionStorage.getItem("dirsha_embedded") === "1";
  } catch {
    return false;
  }
}
