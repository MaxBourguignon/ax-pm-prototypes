// AX Prototypes — mock data for the SSO Admin Hub feature (Branding & Content CMS)

const MOCK_LOGO_SVG = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72'><rect width='72' height='72' rx='14' fill='#0058B4'/><text x='36' y='42' font-family='Inter, sans-serif' font-size='20' font-weight='700' fill='white' text-anchor='middle'>UBB</text></svg>"
);
export const MOCK_LOGO_DATA_URL = `data:image/svg+xml,${MOCK_LOGO_SVG}`;

export const BRANDING_ASSET = {
  logoUrl: MOCK_LOGO_DATA_URL,
  primaryColor: '#017BFE',
  secondaryColor: '#4E6FC7',
  accentColor: '#2CB1A2',
  fontFamily: 'Inter',
  sizeScale: 'Medium',
};

export const BRANDING_ASSET_EMPTY = {
  logoUrl: null,
  primaryColor: '#017BFE',
  secondaryColor: '#4E6FC7',
  accentColor: '#2CB1A2',
  fontFamily: 'Inter',
  sizeScale: 'Medium',
};

export const CONTENT_PAGES = [
  { id: 'p1', name: 'Login', slug: '/login', status: 'published', lastUpdated: '2026-06-02' },
  { id: 'p2', name: 'My account', slug: '/account', status: 'published', lastUpdated: '2026-07-14' },
  { id: 'p3', name: 'FAQ', slug: '/faq', status: 'draft', lastUpdated: '2026-07-30' },
  { id: 'p4', name: 'Password reset', slug: '/reset-password', status: 'published', lastUpdated: '2026-05-11' },
  {
    id: 'p5',
    name: 'Union Bordeaux Bègles Members Area — Two-Star Champions Edition',
    slug: '/ubb-champions-two-star-members-area',
    status: 'draft',
    lastUpdated: '2026-08-01',
  },
];

export const REDIRECT_LINKS = [
  { id: 'r1', label: 'Post-login redirect', targetUrl: 'https://ubb.fr/mon-compte' },
  { id: 'r2', label: 'Post-logout redirect', targetUrl: '' },
];

export const TRANSLATION_KEYS = [
  { key: 'login.title', fr: 'Connexion', en: 'Log in' },
  { key: 'login.cta', fr: 'Se connecter', en: 'Log in' },
  { key: 'account.title', fr: 'Mon compte', en: 'My account' },
  { key: 'account.welcome', fr: 'Bienvenue, {firstName}', en: 'Welcome, {firstName}' },
  { key: 'faq.title', fr: 'Questions fréquentes', en: 'FAQ' },
  { key: 'password.reset', fr: 'Réinitialiser le mot de passe', en: 'Reset password' },
  { key: 'nav.logout', fr: 'Se déconnecter', en: 'Log out' },
  { key: 'error.generic', fr: 'Une erreur est survenue', en: '' },
];

export const AUDIT_LOG = [
  { id: 'a1', timestamp: '2026-08-01 09:14', user: 'Camille Laurent', field: 'Logo', oldValue: '', newValue: 'ubb-logo-2stars.svg' },
  { id: 'a2', timestamp: '2026-07-30 16:02', user: 'Camille Laurent', field: 'Page "FAQ"', oldValue: 'Published', newValue: 'Draft' },
  { id: 'a3', timestamp: '2026-07-14 11:47', user: 'Camille Laurent', field: 'Primary color', oldValue: '#0058B4', newValue: '#017BFE' },
  { id: 'a4', timestamp: '2026-06-20 14:30', user: 'Camille Laurent', field: 'Post-login redirect', oldValue: 'https://ubb.fr/accueil', newValue: 'https://ubb.fr/mon-compte' },
  { id: 'a5', timestamp: '2026-06-02 10:05', user: 'Camille Laurent', field: 'Page "Login"', oldValue: 'Draft', newValue: 'Published' },
  { id: 'a6', timestamp: '2026-05-28 17:12', user: 'Camille Laurent', field: 'Font family', oldValue: 'Roboto', newValue: 'Inter' },
  { id: 'a7', timestamp: '2026-05-11 08:50', user: 'Camille Laurent', field: 'Page "Password reset"', oldValue: 'Draft', newValue: 'Published' },
  { id: 'a8', timestamp: '2026-04-22 13:19', user: 'Camille Laurent', field: 'Translation "login.cta" (EN)', oldValue: 'Sign in', newValue: 'Log in' },
  { id: 'a9', timestamp: '2026-04-10 09:41', user: 'Camille Laurent', field: 'Secondary color', oldValue: '#5585B8', newValue: '#4E6FC7' },
  { id: 'a10', timestamp: '2026-03-29 15:03', user: 'Camille Laurent', field: 'Post-logout redirect', oldValue: 'https://ubb.fr/', newValue: '' },
];
