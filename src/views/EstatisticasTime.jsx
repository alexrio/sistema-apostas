import React, { useEffect, useState } from 'react';
import Card from '../components/ui/card';
import { Button } from '../components/ui/button';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useApp } from '../context/AppProvider';
import { canAdmin } from '../utils/roles';
import { Input } from '../components/ui/input';
import { formatMatchName } from '../utils/format';

export default function EstatisticasTime(){
  const {supa}=useApp()
  const [matches,setMatches]=useState([]),[sel,setSel]=useState('')
  const [teamsAll,setTeamsAll]=useState([])
  const [teams,setTeams]=useState([]),[rows,setRows]=useState([]),[msg,setMsg]=useState('')
  const [isAdmin,setIsAdmin]=useState(false)

  useEffect(()=>{ 
    supa.from('matches').select('id,home_team_id,away_team_id,starts_at').order('starts_at',{ascending:false}).then(({data})=>setMatches(data||[]))
    supa.from('teams').select('id,name').order('name').then(({data})=>setTeamsAll(data||[]))
    ;(async()=>{ setIsAdmin(await canAdmin(supa)) })()
  },[])
  useEffect(()=>{ const load=async()=>{ setRows([]); setTeams([]); setMsg(''); if(!sel) return
    const {data:m}=await supa.from('matches').select('*').eq('id',sel).single(); const ids=[m.home_team_id,m.away_team_id]
    const {data:ts}=await supa.from('teams').select('id,name').in('id',ids); setTeams(ts||[])
    const {data:s}=await supa.from('team_match_stats').select('*').eq('match_id',sel)
    const map=Object.fromEntries((s||[]).map(r=>[r.team_id,r]))
    setRows(ids.map(id=>({match_id:sel,team_id:id,corners:map[id]?.corners||0,shots:map[id]?.shots||0,goals:map[id]?.goals||0,cards_yellow:map[id]?.cards_yellow||0,cards_red:map[id]?.cards_red||0})))
  }; load() },[sel])

  const upd=(i,k,v)=>setRows(rs=>rs.map((r,idx)=>idx===i?{...r,[k]:Number(v)||0}:r))

  const save=async()=>{
    if(!isAdmin){ setMsg('Somente administradores podem salvar.'); return; }
    setMsg('Salvando...');
    try{
      const {error}=await supa.from('team_match_stats').upsert(rows,{onConflict:'match_id,team_id'});
      if(error){
        const clean = (error.message||'').toLowerCase().includes('row-level security')
          ? 'Você não tem permissão para salvar (somente administradores).'
          : ('Erro: '+error.message);
        setMsg(clean);
      }else{ setMsg('Salvo!'); }
    }catch(e){
      const clean = (e.message||'').toLowerCase().includes('row-level security')
        ? 'Você não tem permissão para salvar (somente administradores).'
        : ('Erro: '+(e.message||'desconhecido'));
      setMsg(clean);
    }
  }

  return <Card>
    <Breadcrumbs items={[{label:'Início',href:'#/'},{label:'Estatísticas (Times)'}]}/><div className="title">Estatísticas — Times</div>
    {!isAdmin && <div className="readonly">Somente administradores podem editar. Você está em modo leitura.</div>}
    <div className="row"><label className="label">Jogo</label>
      <select className="input" value={sel} onChange={e=>setSel(e.target.value)}><option value="">Selecione...</option>
        {matches.map(m=><option key={m.id} value={m.id}>{formatMatchName(m, teamsAll)}</option>)}
      </select>
    </div>
    {sel&&<>
      <table className="table"><thead><tr><th>Time</th><th>Escanteios</th><th>Finalizações</th><th>Gols</th><th>Amarelos</th><th>Vermelhos</th></tr></thead>
        <tbody>{rows.map((r,i)=>{ const nm=teams.find(t=>t.id===r.team_id)?.name||r.team_id; return <tr key={r.team_id}>
          <td>{nm}</td>
          <td><Input type="number" disabled={!isAdmin} value={r.corners} onChange={e=>upd(i,'corners',e.target.value)}/></td>
          <td><Input type="number" disabled={!isAdmin} value={r.shots} onChange={e=>upd(i,'shots',e.target.value)}/></td>
          <td><Input type="number" disabled={!isAdmin} value={r.goals} onChange={e=>upd(i,'goals',e.target.value)}/></td>
          <td><Input type="number" disabled={!isAdmin} value={r.cards_yellow} onChange={e=>upd(i,'cards_yellow',e.target.value)}/></td>
          <td><Input type="number" disabled={!isAdmin} value={r.cards_red} onChange={e=>upd(i,'cards_red',e.target.value)}/></td>
        </tr>})}</tbody>
      </table>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <Button onClick={save} disabled={!isAdmin}>Salvar</Button>
        <div className="badge">{msg}</div>
      </div>
    </>}
  </Card>
}
