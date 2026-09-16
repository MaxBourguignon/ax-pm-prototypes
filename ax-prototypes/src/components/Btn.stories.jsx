import Btn from './Btn';

export default {
  title: 'Components/Btn',
  component: Btn,
  argTypes: {
    type: {
      control: 'select',
      options: ['Primary', 'Secondary', 'Tertiary', 'TertiaryDanger', 'Danger'],
    },
    size: { control: 'inline-radio', options: ['Medium', 'Small'] },
    disabled: { control: 'boolean' },
  },
  args: {
    type: 'Primary',
    size: 'Medium',
    disabled: false,
    children: 'Create',
  },
};

export const Playground = {};

export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {['Primary', 'Secondary', 'Tertiary', 'TertiaryDanger', 'Danger'].map((t) => (
        <Btn key={t} type={t}>
          {t}
        </Btn>
      ))}
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Btn size="Medium">Medium</Btn>
      <Btn size="Small">Small</Btn>
      <Btn disabled>Disabled</Btn>
    </div>
  ),
};
