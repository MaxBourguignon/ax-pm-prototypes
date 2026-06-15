/**
 * AX Prototypes — Toast
 * Transient bottom-centre confirmation. Presentational: render it with a truthy
 * `toast` (string or node); manage show/auto-hide timing in the page.
 *
 *   const [toast, setToast] = useState(null);
 *   const notify = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };
 *   <Toast toast={toast} />
 *
 * Props: toast (string|node — hidden when falsy), icon (defaults to a green check).
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';

let _kf = false;
function ensureKeyframes() {
  if (_kf || typeof document === 'undefined') return;
  _kf = true;
  const el = document.createElement('style');
  el.textContent = '@keyframes axToastIn{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}';
  document.head.appendChild(el);
}

export function Toast({ toast, icon }) {
  ensureKeyframes();
  if (!toast) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                  background: DS.neutral900, color: DS.textInverse, padding: '12px 18px', borderRadius: 10,
                  boxShadow: '0 8px 28px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 10,
                  zIndex: 90, animation: 'axToastIn .2s ease', ...TY.b2, fontFamily: DS.ff }}>
      {icon !== undefined ? icon : <Ico.Check s={18} c={DS.feedbackSuccess} />}
      {toast}
    </div>
  );
}

export default Toast;
