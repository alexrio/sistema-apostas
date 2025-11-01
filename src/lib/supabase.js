// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

let client = null;

/**
 * Cria o client priorizando variáveis de ambiente (Vercel).
 * Em produção (import.meta.env.PROD) ignoramos localStorage.
 * Em dev: usa ENV se existir; senão, cai para localStorage (tela de config).
 */
export function getClient() {
  if (client) return client;

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Em produção: **só** ENV (nunca peça config)
  if (import.meta.env.PROD) {
    if (!envUrl || !envKey) {
      // Se faltar em produção, retorna null para você perceber no build/deploy
      return null;
    }
    client = createClient(envUrl, envKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return client;
  }

  // Em desenvolvimento: ENV > localStorage
  const lsUrl = typeof window !== 'undefined' ? localStorage.getItem('sb_url') : null;
  const lsKey = typeof window !== 'undefined' ? localStorage.getItem('sb_key') : null;

  const url = envUrl || lsUrl;
  const key = envKey || lsKey;

  if (!url || !key) return null;

  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}

/**
 * Continua existindo para DEV: salva manualmente em localStorage
 * quando você preenche no formulário de configuração local.
 */
export function setConfig(url, key) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sb_url', url);
    localStorage.setItem('sb_key', key);
  }
  client = null; // força recriar
}
