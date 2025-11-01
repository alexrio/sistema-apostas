import { useEffect, useState } from 'react';
export function useHashRoute(){
  const [route,setRoute]=useState((typeof location!=='undefined' && location.hash.slice(1))||'#/');
  useEffect(()=>{
    const f=()=>setRoute(location.hash.slice(1)||'#/');
    window.addEventListener('hashchange',f); return ()=>window.removeEventListener('hashchange',f);
  },[]);
  return [route];
}
