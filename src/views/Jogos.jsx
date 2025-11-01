import React, { useEffect, useState } from 'react';
import Card from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useApp } from '../context/AppProvider';
import { canWrite } from '../utils/roles';
import { localInputToUTCISOString, utcToLocalInput } from '../utils/date';
import { formatMatchName } from '../utils/format';

export default function Jogos(){
  const {supa}=useApp()
  const [champs,setChamps]=useState([]),[teams,setTeams]=useState([]),[items,setItems]=useState([])
  const [form,setForm]=useState({id:null,championship_id:'',home_team_id:'',away_team_id:'',starts_at:''})
  const [readonly,setReadonly]=useState(false)
  const load=async()=>{ const {data}=await supa.from('matches').select('*').order('starts_at',{ascending:false}); setItems(data||[]) }
  useEffect(()=>{ 
    supa.from('championships').select('id,name').order('name').then(({data})=>setChamps(data||[]))
    supa.from('teams').select('id,name').order('name').then(({data})=>setTeams(data||[]))
    load(); (async()=>setReadonly(!(await canWrite(supa))))()
  },[])
  const save=async e=>{ e.preventDefault(); try{
    const p={championship_id:form.championship_id||null, home_team_id:form.home_team_id, away_team_id:form.away_team_id, starts_at: localInputToUTCISOString(form.starts_at)}
    if(form.id){ const {error}=await supa.from('matches').update(p).eq('id',form.id); if(error) throw error }
    else{ const {error}=await supa.from('matches').insert(p); if(error) throw error }
    setForm({id:null,championship_id:'',home_team_id:'',away_team_id:'',starts_at:''}); load()
  }catch(err){ alert('Erro: '+err.message) } }
  const del=async id=>{ try{ const {error}=await supa.from('matches').delete().eq('id',id); if(error) throw error; load() }catch(err){ alert('Erro: '+err.message) } }
  return <Card>
    <Breadcrumbs items={[{label:'Início',href:'#/'},{label:'Jogos'}]}/>
    <div className="title">Jogos</div>
    {readonly && <div className="readonly">Você não tem permissão de escrita.</div>}
    <div className="grid2">
      <div><label className="label">Campeonato</label><select disabled={readonly} className="input" value={form.championship_id} onChange={e=>setForm(v=>({...v,championship_id:e.target.value}))}><option value="">—</option>{champs.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div><label className="label">Início (local → salva UTC)</label><Input disabled={readonly} type="datetime-local" value={form.starts_at} onChange={e=>setForm(v=>({...v,starts_at:e.target.value}))}/></div>
      <div><label className="label">Time casa</label><select disabled={readonly} className="input" value={form.home_team_id} onChange={e=>setForm(v=>({...v,home_team_id:e.target.value}))}><option value="">—</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      <div><label className="label">Time fora</label><select disabled={readonly} className="input" value={form.away_team_id} onChange={e=>setForm(v=>({...v,away_team_id:e.target.value}))}><option value="">—</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
    </div>
    <div style={{marginTop:8}}><Button disabled={readonly} onClick={save}>{form.id?'Atualizar':'Criar jogo'}</Button></div>
    <hr className="sep"/>
    <table className="table"><thead><tr><th>Descrição</th><th>Campeonato</th><th style={{width:160}}>Ações</th></tr></thead><tbody>
      {items.map(it=><tr key={it.id}>
        <td>{formatMatchName(it, teams)}</td>
        <td>{champs.find(c=>c.id===it.championship_id)?.name||'—'}</td>
        <td><Button variant="outline" disabled={readonly} onClick={()=>setForm({id:it.id, championship_id:it.championship_id||'', home_team_id:it.home_team_id, away_team_id:it.away_team_id, starts_at: utcToLocalInput(it.starts_at) })}>Editar</Button> <Button variant="outline" disabled={readonly} onClick={()=>del(it.id)}>Excluir</Button></td>
      </tr>)}
      {items.length===0&&<tr><td colSpan="3">Sem jogos.</td></tr>}
    </tbody></table>
  </Card>
}
