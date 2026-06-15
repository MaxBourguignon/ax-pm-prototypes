/**
 * AX Prototypes — KpiCard
 * Headline metric card (DS CardStats pattern, §4.10). One canonical card for
 * every prototype's KPI strip.
 *
 *   <KpiCard title="Active opt-ins" value="18,420" sub="+1,240 since Jan 1"
 *            subColor={DS.feedbackSuccess} />
 *   <KpiCard title="Lists" value={42} sub="all types" icon={<Ico.List/>} accent={DS.green500} loading={isLoading} />
 *
 * Props: title|label, value, sub, subColor, icon (optional — square shown only
 * if provided), accent (value colour, default actionPrimary), loading.
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Skeleton from './Skeleton';

export function KpiCard({ title, label, value, sub, subColor = DS.textSecondary,
                         icon, accent = DS.actionPrimary, loading = false }) {
  const heading = title ?? label;
  return (
    <div style={{ flex: '1 1 200px', minWidth: 200, minHeight: 110, background: DS.bgCard,
                  border: `1px solid ${DS.borderDefault}`, borderRadius: 10, padding: 16,
                  display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary }}>{heading}</span>
        {icon && (
          <span style={{ width: 28, height: 28, borderRadius: 6, background: DS.bgIcons,
                         display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon}
          </span>
        )}
      </div>
      {loading ? <Skeleton w={110} h={22} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ ...TY.h3, fontFamily: DS.ff, color: accent }}>{value}</span>
          {sub && <span style={{ ...TY.b3, fontFamily: DS.ff, color: subColor }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

export default KpiCard;
