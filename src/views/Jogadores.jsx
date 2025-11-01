import React, { useEffect, useState } from 'react';
import Card from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Breadcrumbs from '../components/common/Breadcrumbs';
import CSVUpload from '../components/common/CSVUpload';
import { useApp } from '../context/AppProvider';
import { canWrite } from '../utils/roles';

/* ========= Jogadores (CRUD v2 — avatar + número) ========= */
const POSICOES = [
  'Goleiro','Zagueiro','Lateral','Volante','Meia-atacante','Ponta','Atacante','Centroavante'
];

export default function Jogadores(){
  const {supa}=useApp();
  const [readonly,setReadonly]=useState(false);

  const [teams,setTeams]=useState([]);
  const [items,setItems]=useState([]);
  const [q,setQ]=useState('');

  const [form,setForm]=useState({
    id:null,
    team_id:'',
    name:'',
    position:'Atacante',
    number:'',
    avatar_url:''
  });

  const load = async ()=>{
    let qry = supa
      .from('players')
      .select('id,team_id,name,position,number,avatar_url,created_at')
      .order('name',{ascending:true});

    if(q.trim()){
      qry = qry.or(`name.ilike.%${q.trim()}%,position.ilike.%${q.trim()}%`);
    }
    const {data} = await qry;
    setItems(data||[]);
  };

  useEffect(()=>{
    supa.from('teams').select('id,name').order('name').then(({data})=>setTeams(data||[]));
    (async()=>setReadonly(!(await canWrite(supa))))();
    load();
  },[]);

  const onUploadAvatar = async (file)=>{
    if(!file){ return }
    const path = `player_${Date.now()}_${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()||'jpg'}`
    const {error} = await supa.storage.from('avatars').upload(path, file, {upsert:false})
    if(error){ alert('Upload falhou: '+error.message); return }
    const {data} = supa.storage.from('avatars').getPublicUrl(path)
    setForm(v=>({...v, avatar_url: data.publicUrl }))
  };

  const save = async (e)=>{
    e.preventDefault();
    try{
      if(!form.team_id || !form.name) throw new Error('Selecione um time e informe o nome.');
      const payload = {
        team_id: form.team_id || null,
        name: form.name.trim(),
        position: form.position,
        number: form.number ? Number(form.number) : null,
        avatar_url: form.avatar_url || null
      };
      if(form.id){
        const {error} = await supa.from('players').update(payload).eq('id',form.id);
        if(error) throw error;
      }else{
        const {error} = await supa.from('players').insert(payload);
        if(error) throw error;
      }
      setForm({id:null, team_id:'', name:'', position:'Atacante', number:'', avatar_url:''});
      load();
    }catch(err){ alert('Erro: '+err.message); }
  };

  const del = async (id)=>{
    try{
      const {error} = await supa.from('players').delete().eq('id',id);
      if(error) throw error;
      load();
    }catch(err){ alert('Erro: '+err.message); }
  };

  const importCSV = async (rows)=>{
    for(const r of rows){
      const name = (r.name||'').trim();
      const position = POSICOES.includes(r.position) ? r.position : 'Atacante';
      let team_id = r.team_id || null;
      if(!team_id && r.team_name){
        const t = teams.find(t=>t.name?.toLowerCase() === String(r.team_name).toLowerCase());
        if(t) team_id = t.id;
      }
      const number = r.number ? Number(r.number) : null;
      const avatar_url = r.avatar_url || null;
      if(!name || !team_id) continue;
      await supa.from('players').insert({ name, team_id, position, number, avatar_url });
    }
    load();
  };

  const startEdit = (i)=>{
    setForm({
      id:i.id,
      team_id:i.team_id||'',
      name:i.name||'',
      position:i.position||'Atacante',
      number: i.number ?? '',
      avatar_url: i.avatar_url || ''
    });
  };

  return <Card>
    <Breadcrumbs items={[{label:'Início',href:'#/'},{label:'Jogadores'}]}/>
    <div className="title">Jogadores</div>
    {readonly && <div className="readonly">Você não tem permissão de escrita.</div>}

    {/* Filtro */}
    <div className="row" style={{alignItems:'end', gap:12}}>
      <div style={{flex:1}}>
        <label className="label">Buscar (nome/posição)</label>
        <Input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') load() }}/>
      </div>
      <Button variant="outline" onClick={load}>Filtrar</Button>
    </div>

    {/* Formulário */}
    <div className="grid4" style={{marginTop:10, alignItems:'end'}}>
      <div>
        <label className="label">Time</label>
        <select className="input" disabled={readonly}
          value={form.team_id}
          onChange={e=>setForm(v=>({...v,team_id:e.target.value}))}>
          <option value="">—</option>
          {teams.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Nome</label>
        <Input disabled={readonly} value={form.name}
               onChange={e=>setForm(v=>({...v,name:e.target.value}))}/>
      </div>
      <div>
        <label className="label">Posição</label>
        <select className="input" disabled={readonly}
          value={form.position}
          onChange={e=>setForm(v=>({...v,position:e.target.value}))}>
          {POSICOES.map(p=> <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Número</label>
        <Input type="number" min="0" disabled={readonly}
               value={form.number}
               onChange={e=>setForm(v=>({...v,number:e.target.value}))}/>
      </div>
    </div>

    <div className="row" style={{marginTop:10, alignItems:'center', gap:12}}>
      <div>
        <label className="label">Avatar</label>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div className="avatar sm">{form.avatar_url ? <img src={form.avatar_url} alt=""/> : null}</div>
          <input type="file" accept="image/*" disabled={readonly}
                 onChange={e=>onUploadAvatar(e.target.files?.[0])}/>
        </div>
      </div>
      <div style={{marginLeft:'auto'}}>
        <Button disabled={readonly} onClick={save}>{form.id?'Atualizar':'Adicionar'}</Button>
      </div>
    </div>

    <hr className="sep"/>

    {/* Import CSV */}
    <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
      <span className="label">Importar CSV</span>
      <CSVUpload onRows={importCSV}/>
      <span className="sub">
        Colunas: <code>name</code>, <code>team_name</code> (ou <code>team_id</code>), <code>position</code>, <code>number</code>, <code>avatar_url</code>
      </span>
    </div>

    {/* Tabela */}
    <table className="table" style={{marginTop:10}}>
      <thead>
        <tr>
          <th>Avatar</th>
          <th>Nome</th>
          <th>Time</th>
          <th>Posição</th>
          <th className="num" style={{width:80}}>Nº</th>
          <th style={{width:180}}>Ações</th>
        </tr>
      </thead>
      <tbody>
        {items.map(i=>{
          const time = teams.find(t=>t.id===i.team_id)?.name || i.team_id;
          return <tr key={i.id}>
            <td>
              <div className="avatar xs">
                {i.avatar_url ? <img src={i.avatar_url} alt=""/> : null}
              </div>
            </td>
            <td>{i.name}</td>
            <td>{time}</td>
            <td>{i.position}</td>
            <td className="num">{i.number ?? '—'}</td>
            <td>
              <Button variant="outline" disabled={readonly}
                onClick={()=>startEdit(i)}>Editar</Button>{' '}
              <Button variant="outline" disabled={readonly}
                onClick={()=>del(i.id)}>Excluir</Button>
            </td>
          </tr>;
        })}
        {items.length===0 && <tr><td colSpan="6">Sem jogadores.</td></tr>}
      </tbody>
    </table>
  </Card>
}
