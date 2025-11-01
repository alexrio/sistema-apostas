import React from 'react';
import Papa from 'papaparse';
export default function CSVUpload({onRows}){
  return <div>
    <input type="file" accept=".csv,text/csv"
      onChange={e=>{ const f=e.target.files?.[0]; if(!f) return;
        Papa.parse(f,{header:true,complete:(r)=>onRows(r.data)});
      }}/>
  </div>;
}
