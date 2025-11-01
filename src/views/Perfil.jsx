import React, { useEffect, useState } from 'react';
import Card from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useApp } from '../context/AppProvider';

export default function Perfil(){
  const {supa}=useApp()
  const [user,setUser]=useState(null)
  const [form,setForm]=useState({full_name:'',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,avatar_url:''})
  const [email,setEmail]=useState('')
  const [msg,setMsg]=useState('')

  useEffect(()=>{ (async()=>{
    const {data:{user}}=await supa.auth.getUser(); setUser(user); if(!user) return
    setEmail(user.email||'')
    await supa.from('profiles').upsert({id:user.id,email:user.email},{onConflict:'id'})
    const {data}=await supa.from('profiles').select('*').eq('id',user.id).single()
    if(data) setForm({full_name:data.full_name||'', timezone:data.timezone||form.timezone, avatar_url:data.avatar_url||''})
  })() },[])

  const save=async()=>{ if(!user) return
    const payload={id:user.id,email:user.email,full_name:form.full_name,timezone:form.timezone,updated_at:new Date().toISOString(),...(form.avatar_url?{avatar_url:form.avatar_url}:{})}
    const {error}=await supa.from('profiles').upsert(payload,{onConflict:'id'})
    setMsg(error?('Erro ao salvar: '+error.message):'Salvo!')
  }

  const uploadAvatar=async file=>{ if(!file||!user) return
    const path=`${user.id}/${Date.now()}-${file.name}`
    const {error}=await supa.storage.from('avatars').upload(path,file,{upsert:true})
    if(error){ setMsg('Upload falhou: '+error.message); return }
    const {data}=supa.storage.from('avatars').getPublicUrl(path)
    setForm(v=>({...v,avatar_url:data.publicUrl})); setMsg('Foto atualizada!')
  }

  const changePassword=async()=>{ const pwd=prompt('Nova senha (mín 6):'); if(!pwd) return; const {error}=await supa.auth.updateUser({password:pwd}); alert(error?('Erro: '+error.message):'Senha atualizada!') }

  return <Card>
    <Breadcrumbs items={[{label:'Início',href:'#/'},{label:'Perfil'}]}/><div className="title">Meu perfil</div>
    <div className="grid2" style={{alignItems:'start',marginTop:8}}>
      <div>
        <label className="label">E-mail (informativo)</label>
        <Input value={email} readOnly />
        <label className="label" style={{marginTop:8}}>Nome</label>
        <Input value={form.full_name} onChange={e=>setForm(v=>({...v,full_name:e.target.value}))}/>
        <label className="label" style={{marginTop:8}}>Fuso horário</label>
        <Input value={form.timezone} onChange={e=>setForm(v=>({...v,timezone:e.target.value}))}/>
        <div style={{marginTop:10,display:'flex',gap:8}}>
          <Button onClick={save}>Salvar</Button>
          <Button variant="outline" onClick={changePassword}>Alterar senha</Button>
          <div className="badge">{msg}</div>
        </div>
      </div>
      <div>
        <label className="label">Foto (avatar)</label>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div className="avatar avatar-lg">{form.avatar_url?<img src={form.avatar_url} alt=""/>:null}</div>
          <input type="file" accept="image/*" onChange={e=>uploadAvatar(e.target.files?.[0])}/>
        </div>
      </div>
    </div>
  </Card>
}
