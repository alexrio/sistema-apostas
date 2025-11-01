import React, { useEffect, useState } from 'react';
import Card from '../components/ui/card';
import { Button } from '../components/ui/button';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useApp } from '../context/AppProvider';
import { canAdmin } from '../utils/roles';
import { Input } from '../components/ui/input';
import { formatMatchName } from '../utils/format';

export default function EstatisticasJogador(){
  const {supa}=useApp()
  const [matches,setMatches]=useState([]),[sel,setSel]=useState('')
  const [teamsAll,setTeamsAll]=useState([])
  const [teams,setTeams]=useState([]),[players,setPlayers]=useState([])
  const [rows,setRows]=useState([]),[msg,setMsg]=useState('')
  const [isAdmin,setIsAdmin]=useState(false)

  useEffect(()=>{ 
    supa.from('matches').select('id,home_team_id,away_team_id,starts_at').order('starts_at',{ascending:false}).then(({data})=>setMatches(data||[]))
    supa.from('teams').select('id,name').order('name').then(({data})=>setTeamsAll(data||[]))
    ;(async()=>{ setIsAdmin(await canAdmin(supa)) })()
  },[])

  useEffect(()=>{ 
    const load=async()=>{
      setPlayers([]); setRows([]); setTeams([]); setMsg(''); 
      if(!sel) return

      const {data:m}=await supa.from('matches').select('*').eq('id',sel).single()
      const ids=[m.home_team_id,m.away_team_id]

      const {data:ts}=await supa.from('teams').select('id,name').in('id',ids)
      setTeams(ts||[])

      const {data:ps}=await supa.from('players').select('id,name,team_id,position').in('team_id',ids).order('name')
      setPlayers(ps||[])

      const {data:s}=await supa.from('player_match_stats')
        .select('match_id,player_id,shots,shots_on_target,goals,cards_yellow,cards_red,fouls,tackles')
        .eq('match_id',sel)

      const map=Object.fromEntries((s||[]).map(r=>[r.player_id,r]))

      setRows((ps||[]).map(p=>({
        match_id:sel, player_id:p.id,
        shots:            map[p.id]?.shots||0,
        shots_on_target:  map[p.id]?.shots_on_target||0,
        goals:            map[p.id]?.goals||0,
        cards_yellow:     map[p.id]?.cards_yellow||0,
        cards_red:        map[p.id]?.cards_red||0,
        fouls:            map[p.id]?.fouls||0,
        tackles:          map[p.id]?.tackles||0
      })))
    }; 
    load() 
  },[sel])

  const upd=(pid,k,v)=>setRows(rs=>rs.map(r=>r.player_id===pid?{...r,[k]:Number(v)||0}:r))

  const save=async()=>{
    if(!isAdmin){ setMsg('Somente administradores podem salvar.'); return; }
    setMsg('Salvando...')
    try{
      const {error}=await supa.from('player_match_stats').upsert(rows,{onConflict:'match_id,player_id'})
      if(error){
        const clean=(error.message||'').toLowerCase().includes('row-level security')
          ? 'Você não tem permissão para salvar (somente administradores).'
          : 'Erro: '+error.message
        setMsg(clean);
      }else{
        setMsg('Salvo!');
      }
    }catch(e){
      const clean=(e.message||'').toLowerCase().includes('row-level security')
        ? 'Você não tem permissão para salvar (somente administradores).'
        : 'Erro: '+(e.message||'desconhecido')
      setMsg(clean);
    }
  }

  return <Card>
    <Breadcrumbs items={[{label:'Início',href:'#/'},{label:'Estatísticas (Jogadores)'}]}/>
    <div className="title">Estatísticas — Jogadores</div>
    {!isAdmin && <div className="readonly">Somente administradores podem editar. Você está em modo leitura.</div>}
    <div className="row">
      <label className="label">Jogo</label>
      <select className="input" value={sel} onChange={e=>setSel(e.target.value)}>
        <option value="">Selecione...</option>
        {matches.map(m=><option key={m.id} value={m.id}>{formatMatchName(m, teamsAll)}</option>)}
      </select>
    </div>

    {sel&&<>
      <table className="table">
        <thead>
          <tr>
            <th>Jogador</th><th>Time</th><th>Posição</th>
            <th>Finalizações</th>
            <th>No alvo</th>
            <th>Gols</th>
            <th>Amarelos</th>
            <th>Vermelhos</th>
            <th>Faltas</th>
            <th>Desarmes</th>
          </tr>
        </thead>
        <tbody>
          {players.map(p=>{
            const nm=teams.find(t=>t.id===p.team_id)?.name||p.team_id
            const r = rows.find(x=>x.player_id===p.id) || {
              shots:0,shots_on_target:0,goals:0,cards_yellow:0,cards_red:0,fouls:0,tackles:0
            }
            return <tr key={p.id}>
              <td>{p.name}</td>
              <td>{nm}</td>
              <td>{p.position||'—'}</td>
              <td><Input type="number" disabled={!isAdmin} value={r.shots} onChange={e=>upd(p.id,'shots',e.target.value)}/></td>
              <td><Input type="number" disabled={!isAdmin} value={r.shots_on_target} onChange={e=>upd(p.id,'shots_on_target',e.target.value)}/></td>
              <td><Input type="number" disabled={!isAdmin} value={r.goals} onChange={e=>upd(p.id,'goals',e.target.value)}/></td>
              <td><Input type="number" disabled={!isAdmin} value={r.cards_yellow} onChange={e=>upd(p.id,'cards_yellow',e.target.value)}/></td>
              <td><Input type="number" disabled={!isAdmin} value={r.cards_red} onChange={e=>upd(p.id,'cards_red',e.target.value)}/></td>
              <td><Input type="number" disabled={!isAdmin} value={r.fouls} onChange={e=>upd(p.id,'fouls',e.target.value)}/></td>
              <td><Input type="number" disabled={!isAdmin} value={r.tackles} onChange={e=>upd(p.id,'tackles',e.target.value)}/></td>
            </tr>
          })}
          {players.length===0&&<tr><td colSpan="10">Cadastre os jogadores dos dois times.</td></tr>}
        </tbody>
      </table>

      <div style={{display:'flex',gap:8,marginTop:8}}>
        <Button onClick={save} disabled={!isAdmin}>Salvar</Button>
        <div className="badge">{msg}</div>
      </div>
    </>}
  </Card>
}
