
export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect width="36" height="36" rx="10" className="fill-zinc-900 dark:fill-zinc-100" />
        <path
          d="M14.5 21.5l7-7M16 12.5l1.2-1.2a4 4 0 015.7 5.7L21.7 18M20 23.5l-1.2 1.2a4 4 0 01-5.7-5.7L14.3 18"
          className="stroke-white dark:stroke-zinc-900"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Snip
      </span>
    </div>
  );
}

