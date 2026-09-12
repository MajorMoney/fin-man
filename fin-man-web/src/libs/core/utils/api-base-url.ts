/** API origin for the Nest backend. Uses the page host so LAN access to the Pi works. */
export function getApiBaseUrl(): string {
  const hostname =
    typeof window !== 'undefined' && window.location?.hostname
      ? window.location.hostname
      : 'localhost';
  return `http://${hostname}:3000`;
}
