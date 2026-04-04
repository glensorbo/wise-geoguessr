#!/usr/bin/env bun

const bump = process.argv[2] as 'patch' | 'minor' | 'major' | undefined;

if (!bump || !['patch', 'minor', 'major'].includes(bump)) {
  console.error('❌ Usage: bun tag <patch|minor|major>');
  process.exit(1);
}

const { stdout: tagsRaw } =
  await Bun.$`git tag --sort=-version:refname`.quiet();
const allTags = tagsRaw.toString().trim().split('\n').filter(Boolean);

// Latest stable release only (no RC suffix)
const releaseTags = allTags.filter((t) => /^v\d+\.\d+\.\d+$/.test(t));
const latestRelease = releaseTags[0] ?? 'v0.0.0';

const match = latestRelease.match(/^v(\d+)\.(\d+)\.(\d+)$/);
if (!match) {
  console.error(`❌ Could not parse version from tag: ${latestRelease}`);
  process.exit(1);
}

let [maj, min, pat] = [Number(match[1]), Number(match[2]), Number(match[3])];

if (bump === 'major') {
  maj++;
  min = 0;
  pat = 0;
} else if (bump === 'minor') {
  min++;
  pat = 0;
} else {
  pat++;
}

const nextVersion = `v${maj}.${min}.${pat}`;
const nextVersionPlain = `${maj}.${min}.${pat}`;

// Count existing RCs for this version to determine next RC number
const existingRcs = allTags.filter((t) => t.startsWith(`${nextVersion}-rc`));
const nextRc = existingRcs.length + 1;

const newTag = `${nextVersion}-rc${nextRc}`;

console.log(`📦 Latest release : ${latestRelease}`);
console.log(`🏷️  New tag        : ${newTag}`);

// Bump version in package.json
const pkg = await Bun.file('package.json').json();
pkg.version = nextVersionPlain;
await Bun.write('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log(`📝 Updated package.json → ${nextVersionPlain}`);

// Commit and push to main
await Bun.$`git add package.json`;
await Bun.$`git commit -m "🔧 chore: bump version to ${nextVersionPlain}"`;
await Bun.$`git push origin main`;

// Tag and push
await Bun.$`git tag ${newTag}`;
await Bun.$`git push origin ${newTag}`;

console.log(`✅ Pushed ${newTag} — test deploy triggered!`);
