#!/usr/bin/env node

const { spawnSync } = require('child_process');

const siteSlug = process.argv[2];
const extraArgs = process.argv.slice(3);
const validSites = new Set(['pedalscape', 'beltscape']);

if (!siteSlug || !validSites.has(siteSlug)) {
  console.error('Usage: node scripts/test-site.js <pedalscape|beltscape> [playwright args...]');
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    ...options
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(process.execPath, ['scripts/build.js', siteSlug]);

let playwrightCli;
try {
  playwrightCli = require.resolve('@playwright/test/cli');
} catch {
  console.error('Playwright is not installed. Run npm install first.');
  process.exit(1);
}

run(process.execPath, [playwrightCli, 'test', ...extraArgs], {
  env: {
    ...process.env,
    SITE: siteSlug
  }
});
