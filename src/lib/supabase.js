import { createClient } from "@supabase/supabase-js";

let client = null;

export function setConfig(url, key){
  try{
    if(typeof localStorage !== "undefined"){
      if(url) localStorage.setItem("sb_url", url);
      if(key) localStorage.setItem("sb_key", key);
    }
  }catch(_) {}
  client = null; // força recriar com novos dados
}

export function getClient(){
  // Leitura defensiva
  let url = null, key = null;
  try{
    if(typeof localStorage !== "undefined"){
      url = localStorage.getItem("sb_url");
      key = localStorage.getItem("sb_key");
    }
  }catch(_) {}

  if(!url || !key) return null;
  if(client) return client;
  try{
    client = createClient(url, key);
  }catch(e){
    console.error("Falha ao criar cliente Supabase:", e);
    client = null;
  }
  return client;
}
