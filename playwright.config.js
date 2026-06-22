const { defineConfig, devices } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const siteSlug = process.env.SITE || 'pedalscape';
const configPath = path.join(__dirname, 'sites', `${siteSlug}.config.json`);
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const siteConfig = {
  siteName: config.siteName,
  siteSlug: config.siteSlug,
  activityNoun: config.activityNoun,
  activityNounSingular: config.activityNounSingular,
  bgColor: config.bgColor,
  themeColor: config.themeColor,
  cacheName: config.cacheName,
};

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    serviceWorkers: 'block',
    trace: 'on-first-retry'
  },
  webServer: {
    command: `node scripts/serve-dist.js ${siteSlug} 5173`,
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 10_000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});

module.exports.siteConfig = siteConfig;
