export default function AppLogo() {
  return (
    <svg
      role="img"
      aria-label="Nextflux"
      viewBox="0 0 32 32"
      className="size-8 shrink-0 text-primary"
    >
      <circle cx="9.5" cy="22.5" r="2" fill="currentColor" />
      <path
        d="M9.5 15a7.5 7.5 0 0 1 7.5 7.5"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".75"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M9.5 8a14.5 14.5 0 0 1 14.5 14.5"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
