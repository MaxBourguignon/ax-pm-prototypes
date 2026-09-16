/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../src/**/*.stories.@(js|jsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // vite-plugin-singlefile inlines the whole bundle so a prototype can be
  // shared as one .html file. That breaks Storybook's dev server, so strip it.
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = (viteConfig.plugins ?? [])
      .flat(Infinity)
      .filter((p) => !p?.name?.includes('singlefile'));
    return viteConfig;
  },
};

export default config;
