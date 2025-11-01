import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useApp } from '../../context/AppProvider';
import { roleLabel } from '../../utils/roles';

export default function Topbar(){
  const {supa}=useApp();
  const [me,setMe]=useState(null);
  const [avatar,setAvatar]=useState('');
  const [role,setRole]=useState('apostador');

  useEffect(()=>{ (async()=>{
    const {data:{user}}=await supa.auth.getUser();
    if(!user) return;
    await supa.from('profiles').upsert({ id:user.id, email:user.email }, { onConflict:'id' });
    const {data}=await supa.from('profiles').select('*').eq('id',user.id).single();
    setMe(data);
    setAvatar(data?.avatar_url || '');
    setRole(data?.role || 'apostador');
  })() },[]);

  const initial = (me?.full_name || me?.email || 'U').slice(0,1).toUpperCase();

  return (
    <div className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div>
        <div className="title">Painel — Sistema de Apostas</div>
        <div className="sub">Cadastro de entidades, jogos, estatísticas e análises</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <a href="#/perfil" title="Meu perfil" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none',color:'inherit'}}>
          <div className="avatar" style={{width:36,height:36,borderRadius:'50%',overflow:'hidden',display:'grid',placeItems:'center',background:'#e5e7eb'}}>
            {avatar
              ? <img src={avatar} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              : <span style={{fontWeight:600,color:'#374151'}}>{initial}</span>}
          </div>
          <div style={{display:'flex',flexDirection:'column',lineHeight:1}}>
            <span className="badge">{me?.full_name || 'Meu perfil'}</span>
            <span style={{fontSize:12,color:'#6b7280',marginTop:2}}>{roleLabel(role)}</span>
          </div>
        </a>
        <Button variant="outline" onClick={()=>supa.auth.signOut()}>Sair</Button>
      </div>
    </div>
  );
}
