import React from 'react';
import Card from '../components/ui/card';
import Breadcrumbs from '../components/common/Breadcrumbs';

export default function Home(){
  return <Card><Breadcrumbs items={[{label:'Início'}]}/><div className="title">Bem-vindo!</div><p>Use a navegação acima para cadastrar dados e analisar séries dos últimos jogos.</p></Card>;
}
