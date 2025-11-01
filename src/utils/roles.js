export function roleLabel(r){
  const map={ admin:'Administrador', editor:'Editor', operador:'Operador', apostador:'Apostador', reader:'Leitor' };
  return map[r] || (r? r : 'Apostador');
}
export async function canWrite(supa){
  const {data:{user}}=await supa.auth.getUser(); if(!user) return false;
  const {data}=await supa.from('profiles').select('role').eq('id',user.id).single();
  const role=data?.role||'apostador';
  return ['admin','editor','operador'].includes(role);
}
export async function canAdmin(supa){
  const {data:{user}}=await supa.auth.getUser(); if(!user) return false;
  const {data}=await supa.from('profiles').select('role').eq('id',user.id).single();
  return data?.role === 'admin';
}
