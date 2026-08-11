import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'react-native-mmkv-storage',
  description:
    'A fast, small and encrypted key-value storage for React Native, built on MMKV and JSI.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#3399ff' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'react-native-mmkv-storage' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'A fast, small and encrypted key-value storage for React Native.'
      }
    ]
  ],
  themeConfig: {
    logo: '/logo.svg',
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Guide', link: '/gettingstarted' },
      { text: 'API', link: '/loaderclass' },
      { text: 'Hooks', link: '/usemmkvstorage' },
      {
        text: 'npm',
        link: 'https://www.npmjs.com/package/react-native-mmkv-storage'
      }
    ],
    sidebar: [
      {
        text: 'Getting started',
        collapsed: false,
        items: [
          { text: 'Installation', link: '/gettingstarted' },
          { text: 'Creating an instance', link: '/creatinginstance' },
          { text: 'Working with encryption', link: '/workingwithencryption' },
          { text: 'Supported data types', link: '/datatypes' },
          { text: 'Value lifecycle control', link: '/transactionmanager' },
          { text: 'redux-persist', link: '/redux-persist' },
          { text: 'Using MMKV from native code', link: '/nativeaccess' },
          { text: 'React Native DevTools', link: '/devtools' },
          { text: 'Testing with Jest', link: '/mockjest' }
        ]
      },
      {
        text: 'Hooks',
        collapsed: false,
        items: [
          { text: 'useMMKVStorage', link: '/usemmkvstorage' },
          { text: 'useIndex', link: '/useindex' },
          { text: 'useMMKVRef', link: '/usemmkvref' }
        ]
      },
      {
        text: 'API reference',
        collapsed: false,
        items: [
          { text: 'MMKVLoader', link: '/loaderclass' },
          { text: 'Sync API', link: '/callbackapi' },
          { text: 'Async API', link: '/asyncapi' },
          { text: 'General methods', link: '/generalmethods' },
          { text: 'Encryption', link: '/encryption' },
          { text: 'Querying and indexing', link: '/queryingandindexing' },
          { text: 'Events', link: '/events' },
          { text: 'Types', link: '/types' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ammarahm-ed/react-native-mmkv-storage' }
    ],
    editLink: {
      pattern:
        'https://github.com/ammarahm-ed/react-native-mmkv-storage/edit/master/docs/:path',
      text: 'Edit this page on GitHub'
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © Ammar Ahmed'
    },
    outline: [2, 3]
  }
});
