import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import '@mdi/font/css/materialdesignicons.css';

// Vuetify imports
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    dark: true,
    themes: {
      dark: {
        colors: {
          background: '#1e1e1e',
          surface: '#2d2d2d',
          primary: '#007acc',
          secondary: '#005a9e',
          error: '#ff5252',
          info: '#2196f3',
          success: '#4caf50',
          warning: '#fb8c00',
          text: '#d4d4d4',
          onBackground: '#d4d4d4',
          onSurface: '#d4d4d4',
          onPrimary: '#ffffff',
          onSecondary: '#ffffff',
          onError: '#ffffff',
          onInfo: '#ffffff',
          onSuccess: '#ffffff',
          onWarning: '#ffffff',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

createApp(App)
  .use(vuetify)
  .mount('#app');