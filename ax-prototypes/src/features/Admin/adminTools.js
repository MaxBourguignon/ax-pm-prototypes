/**
 * The admin console's tools — one source for the admin home page and the
 * admin sidebar, so both always list the same tools in the same groups.
 *
 *   label     group title on the home page
 *   tool.link only on prototyped tools; the others render disabled in the
 *             sidebar favourites and toast on the home page
 *   tool.unavailable  greyed out, cannot be opened or pinned
 */
import Ico from '../../utils/icons';

export const ADMIN_GROUPS = [
  {
    id: 'config',
    label: 'Data model & configuration',
    tools: [
      { id: 'b2b', name: 'B2B Admin', Icon: Ico.Organization, desc: 'Configure the tenant’s custom fields on B2B management.' },
      { id: 'b2c', name: 'B2C Admin', Icon: Ico.Users, desc: 'Configure the custom fields of the new Contacts page.' },
      { id: 'raange', name: 'Raange configuration', Icon: Ico.Globe, desc: 'Settings for the Raange (Québec) tenants.' },
      { id: 'translations', name: 'Translation manager', Icon: Ico.Responses, desc: 'Edit interface translations — no more filling in spreadsheets.', unavailable: true },
    ],
  },
  {
    id: 'access',
    label: 'Access & integrations',
    tools: [
      { id: 'roles', name: 'Roles manager', Icon: Ico.AccessControl, desc: 'Roles and their permissions, with nothing left hidden.' },
      { id: 'credentials', name: 'Credentials manager', Icon: Ico.SSO, desc: 'Manage the Tinkerbell API credentials.' },
      { id: 'webhook-config', name: 'Webhook config', Icon: Ico.Connect, desc: 'Configure the Arenametrix webhooks.' },
      { id: 'webhooks', name: 'Webhooks manager', Icon: Ico.Workflow, desc: 'Follow and replay the webhooks sent to the tenant.' },
    ],
  },
  {
    id: 'ops',
    label: 'Monitoring & data tools',
    tools: [
      { id: 'actions', name: 'Actions viewer', Icon: Ico.Chart, desc: 'Monitor the tenant’s actions at a glance.' },
      { id: 'entity-merge', name: 'Entity merge', Icon: Ico.Merge, desc: 'Merge duplicate events and representations.', link: '/admin/entity-merge' },
      { id: 'docs', name: 'Documentation', Icon: Ico.Form, desc: 'The back-office documentation — yes, it exists.' },
    ],
  },
];
