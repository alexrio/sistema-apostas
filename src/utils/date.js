export const pad=n=>String(n).padStart(2,'0');
export function localInputToUTCISOString(localStr){ if(!localStr) return null; const d=new Date(localStr); return d.toISOString() }
export function utcToLocalInput(iso){ if(!iso) return ''; const d=new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}` }
