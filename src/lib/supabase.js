// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

let client = null;

export function getClient() {
  if (client) return client;

  // Em Vite, import.meta.env é substituído em build; vamos garantir que não venha lixo.
  const envUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

  if (import.meta.env.PROD) {
    // Se estiver faltando, loga UMA vez pra facilitar depuração na Vercel
    if (!envUrl || !envKey) {
      // Não imprime valores, só flags
      console.warn('[SUPABASE ENV MISSING IN PROD]', {
        prod: import.meta.env.PROD,
        hasUrl: !!envUrl,
        hasKey: !!envKey,
      });
      return null; // força mostrar erro de config (que é o que você está vendo)
    }
    client = createClient(envUrl, envKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    return client;
  }

  // DEV: ENV > localStorage
  const lsUrl = typeof window !== 'undefined' ? localStorage.getItem('sb_url') : null;
  const lsKey = typeof window !== 'undefined' ? localStorage.getItem('sb_key') : null;

  const url = envUrl || lsUrl;
  const key = envKey || lsKey;

  if (!url || !key) return null;

  client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export function setConfig(url, key) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sb_url', url);
    localStorage.setItem('sb_key', key);
  }
  client = null;
}
