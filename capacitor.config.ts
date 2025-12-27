import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.410cbb99eebc4b97a5a5da6acb838be6',
  appName: 'HiveCare',
  webDir: 'dist',
  server: {
    url: 'https://410cbb99-eebc-4b97-a5a5-da6acb838be6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen'
    },
    Geolocation: {
      permissions: ['location']
    }
  }
};

export default config;
