/**
 * AX Prototypes — Skeleton
 * Shimmer placeholder bar for loading states. Accepts either short (w/h/r) or
 * long (width/height/radius) prop names so it drops into any prototype.
 *
 *   <Skeleton w={120} h={14} />
 *   <Skeleton width="100%" height={40} radius={8} />
 */
import React from 'react';

let _kf = false;
function ensureKeyframes() {
  if (_kf || typeof document === 'undefined') return;
  _kf = true;
  const el = document.createElement('style');
  el.textContent = '@keyframes axShimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}';
  document.head.appendChild(el);
}

export function Skeleton({ w, h = 12, r = 4, width, height, radius, style }) {
  ensureKeyframes();
  return (
    <div style={{
      width: width ?? w ?? '100%',
      height: height ?? h,
      borderRadius: radius ?? r,
      background: 'linear-gradient(90deg,#eef1f4 25%,#e2e7ec 37%,#eef1f4 63%)',
      backgroundSize: '800px 100%',
      animation: 'axShimmer 1.4s infinite linear',
      ...style,
    }} />
  );
}

export default Skeleton;
