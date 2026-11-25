// Ícones próprios (traço 1.75, grade 24). Nada de bibliotecas nem de arte de terceiros.
const paths: Record<string, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h10" /></>,
  close: <><path d="M6 6l12 12M18 6 6 18" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  chevron: <><path d="m9 6 6 6-6 6" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
  door: <><path d="M6 21V4.5L15 3v18M15 6h3v15M3 21h18" /><circle cx="11.5" cy="12.5" r=".8" fill="currentColor" /></>,
  egg: <><path d="M12 3c3.5 0 6.5 5.2 6.5 10a6.5 6.5 0 0 1-13 0C5.5 8.2 8.5 3 12 3Z" /><path d="m6.5 12 2.5 2 3-2.5 3 2.5 2.5-2" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.75" /></>,
  cash: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.75" /><path d="M6 9.5v5M18 9.5v5" /></>,
  car: <><path d="M3 16v-3.5l2.2-5A2 2 0 0 1 7 6.3h10a2 2 0 0 1 1.8 1.2l2.2 5V16M3 16h18M3 16v2.5h3V16M18 16v2.5h3V16M4.5 12.5h15" /><circle cx="7.5" cy="14.3" r=".8" fill="currentColor" /><circle cx="16.5" cy="14.3" r=".8" fill="currentColor" /></>,
  crate: <><path d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16V8Z" /><path d="M3.5 8 12 12.5 20.5 8M12 12.5v8" /></>,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><path d="m14 17 2.2 2.2 4.3-4.7" /></>,
  bulb: <><path d="M9 17.5h6M10 20.5h4M8.5 14.5A6 6 0 1 1 15.5 14.5c-.6.5-1 1.2-1 2v1h-5v-1c0-.8-.4-1.5-1-2Z" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>,
  pin: <><path d="M12 21.5s7-6.3 7-11.5a7 7 0 1 0-14 0c0 5.2 7 11.5 7 11.5Z" /><circle cx="12" cy="10" r="2.5" /></>,
  star: <><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8L12 3.5Z" /></>,
  share: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" /></>,
  shield: <><path d="M12 3 4.5 6v5.5c0 4.5 3 8 7.5 9.5 4.5-1.5 7.5-5 7.5-9.5V6L12 3Z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  file: <><path d="M6 3h8l4 4v14H6V3Z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>,
  flag: <><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></>,
  phone: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></>,
  check: <><path d="m5 12.5 4.5 4.5L19 7.5" /></>,
  eyeoff: <><path d="M3 3l18 18M10 6c.6-.3 1.3-.5 2-.5 6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.7M6.3 7.7A16 16 0 0 0 2.5 12S6 18.5 12 18.5c1.5 0 2.9-.4 4.1-1" /><path d="M9.9 10a2.75 2.75 0 0 0 3.9 3.9" /></>,
  radar: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><path d="M12 12 18.5 5.5" /><circle cx="16" cy="14.5" r="1" fill="currentColor" /></>,
  users: <><circle cx="9" cy="8.5" r="3.25" /><path d="M2.5 19.5c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5M16 5.5a3.25 3.25 0 0 1 0 6.3M18 14.3c2 .7 3.2 2.4 3.5 5.2" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" /><circle cx="12" cy="7.8" r=".9" fill="currentColor" /></>,
};

export function Icon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
      {paths[name] ?? paths.compass}
    </svg>
  );
}
