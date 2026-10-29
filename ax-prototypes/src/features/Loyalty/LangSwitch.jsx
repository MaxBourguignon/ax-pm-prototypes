import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import { useLang } from './i18n';

/** FR | EN segmented control, placed in the page header actions. */
export function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div role="group" aria-label="Language"
      style={{ display: 'inline-flex', border: `1px solid ${DS.borderDefault}`, borderRadius: 8,
               overflow: 'hidden', background: DS.bgCard, flexShrink: 0 }}>
      {['fr', 'en'].map((l, i) => {
        const on = lang === l;
        return (
          <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={on}
            style={{ ...TY.labelMd, fontFamily: DS.ff, padding: '6px 12px', cursor: 'pointer', border: 'none',
                     borderLeft: i ? `1px solid ${DS.borderDefault}` : 'none',
                     background: on ? DS.brandPrimarySubtle : 'transparent',
                     color: on ? DS.actionPrimary : DS.textSecondary }}>
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

export default LangSwitch;
