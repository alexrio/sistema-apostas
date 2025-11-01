import React, { createContext, useContext, useState } from 'react';
import { getClient, setConfig } from '../lib/supabase';

const Ctx = createContext(null);
export const useApp = ()=>useContext(Ctx);

export function Provider({children}){
  const [supa,setSupa]=useState(getClient());
  const [toasts,setToasts]=useState([]);
  const toast=(msg,type='ok')=>{ const id=Date.now()+Math.random(); setToasts(t=>[...t,{id,msg,type}]); setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500) };
  return <Ctx.Provider value={{supa,setSupa,toast}}>
    {children}
    <div className="toast">{toasts.map(t=><div key={t.id} className={`t ${t.type}`}>{t.msg}</div>)}</div>
  </Ctx.Provider>
}
