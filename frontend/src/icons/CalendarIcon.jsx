export default function CalendarIcon({ size = 24, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 28 31"
      fill="none"
      className={className}
    >
      <path
        d="M8.375 1.7085V7.2085M19.375 1.7085V7.2085M1.5 12.7085H26.25M4.25 4.4585H23.5C25.0188 4.4585 26.25 5.68971 26.25 7.2085V26.4585C26.25 27.9773 25.0188 29.2085 23.5 29.2085H4.25C2.73122 29.2085 1.5 27.9773 1.5 26.4585V7.2085C1.5 5.68971 2.73122 4.4585 4.25 4.4585Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
