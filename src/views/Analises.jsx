import React, { useEffect, useState } from 'react';
import Card from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useApp } from '../context/AppProvider';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

async function teamAverages(supa, teamId, n){
  const N=Math.max(1,Math.min(10, n||5))
  const {data:matches, error:mErr}=await supa
    .from('matches')
    .select('id,starts_at,home_team_id,away_team_id')
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order('starts_at',{ascending:false})
    .limit(N)
  if(mErr) throw mErr
  if(!matches?.length) return []
  const ids=matches.map(m=>m.id)
  const {data:stats, error:sErr}=await supa
    .from('team_match_stats')
    .select('match_id,team_id,corners,shots,goals,cards_yellow,cards_red')
    .in('match_id',ids).eq('team_id',teamId)
  if(sErr) throw sErr
  const byMatch=Object.fromEntries(matches.map(m=>[m.id,m]))
  return (stats||[])
    .map(s=>({ date:new Date(byMatch[s.match_id].starts_at), corners:+(s.corners||0), shots:+(s.shots||0), goals:+(s.goals||0), cards_yellow:+(s.cards_yellow||0), cards_red:+(s.cards_red||0) }))
    .sort((a,b)=>a.date-b.date)
    .map(r=>({...r, date:r.date.toLocaleDateString()}))
}

export default function Analises(){
  const {supa}=useApp()
  const [teams,setTeams]=useState([]),[team,setTeam]=useState(''),[N,setN]=useState(5)
  const [loading,setLoading]=useState(false),[rows,setRows]=useState([]),[err,setErr]=useState(''),[metrics,setMetrics]=useState({corners:true,shots:true,goals:true,cards_yellow:false,cards_red:false})

  useEffect(()=>{ supa.from('teams').select('id,name').order('name').then(({data})=>setTeams(data||[])) },[])
  const toggle=k=>setMetrics(v=>({...v,[k]:!v[k]}))
  const run=async()=>{ setErr(''); setRows([]); if(!team){setErr('Selecione um time para analisar.'); return}
    setLoading(true); try{ const data=await teamAverages(supa,team,N); setRows(data); if(!data.length) setErr('Sem dados para os últimos jogos deste time.') } catch(e){ setErr(e.message||'Erro ao calcular análises.') } finally{ setLoading(false) } }

  return <Card>
    <Breadcrumbs items={[{label:'Início',href:'#/'},{label:'Análises'}]}/>
    <div className="title">Análises — Séries dos últimos jogos</div>
    <div className="grid2" style={{marginTop:8}}>
      <div><label className="label">Time</label><select className="input" value={team} onChange={e=>setTeam(e.target.value)}><option value="">—</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      <div><label className="label">Qtd. jogos (1–10)</label><Input type="number" min="1" max="10" value={N} onChange={e=>setN(Math.max(1,Math.min(10,Number(e.target.value)||5)))}/></div>
    </div>
    <div style={{marginTop:8,display:'flex',gap:8,flexWrap:'wrap'}}>
      <Button onClick={run} disabled={!team||loading}>{loading?'Calculando…':'Calcular'}</Button>
      <span className="badge">Métricas:</span>
      {[
        ['corners','Escanteios'],['shots','Finalizações'],['goals','Gols'],['cards_yellow','Amarelos'],['cards_red','Vermelhos']
      ].map(([k,label])=><label key={k} className="badge" style={{cursor:'pointer'}}><input type="checkbox" checked={!!metrics[k]} onChange={()=>toggle(k)} style={{marginRight:6}}/>{label}</label>)}
    </div>
    {err && <div className="card" style={{marginTop:10,borderStyle:'dashed',color:'#475569'}}>{err}</div>}
    {loading && <div className="card" style={{marginTop:10}}>Carregando dados…</div>}
    {!loading && rows.length>0 && <>
      <hr className="sep"/>
      <div style={{width:'100%',height:320}}>
        <ResponsiveContainer>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis allowDecimals={false}/><Tooltip/>
            {metrics.corners && <Line type="monotone" dataKey="corners"/>}
            {metrics.shots && <Line type="monotone" dataKey="shots"/>}
            {metrics.goals && <Line type="monotone" dataKey="goals"/>}
            {metrics.cards_yellow && <Line type="monotone" dataKey="cards_yellow"/>}
            {metrics.cards_red && <Line type="monotone" dataKey="cards_red"/>}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>}
  </Card>
}
