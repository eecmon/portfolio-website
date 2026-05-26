export function isLocalMode(): boolean {
  return (import.meta.env.VITE_DATA_MODE ?? "api") === "local";
}
