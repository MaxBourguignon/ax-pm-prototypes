import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import Card from '../../components/Card';
import { IconBadge } from '../../components/Tag';
import { Skeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/Feedback';
import { StatePreview } from '../../components/StatePreview';

// Two sample admins — the second exercises the long-name edge case on the greeting.
const ADMIN_USERS = [
  { id: 'camille', firstName: 'Camille', lastName: 'Laurent' },
  { id: 'jb', firstName: 'Jean-Baptiste', lastName: 'De La Rochefoucauld-Fontenay' },
];

// Keycloak base URL is per-realm/per-client — ship-prototype / backend wiring must
// swap this for the real realm console URL.
const KEYCLOAK_CONSOLE_URL = 'https://ubb.keycloak.arenametrix.com/admin/master/console/';

const CARDS = [
  {
    key: 'analytics',
    icon: Ico.Chart,
    title: 'Analytics',
    description: 'Track logins, conversion and campaign performance for your SSO / My Account audience.',
    ctaLabel: 'View analytics',
    href: '/sso-admin/analytics',
    external: false,
  },
  {
    key: 'users',
    icon: Ico.Users,
    title: 'User & Event Management',
    description: 'Manage user accounts and events directly in the Keycloak console.',
    ctaLabel: 'Open console',
    href: KEYCLOAK_CONSOLE_URL,
    external: true,
  },
  {
    key: 'branding',
    icon: Ico.Paint,
    title: 'Branding & Content',
    description: 'Update your logo, colors, fonts, pages, redirect links, texts and translations.',
    ctaLabel: 'Manage branding',
    href: '/sso-admin/branding',
    external: false,
  },
];

function EntryCard({ icon: Icon, title, description, ctaLabel, external, onClick }) {
  const [hover, setHover] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: 'pointer' }}
    >
      <Card
        style={{
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 12,
          border: `1px solid ${hover ? DS.borderFocus : DS.borderDefault}`,
          boxShadow: hover ? '0 8px 24px rgba(1,123,254,0.10)' : 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        <IconBadge icon={Icon && <Icon s={20} c={DS.actionPrimary} />} size="Medium" />
        <div style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault, textAlign: 'left' }}>{title}</div>
        <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary, textAlign: 'left' }}>
          {description}
        </div>
        <Btn
          type="Tertiary"
          size="Small"
          iconRight={external ? <Ico.Globe s={14} c={DS.actionPrimary} /> : <Ico.ChevRight s={14} c={DS.actionPrimary} />}
        >
          {ctaLabel}
        </Btn>
      </Card>
    </div>
  );
}

function HubSkeleton() {
  return (
    <div style={{ padding: '48px 40px', maxWidth: 1040 }}>
      <Skeleton w={140} h={14} r={4} style={{ marginBottom: 14 }} />
      <Skeleton w={320} h={32} r={4} style={{ marginBottom: 10 }} />
      <Skeleton w={420} h={16} r={4} style={{ marginBottom: 40 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 10, padding: 24 }}
          >
            <Skeleton w={40} h={40} r={8} style={{ marginBottom: 16 }} />
            <Skeleton w={140} h={16} r={4} style={{ marginBottom: 10 }} />
            <Skeleton w="100%" h={14} r={4} style={{ marginBottom: 6 }} />
            <Skeleton w="80%" h={14} r={4} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminHub() {
  const navigate = useNavigate();
  const [demoState, setDemoState] = React.useState('ready');
  const [userId, setUserId] = React.useState('camille');

  const user = ADMIN_USERS.find((u) => u.id === userId) ?? ADMIN_USERS[0];

  const handleCardClick = (card) => {
    if (card.external) {
      window.open(card.href, '_blank', 'noopener,noreferrer');
    } else {
      navigate(card.href);
    }
  };

  return (
    <div style={{ minHeight: '100%', background: DS.bgPage }}>
      <StatePreview
        groups={[
          {
            label: 'Admin',
            value: userId,
            onChange: setUserId,
            options: ADMIN_USERS.map((u) => ({ id: u.id, label: `${u.firstName} ${u.lastName}` })),
          },
          { label: 'State', value: demoState, onChange: setDemoState, options: ['ready', 'loading', 'error'] },
        ]}
      />

      {demoState === 'loading' && <HubSkeleton />}

      {demoState === 'error' && (
        <div style={{ padding: '80px 40px' }}>
          <ErrorState
            title="Couldn't load your admin hub."
            sub="Something went wrong loading this page."
            onRetry={() => setDemoState('ready')}
          />
        </div>
      )}

      {demoState === 'ready' && (
        <div style={{ padding: '48px 40px', maxWidth: 1040 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <Ico.SSO s={14} c={DS.textSecondary} />
            <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary }}>SSO / My Account</span>
          </div>
          <div style={{ ...TY.h1, fontFamily: DS.ff, color: DS.textDefault, marginBottom: 8, textAlign: 'left' }}>
            Hello, {user.firstName} {user.lastName}
          </div>
          <div style={{ ...TY.b1, fontFamily: DS.ff, color: DS.textSecondary, marginBottom: 40, textAlign: 'left' }}>
            Manage your SSO &amp; My Account space
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {CARDS.map((c) => (
              <EntryCard
                key={c.key}
                icon={c.icon}
                title={c.title}
                description={c.description}
                ctaLabel={c.ctaLabel}
                external={c.external}
                onClick={() => handleCardClick(c)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
