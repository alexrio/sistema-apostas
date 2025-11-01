import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useApp } from './AppProvider';

export function useAuth(){
  const {supa}=useApp();
  const [session,setSession]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ if(!supa){setLoading(false);return}
    (async()=>{
      const {data:{session}}=await supa.auth.getSession(); setSession(session);
      const {data:{subscription}}=supa.auth.onAuthStateChange((_e,s)=>setSession(s));
      setLoading(false); return ()=>subscription?.unsubscribe?.();
    })()
  },[supa]);
  return {session,loading};
}

export function Auth(){
  const {supa}=useApp();
  const [mode,setMode]=useState('in'),[email,setEmail]=useState(''),[pwd,setPwd]=useState(''),[err,setErr]=useState('');
  const submit=async e=>{ e.preventDefault(); setErr(''); try{
    if(mode==='in'){ const {error}=await supa.auth.signInWithPassword({email,password:pwd}); if(error) throw error }
    else{ const {error}=await supa.auth.signUp({email,password:pwd}); if(error) throw error }
  }catch(e){ setErr(e.message) } };
  return <div className="center"><Card style={{width:420}}>
    <div className="title">{mode==='in'?'Entrar':'Criar conta'}</div><hr className="sep"/>
    <form className="row" onSubmit={submit}>
      <label className="label">E-mail</label><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
      <label className="label">Senha</label><Input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} required/>
      {err && <div style={{color:'#dc2626'}}>{err}</div>}
      <Button type="submit">{mode==='in'?'Entrar':'Criar conta'}</Button>
    </form>
    <div style={{marginTop:10,fontSize:13}}>
      {mode==='in'?<>Não tem conta? <a href="#" onClick={e=>{e.preventDefault();setMode('up')}}>Criar</a></>:<>Já tem conta? <a href="#" onClick={e=>{e.preventDefault();setMode('in')}}>Entrar</a></>}
    </div>
  </Card></div>;
}
