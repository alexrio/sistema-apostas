import React from 'react';
export default function Breadcrumbs({items}){
  return <header className="breadcrumbs">
    {items.map((it,i)=>(<span key={i}>{i>0&&'› '}{it.href?<a href={it.href}>{it.label}</a>:it.label}</span>))}
  </header>;
}
