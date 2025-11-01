import React from 'react';
export function Button({children, onClick, variant='', disabled, type='button', className=''}){
  const cls = `btn ${variant?`btn-${variant}`:''} ${className}`.trim();
  return <button type={type} className={cls} onClick={onClick} disabled={disabled}>{children}</button>;
}
export default Button;
