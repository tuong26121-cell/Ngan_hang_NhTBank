// SVG equivalents of the supplied NhTBank 1.1 symbols, independent of system fonts.
const paths = {
  home: "m3 10 9-7 9 7v10H15v-6H9v6H3Z",
  transfer: "M4 8h16m-4-4 4 4-4 4M20 16H4m4-4-4 4 4 4",
  qr: "M3 3h6v6H3Zm12 0h6v6h-6ZM3 15h6v6H3Zm12 0h2v2h-2Zm4 0h2v6h-4v-2h-2",
  history: "M3 10a9 9 0 1 1 2 8M3 4v6h6m3-4v6l4 2",
  profile: "M5 21v-2a7 7 0 0 1 14 0v2ZM16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  send: "m3 11 18-8-8 18-3-8Zm7 2L21 3",
  receive: "M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6",
  savings: "m3 9 9-6 9 6ZM5 10v8m5-8v8m4-8v8m5-8v8M3 21h18",
  wallet: "M3 7h17v13H3V5l14-2v4m-1 5h5v4h-5Z",
  store:
    "M4 10v11h16V10M3 3h18l1 7a3 3 0 0 1-5 2 3 3 0 0 1-5 0 3 3 0 0 1-5 0 3 3 0 0 1-5-2ZM9 21v-6h6v6",
  card: "M3 5h18v14H3ZM3 10h18M6 15h4",
  shield: "m12 3 8 3v5c0 5-8 10-8 10S4 16 4 11V6ZM8 12l3 3 5-6",
  gift: "M3 8h18v4H3Zm2 4v9h14v-9M12 8v13m0-13C3 8 6 0 10 4l2 4c9 0 6-8 2-4Z",
  ticket: "M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4Zm12 0v3m0 3v2m0 3v3",
  star: "m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z",
  goal: "M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5m-5 0 9-9m-4 0h4v4",
};
export function ReferenceIcon({ name, size = 24, className = "" }) {
  return (
    <svg
      className={`reference-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name] || paths.wallet} />
    </svg>
  );
}
export function ReferenceMotif({ className = "" }) {
  return (
    <div className={`reference-motif ${className}`} aria-hidden="true">
      <div className="motif-orbit" />
      <div className="motif-orbit motif-orbit-back" />
      <div className="motif-torus" />
      <div className="motif-bubble motif-bubble-one" />
      <div className="motif-bubble motif-bubble-two" />
      <div className="motif-halo" />
    </div>
  );
}
export function getDisplayMode() {
  const requested = new URLSearchParams(window.location.search).get("view");
  if (requested === "android" || requested === "windows") return requested;
  return /Android\.html$/i.test(window.location.pathname)
    ? "android"
    : "windows";
}
export function DisplaySwitcher() {
  const android = getDisplayMode() === "android";
  return (
    <nav className="display-switcher" aria-label="Chọn bố cục">
      <a href="?view=android" aria-current={android ? "page" : undefined}>
        Điện thoại
      </a>
      <span aria-hidden="true">/</span>
      <a href="?view=windows" aria-current={!android ? "page" : undefined}>
        Máy tính
      </a>
    </nav>
  );
}
