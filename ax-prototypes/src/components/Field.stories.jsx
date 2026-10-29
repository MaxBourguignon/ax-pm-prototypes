import { useState } from 'react';
import Field, { SearchField, TextArea } from './Field';

/** Wrapper so inputs are actually typeable inside Storybook. */
function Controlled({ value: initial = '', ...props }) {
  const { as, ...rest } = props;
  const Cmp = as ?? Field;
  const [value, setValue] = useState(initial);
  return <Cmp value={value} onChange={(e) => setValue(e.target.value)} {...rest} />;
}

export default {
  title: 'Components/Field',
  component: Field,
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    disabled: { control: 'boolean' },
    value: { control: 'text' },
    onChange: { table: { disable: true } },
  },
  args: {
    label: 'Name',
    placeholder: 'Jane Doe',
    type: 'text',
    error: '',
    disabled: false,
  },
  decorators: [(Story) => <div style={{ width: 320 }}>{Story()}</div>],
};

export const Playground = {
  render: (args) => <Controlled {...args} />,
};

export const States = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320 }}>
      <Field label="Default" placeholder="Jane Doe" />
      <Controlled label="Filled" value="Jane Doe" />
      <Controlled label="Error" value="jane.doe" error="Invalid email format" />
      <Field label="Disabled" placeholder="Jane Doe" disabled />
    </div>
  ),
};

export const WithoutLabel = {
  render: () => <Controlled placeholder="No label, just an input" />,
};

export const Search = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320 }}>
      <Controlled as={SearchField} placeholder="Search…" />
      <Controlled as={SearchField} value="Newsletter" placeholder="Search…" />
      <SearchField placeholder="Search…" disabled />
    </div>
  ),
};

export const MultiLine = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320 }}>
      <Controlled as={TextArea} label="Description" placeholder="Describe this segment…" />
      <Controlled
        as={TextArea}
        label="Description"
        value="Contacts who opened at least one campaign in the last 30 days."
      />
      <Controlled as={TextArea} label="Description" value="Too" error="Minimum 10 characters" />
      <TextArea label="Description" placeholder="Describe this segment…" disabled />
    </div>
  ),
};
