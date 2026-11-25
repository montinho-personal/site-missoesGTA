// Preferências guardadas só no aparelho do jogador (localStorage). Nada vai para servidor.
const read = <T,>(k: string, fallback: T): T => {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const emit = (name: string) => window.dispatchEvent(new Event(name));

export const favs = {
  all: () => read<string[]>("gs:favs", []),
  has: (id: string) => favs.all().includes(id),
  toggle(id: string) {
    const cur = favs.all();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    write("gs:favs", next); emit("gs:favs");
    return next.includes(id);
  },
};

export const history = {
  enabled: () => read<boolean>("gs:hist-on", false),
  setEnabled(v: boolean) { write("gs:hist-on", v); if (!v) write("gs:hist", []); emit("gs:hist"); },
  all: () => (history.enabled() ? read<string[]>("gs:hist", []) : []),
  add(term: string) {
    if (!history.enabled()) return;
    const t = term.trim(); if (t.length < 2) return;
    write("gs:hist", [t, ...read<string[]>("gs:hist", []).filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6));
  },
  clear() { write("gs:hist", []); emit("gs:hist"); },
};

export const spoilers = {
  isOn: () => document.documentElement.dataset.spoilers !== "off",
  set(on: boolean) {
    document.documentElement.dataset.spoilers = on ? "on" : "off";
    try { localStorage.setItem("gs:spoilers", on ? "on" : "off"); } catch {}
    emit("gs:spoilers");
  },
};
