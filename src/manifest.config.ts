import { defineManifest } from '@crxjs/vite-plugin';
import packageData from '../package.json';

const isDev = process.env.NODE_ENV !== 'production';

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ' (Dev)' : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  
  icons: {
    16: 'src/assets/icons/icon-16.png',
    32: 'src/assets/icons/icon-32.png',
    48: 'src/assets/icons/icon-48.png',
    128: 'src/assets/icons/icon-128.png',
  },
  
  action: {
    default_popup: 'src/popup-modern.html',
    default_title: 'Cookie Copier - Manage cookies seamlessly',
    default_icon: {
      16: 'src/assets/icons/icon-16.png',
      32: 'src/assets/icons/icon-32.png',
      48: 'src/assets/icons/icon-48.png',
      128: 'src/assets/icons/icon-128.png',
    },
  },
  
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content.ts'],
      run_at: 'document_idle',
    },
  ],
  
  permissions: [
    'cookies',
    'activeTab',
    'storage',
    'scripting',
  ],
  
  host_permissions: ['*://*/*'],
  
  web_accessible_resources: [
    {
      resources: ['assets/*'],
      matches: ['<all_urls>'],
    },
  ],
  
  minimum_chrome_version: '88',
  
  commands: {
    'copy-cookies': {
      suggested_key: {
        default: 'Ctrl+Shift+C',
        mac: 'Command+Shift+C',
      },
      description: 'Copy cookies from current domain',
    },
  },
});