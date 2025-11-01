import React, { useEffect, useState } from 'react';
import Card from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useApp } from '../context/AppProvider';
import CSVUpload from '../components/common/CSVUpload';
import ResultDots from '../components/common/ResultDots';
import { canWrite } from '../utils/roles';

export default function Times(){
  const {supa}=useApp();
  const [tab,setTab]=useState('table');
  const [teams,setTeams]=useState([]);
  const [pageSize,setPageSize]=useState(10);
  const [page,setPage]=useState(1);
  const totalPages = Math.max(1, Math.ceil(teams.length / pageSize));
  const pageTeams = teams.slice((page-1)*pageSize, (page-1)*pageSize + pageSize);

  const [form,setForm]=useState({id:null,name:'',country:'',crest_url:''});
  const [readonly,setReadonly]=useState(false);

  const [champs,setChamps]=useState([]);
  const [champ,setChamp]=useState('');
  const [rank,setRank]=useState([]);
  const [byId,setById]=useState({});

  useEffect(()=>{ setPage(1); }, [pageSize, teams.length]);

  useEffect(()=>{
    (async()=>{
      setReadonly(!(await canWrite(supa)));
      await loadTeams();
      const {data:cs}=await supa.from('championships').select('id,name').order('name');
      setChamps(cs||[]);
    })();
  },[]);

  async function loadTeams(){
    const {data}=await supa.from('teams').select('id,name,country,crest_url').order('name');
    setTeams(data||[]);
    setById(Object.fromEntries((data||[]).map(t=>[t.id,t])));
  }

  const save=async e=>{
    e.preventDefault();
    try{
      const payload={name:form.name,country:form.country,crest_url:form.crest_url||null};
      if(form.id){
        const {error}=await supa.from('teams').update(payload).eq('id',form.id);
        if(error) throw error;
      }else{
        const {error}=await supa.from('teams').insert(payload);
        if(error) throw error;
      }
      setForm({id:null,name:'',country:'',crest_url:''});
      await loadTeams();
    }catch(err){ alert('Erro: '+err.message); }
  };
  const del=async id=>{
    try{
      const {error}=await supa.from('teams').delete().eq('id',id);
      if(error) throw error;
      await loadTeams();
    }catch(err){ alert('Erro: '+err.message); }
  };

  const uploadCrest=async file=>{
    if(!file){ return }
    const path=`${Date.now()}-${file.name}`;
    const {error}=await supa.storage.from('team-crests').upload(path,file,{upsert:true});
    if(error){ alert('Upload falhou: '+error.message); return }
    const {data}=supa.storage.from('team-crests').getPublicUrl(path);
    setForm(v=>({...v,crest_url:data.publicUrl}));
  };

  useEffect(()=>{ setPage(1); }, [pageSize, teams.length]);

  useEffect(()=>{
    (async()=>{
      if(!champ){ setRank([]); return }
      const {data:st}=await supa
        .from('standings_view')
        .select('team_id, played, wins, draws, losses, goals_for, goals_against, goal_diff, points, last5')
        .eq('championship_id',champ);

      const rows=(st||[]).sort((a,b)=>{
        if(b.points!==a.points) return b.points-a.points;
        if(b.goal_diff!==a.goal_diff) return b.goal_diff-a.goal_diff;
        if(b.goals_for!==a.goals_for) return b.goals_for-a.goals_for;
        const an=(byId[a.team_id]?.name||'').localeCompare(byId[b.team_id]?.name||'');
        return an;
      });
      setRank(rows);
    })();
  },[champ,byId]);

  return <Card>
    <Breadcrumbs items={[{label:'Início',href:'#/'},{label:'Times'}]}/>
    <div className="title">Times</div>

    <div className="tabs">
      <Button variant={tab==='table'?'':'outline'} onClick={()=>setTab('table')}>Cadastro</Button>
      <Button variant={tab==='rank'?'':'outline'} onClick={()=>setTab('rank')}>Classificação</Button>
    </div>

    {tab==='table' && <>
      {readonly && <div className="readonly">Você não tem permissão de escrita.</div>}
      <div className="grid3">
        <div>
          <label className="label">Nome</label>
          <Input disabled={readonly} value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/>
        </div>
        <div>
          <label className="label">País</label>
          <Input disabled={readonly} value={form.country} onChange={e=>setForm(v=>({...v,country:e.target.value}))}/>
        </div>
        <div>
          <label className="label">Escudo</label>
          <div className="crest-upload">
            <div className="avatar sm">
              {form.crest_url ? <img src={form.crest_url} alt="" /> : null}
            </div>
            <input type="file" accept="image/*" disabled={readonly} onChange={e=>uploadCrest(e.target.files?.[0])}/>
          </div>
        </div>
      </div>
      <div style={{marginTop:8}}>
        <Button disabled={readonly} onClick={save}>{form.id?'Atualizar':'Adicionar'}</Button>
      </div>
      <hr className="sep"/>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span className="label" style={{margin:0}}>Times por página</span>
          <select className="input" style={{width:90}} value={pageSize} onChange={e=>setPageSize(Number(e.target.value))}>
            <option value={1}>1</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button className="btn-outline" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>Anterior</button>
          <span className="sub">Página {page} de {totalPages}</span>
          <button className="btn-outline" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}>Próxima</button>
        </div>
      </div>


      <table className="table">
        <thead>
          <tr><th>Escudo</th><th>Nome</th><th>País</th><th style={{width:160}}>Ações</th></tr>
        </thead>
        <tbody>
          { pageTeams.map((t)=><tr key={t.id}>
            <td>
              <div className="avatar xs">
                {t.crest_url ? <img src={t.crest_url} alt="" /> : null}
              </div>
            </td>
            <td>{t.name}</td>
            <td>{t.country||'—'}</td>
            <td>
              <Button variant="outline" disabled={readonly}
                onClick={()=>setForm({id:t.id,name:t.name,country:t.country||'',crest_url:t.crest_url||''})}>Editar</Button>{' '}
              <Button variant="outline" disabled={readonly} onClick={()=>del(t.id)}>Excluir</Button>
            </td>
          </tr>)}
          {teams.length===0 && <tr><td colSpan="4">Sem times.</td></tr>}
        </tbody>
      </table>
    </>}

    {tab==='rank' && <>
      <div className="grid2" style={{marginBottom:8}}>
        <div>
          <label className="label">Campeonato</label>
          <select className="input" value={champ} onChange={e=>setChamp(e.target.value)}>
            <option value="">—</option>
            {champs.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {!champ && <div className="card">Selecione um campeonato.</div>}

      {champ && <table className="table rank-table">
        <thead>
          <tr>
            <th>#</th><th>Clube</th>
            <th className="num">Pts</th>
            <th className="num">PJ</th>
            <th className="num">VIT</th><th className="num">E</th><th className="num">DER</th>
            <th className="num">GM</th><th className="num">GC</th><th className="num">SG</th>
            <th>Últimas 5</th>
          </tr>
        </thead>
        <tbody>
          {rank.map((r,idx)=>{
            const t = byId[r.team_id] || {};
            return <tr key={r.team_id}>
              <td className="pos">{idx+1}</td>
              <td>
                <div className="club">
                  <div className="avatar xs">{t.crest_url ? <img src={t.crest_url} alt=""/> : null}</div>
                  <span>{t.name||r.team_id}</span>
                </div>
              </td>
              <td className="num pts"><b>{r.points}</b></td>
              <td className="num"><b>{r.played}</b></td>
              <td className="num">{r.wins}</td>
              <td className="num">{r.draws}</td>
              <td className="num">{r.losses}</td>
              <td className="num">{r.goals_for}</td>
              <td className="num">{r.goals_against}</td>
              <td className="num">{r.goal_diff}</td>
              <td><ResultDots arr={r.last5}/></td>
            </tr>
          })}
          {rank.length===0 && <tr><td colSpan="11">Sem jogos computados para este campeonato.</td></tr>}
        </tbody>
      </table>}
    </>}
  </Card>
}
