/** Durata ISO 8601 (`PT1H2M5S`), secondi o `m:ss` → secondi; undefined se non interpretabile. */
export function durationSeconds(value?: string | number | null): number | undefined {
  if (value == null || value === '') return undefined;
  const text = String(value).trim();
  const iso = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/i.exec(text);
  if (iso) return Number(iso[1] ?? 0) * 3600 + Number(iso[2] ?? 0) * 60 + Math.round(Number(iso[3] ?? 0));
  if (/^\d+$/.test(text)) return Number(text);
  const clock = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(text);
  if (clock) return clock[3] ? Number(clock[1]) * 3600 + Number(clock[2]) * 60 + Number(clock[3]) : Number(clock[1]) * 60 + Number(clock[2]);
  return undefined;
}

/** `4:13` o `1:02:05`; undefined senza durata. */
export function formatDuration(value?: string | number | null): string | undefined {
  const total = durationSeconds(value);
  if (total === undefined) return undefined;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Durata in formato ISO 8601 per schema.org. */
export function isoDuration(value?: string | number | null): string | undefined {
  const total = durationSeconds(value);
  if (total === undefined || total <= 0) return undefined;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s || (!h && !m) ? `${s}S` : ''}`;
}
