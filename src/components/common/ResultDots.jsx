import React from 'react';
export default function ResultDots({arr}){
  const color = (r)=> r==='W' ? '#22c55e' : r==='D' ? '#9ca3af' : '#ef4444';
  return <div className="rank-dots">
    {(arr||[]).slice(0,5).map((x,i)=>
      <div key={i} title={x.r} style={{background:color(x.r)}} className="rank-dot"/>
    )}
  </div>;
}
