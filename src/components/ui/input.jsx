import React from 'react';
export function Input(props){ return <input className={`input ${props.className||''}`} {...props}/>; }
export default Input;
