// src/App.jsx
import React, { useEffect } from 'react';
import Login from "./views/Login";
import Card from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import Nav from './components/common/Nav';
import Topbar from './components/common/Topbar';
import { Provider } from './context/AppProvider';
import { useAuth } from './context/auth';
import { useApp } from './context/AppProvider';
import { useHashRoute } from './lib/hashRouter';

import Home from './views/Home';
import Campeonatos from './views/Campeonatos';
import Times from './views/Times';
import Jogadores from './views/Jogadores';
import Relacoes from './views/Relacoes';
import Jogos from './views/Jogos';
import EstatisticasTime from './views/EstatisticasTime';
import EstatisticasJogador from './views/EstatisticasJogador';
import Analises from './views/Analises';
import Perfil from './views/Perfil';

import './index.css';
import { setConfig, getClient } from './lib/supabase';

function RouterView(){ 
  const [r] = useHashRoute();
  if (r.startsWith('/campeonatos')) return <Campeonatos/>;
  if (r.startsWith('/times')) return <Times/>;
  if (r.startsWith('/jogadores')) return <Jogadores/>;
  if (r.startsWith('/relacoes')) return <Relacoes/>;
  if (r.startsWith('/jogos')) return <Jogos/>;
  if (r.startsWith('/estatisticas-time')) return <EstatisticasTime/>;
  if (r.startsWith('/estatisticas-jogador')) return <EstatisticasJogador/>;
  if (r.startsWith('/analises')) return <Analises/>;
  if (r.startsWith('/perfil')) return <Perfil/>;
  return <Home/>;
}

function Shell(){
  const { supa, setSupa } = useApp();
  const { session, loading } = useAuth();

  // sempre abre no INÍCIO
  useEffect(()=>{ if (location.hash !== '#/') { location.hash = '#/' } },[]);

  // 1) Tenta criar client a partir das ENV (ou do fallback em dev)
  useEffect(() => {
    if (!supa) {
      const c = getClient(); // usa ENV em prod; em dev ENV > localStorage
      if (c) setSupa(c);
    }
  }, [supa, setSupa]);

  // 2) Se ainda não temos supa:
  if (!supa) {
    if (import.meta.env.PROD) {
      // Em produção, não mostramos formulário: pedimos para configurar ENV e fazer redeploy
      return (
        <div className="center">
          <Card style={{ width: 520 }}>
            <div className="title">Configuração do Supabase ausente</div>
            <p className="sub" style={{ marginBottom: 12 }}>
              Defina <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> nas
              Variáveis de Ambiente da Vercel e faça um novo deploy marcando <b>“Clear cache and deploy”</b>.
            </p>
          </Card>
        </div>
      );
    }

    // Em desenvolvimento: mantém a tela de configuração (como já estava funcionando)
    return (
      <div className="center">
        <Card style={{width:420}}>
          <div className="title">Configurar Supabase (DEV)</div>
          <div className="row">
            <label className="label">Project URL</label>
            <Input id="u"/>
            <label className="label">Anon key</label>
            <Input id="k" type="password"/>
            <Button onClick={()=>{
              const u = document.getElementById('u').value.trim();
              const k = document.getElementById('k').value.trim();
              setConfig(u,k);           // salva no localStorage (apenas DEV)
              const c = getClient();     // recria o client
              if (c) setSupa(c);
            }}>Salvar</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) return <div className="center">Carregando...</div>;

  // 🔐 Sem sessão → tela de Login (split-screen)
  if (!session) return <Login/>;

  // ✅ Logado → app normal
  return (
    <div className="container">
      <Topbar/>
      <Nav/>
      <RouterView/>
    </div>
  );
}

function ErrorBoundary({children}){
  const [err,setErr] = React.useState(null);
  React.useEffect(()=>{
    const handler = (e) => { setErr(e.error || new Error(String(e.message||'Erro desconhecido'))); };
    const rej = (e) => setErr(e.reason || new Error('Promise rejeitada'));
    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', rej);
    return ()=>{
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', rej);
    };
  },[]);
  if(err){
    return <div style={{padding:16, margin:16, border:'1px solid #fecaca', background:'#fff1f2', borderRadius:12}}>
      <div style={{fontWeight:700, color:'#b91c1c'}}>Erro em runtime</div>
      <pre style={{whiteSpace:'pre-wrap'}}>{String(err.stack||err.message||err)}</pre>
    </div>;
  }
  return children;
}

export default function App(){
  return (
    <Provider>
      <ErrorBoundary>
        <Shell/>
      </ErrorBoundary>
    </Provider>
  );
}
