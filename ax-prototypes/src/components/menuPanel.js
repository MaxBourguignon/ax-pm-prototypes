import { DS } from '../utils/designSystem';

/* The dropdown panel shared by Select and MultiSelect. Kept out of the
   component files so they export components only (fast refresh). */
export const PANEL_MAX_H = 320;

export const panelShell = {
  background: DS.surfaceCanvas,
  border: `1px solid ${DS.borderDefault}`,
  borderRadius: DS.radiusLg,
  boxShadow: DS.shadowSm,
  padding: 4,
  boxSizing: 'border-box',
  overflowY: 'auto',
  maxHeight: PANEL_MAX_H,
};
