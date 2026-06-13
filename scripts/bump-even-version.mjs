import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const rootDir = process.cwd();
const versionFile = join(rootDir, 'src', 'version.ts');

async function main() {
  const manifestFiles = await findManifestFiles(rootDir);
  const appJsonPath = join(rootDir, 'app.json');
  const appManifest = JSON.parse(await readFile(appJsonPath, 'utf8'));
  const nextVersion = bumpPatch(appManifest.version);

  for (const fileName of manifestFiles) {
    const path = join(rootDir, fileName);
    const manifest = JSON.parse(await readFile(path, 'utf8'));
    manifest.version = nextVersion;
    await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  await writeFile(versionFile, `export const APP_VERSION = 'Eye Trainer v${nextVersion}';\n`);
  console.log(`Updated Eye Trainer manifests to ${nextVersion}`);
}

async function findManifestFiles(rootDir) {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const fileNames = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name === 'app.json' || /^app\..*\.json$/.test(name) || name === 'app.json.example');

  if (!fileNames.includes('app.json')) {
    throw new Error('app.json is missing. Copy app.json.example to app.json before packing.');
  }

  return fileNames.sort((left, right) => {
    if (left === 'app.json') return -1;
    if (right === 'app.json') return 1;
    return left.localeCompare(right);
  });
}

function bumpPatch(version) {
  if (typeof version !== 'string') {
    throw new Error('Manifest version must be a string.');
  }

  const parts = version.split('.').map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part) || part < 0)) {
    throw new Error(`Manifest version must use semver major.minor.patch, got ${version}`);
  }

  const [major, minor, patch] = parts;
  return `${major}.${minor}.${patch + 1}`;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
