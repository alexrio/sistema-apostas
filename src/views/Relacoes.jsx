import React, { useEffect, useState } from 'react';
import Card from '../components/ui/card';
import { Button } from '../components/ui/button';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useApp } from '../context/AppProvider';
import { canWrite } from '../utils/roles';

export default function Relacoes(){
  const {supa}=useApp()
  const [champs,setChamps]=useState([]),[teams,setTeams]=useState([]),[rows,setRows]=useState([])
  const [form,setForm]=useState({championship_id:'',team_id:''})
  const [readonly,setReadonly]=useState(false)

  const load=async()=>{ const {data}=await supa.from('championship_teams').select('id,championship_id,team_id'); setRows(data||[]) }
  useEffect(()=>{ 
    supa.from('championships').select('id,name').order('name').then(({data})=>setChamps(data||[]))
    supa.from('teams').select('id,name').order('name').then(({data})=>setTeams(data||[]))
    load(); (async()=>setReadonly(!(await canWrite(supa))))()
  },[])
  const add=async()=>{ try{ const {error}=await supa.from('championship_teams').insert(form); if(error) throw error; setForm({championship_id:'',team_id:''}); load() }catch(err){ alert('Erro: '+err.message) } }
  const del=async id=>{ try{ const {error}=await supa.from('championship_teams').delete().eq('id',id); if(error) throw error; load() }catch(err){ alert('Erro: '+err.message) } }

  return <Card>
    <Breadcrumbs items={[{label:'Início',href:'#/'},{label:'Relação Campeonatos × Times'}]}/>
    <div className="title">Relação Campeonatos × Times</div>
    {readonly && <div className="readonly">Você não tem permissão de escrita.</div>}
    <div className="grid2">
      <div><label className="label">Campeonato</label><select disabled={readonly} className="input" value={form.championship_id} onChange={e=>setForm(v=>({...v,championship_id:e.target.value}))}><option value="">—</option>{champs.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div><label className="label">Time</label><select disabled={readonly} className="input" value={form.team_id} onChange={e=>setForm(v=>({...v,team_id:e.target.value}))}><option value="">—</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
    </div>
    <div style={{marginTop:8}}><Button disabled={readonly} onClick={add}>Vincular</Button></div>
    <hr className="sep"/>
    <table className="table"><thead><tr><th>Campeonato</th><th>Time</th><th style={{width:120}}>Ações</th></tr></thead>
      <tbody>{rows.map(r=><tr key={r.id}>
        <td>{champs.find(c=>c.id===r.championship_id)?.name||r.championship_id}</td>
        <td>{teams.find(t=>t.id===r.team_id)?.name||r.team_id}</td>
        <td><Button variant="outline" disabled={readonly} onClick={()=>del(r.id)}>Remover</Button></td>
      </tr>)}
      {rows.length===0&&<tr><td colSpan="3">Sem vínculos.</td></tr>}
      </tbody>
    </table>
  </Card>
}
