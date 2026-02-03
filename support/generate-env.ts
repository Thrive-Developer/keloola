#!/usr/bin/env bun
/**
 * This script reads .env file and generates a TypeScript constants file
 * that embeds the values at build time.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { basename, join } from 'path';

const CWD = join(basename(import.meta.url.replace(/^file:\/\//, '')), '..');
const ROOT_DIR = join(basename(import.meta.url.replace(/^file:\/\//, '')), '../..');
const ENV_FILE = join(ROOT_DIR, '.env');
const OUTPUT_FILE = join(CWD, 'env.ts');

function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

function main() {
  if (!existsSync(ENV_FILE)) {
    console.error(`Error: .env file not found at ${ENV_FILE}`);
    process.exit(1);
  }

  const envContent = readFileSync(ENV_FILE, 'utf-8');
  const envVars = parseEnvFile(envContent);

  const required = ['ACCOUNTING_BASE_URL', 'AUTH_BASE_URL'];

  for (const key of required) {
    if (!envVars[key]) {
      console.error(`Error: Missing required env var: ${key}`);
      process.exit(1);
    }
  }

  const output = `// AUTO-GENERATED FILE - DO NOT EDIT
// Generated from .env at build time

export const ENV = {
${required.map((key) => `  ${key}: ${JSON.stringify(envVars[key])},`).join('\n')}
} as const;
`;

  writeFileSync(OUTPUT_FILE, output);
  console.log(`Generated ${OUTPUT_FILE}`);
}

main();
