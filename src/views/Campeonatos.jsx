import React, { useEffect, useState } from 'react';
import Card from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Breadcrumbs from '../components/common/Breadcrumbs';
import CSVUpload from '../components/common/CSVUpload';
import { useApp } from '../context/AppProvider';
import { canWrite } from '../utils/roles';

export default function Campeonatos(){
  const {supa}=useApp(); const [items,setItems]=useState([]); const [readonly,setReadonly]=useState(false);
  const [form,setForm]=useState({id:null,name:'',country:''});
  const load=async()=>{ const {data}=await supa.from('championships').select('*').order('name',{ascending:true}); setItems(data||[]) }
  useEffect(()=>{ load(); (async()=>setReadonly(!(await canWrite(supa))))() },[]);
  const save=async e=>{ e.preventDefault(); try{
    if(form.id){ const {error}=await supa.from('championships').update({name:form.name,country:form.country}).eq('id',form.id); if(error) throw error }
    else{ const {error}=await supa.from('championships').insert({name:form.name,country:form.country}); if(error) throw error }
    setForm({id:null,name:'',country:''}); load()
  }catch(err){ alert('Erro: '+err.message) } }
  const del=async id=>{ try{ const {error}=await supa.from('championships').delete().eq('id',id); if(error) throw error; load() }catch(err){ alert('Erro: '+err.message) } }
  const importCSV=rows=>{ rows.filter(r=>r.name).forEach(async r=>{ await supa.from('championships').insert({name:r.name,country:r.country||null}) }); load() }
  return <Card>
    <Breadcrumbs items={[{label:'Início',href:'#/'},{label:'Campeonatos'}]}/>
    <div className="title">Campeonatos</div>
    {readonly && <div className="readonly">Você não tem permissão de escrita.</div>}
    <div className="grid3">
      <div><label className="label">Nome</label><Input disabled={readonly} value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></div>
      <div><label className="label">País</label><Input disabled={readonly} value={form.country} onChange={e=>setForm(v=>({...v,country:e.target.value}))}/></div>
      <div style={{display:'flex',alignItems:'end'}}><Button disabled={readonly} onClick={save}>{form.id?'Atualizar':'Adicionar'}</Button></div>
    </div>
    <hr className="sep"/>
    <div style={{display:'flex',gap:12,alignItems:'center'}}><span className="label">Importar CSV</span><CSVUpload onRows={importCSV}/></div>
    <table className="table"><thead><tr><th>Nome</th><th>País</th><th style={{width:160}}>Ações</th></tr></thead>
      <tbody>{items.map(i=><tr key={i.id}>
        <td>{i.name}</td><td>{i.country||'—'}</td>
        <td><Button variant="outline" disabled={readonly} onClick={()=>setForm({id:i.id,name:i.name,country:i.country||''})}>Editar</Button> <Button variant="outline" disabled={readonly} onClick={()=>del(i.id)}>Excluir</Button></td>
      </tr>)}
      {items.length===0&&<tr><td colSpan="3">Sem dados.</td></tr>}
      </tbody>
    </table>
  </Card>
}
