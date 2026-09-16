import '../src/index.css';

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      options: {
        app: { name: 'App background', value: '#F4F9FF' },
        card: { name: 'Card', value: '#FFFFFF' },
      },
    },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'app' },
  },
};

export default preview;
