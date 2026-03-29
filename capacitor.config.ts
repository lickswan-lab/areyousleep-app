import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.areyousleep.app',
  appName: '睡了么',
  webDir: 'out',
  server: {
    // 加载 Vercel 线上版本，API 路由正常工作
    url: 'https://areyousleep.cn',
    cleartext: true,
  },
};

export default config;
