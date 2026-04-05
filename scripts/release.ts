#!/usr/bin/env bun

const { stdout: tagsRaw } =
  await Bun.$`git tag --sort=-version:refname`.quiet();
const allTags = tagsRaw.toString().trim().split('\n').filter(Boolean);

// Find the latest RC tag
const rcTags = allTags.filter((t) => /^v\d+\.\d+\.\d+-rc\d+$/.test(t));
const latestRc = rcTags[0];

if (!latestRc) {
  console.error('❌ No RC tags found. Run `bun tag <patch|minor|major>` first.');
  process.exit(1);
}

// Strip the -rcN suffix to get the stable version
const stableVersion = latestRc.replace(/-rc\d+$/, '');

console.log(`🏷️  Latest RC      : ${latestRc}`);
console.log(`🚀 Releasing      : ${stableVersion}`);

// Check if a release already exists for this version
const existingRelease =
  await Bun.$`gh release view ${stableVersion} --json tagName`
    .quiet()
    .nothrow();
if (existingRelease.exitCode === 0) {
  console.error(`❌ Release ${stableVersion} already exists.`);
  process.exit(1);
}

await Bun.$`gh release create ${stableVersion} --generate-notes --latest --title ${stableVersion}`;

console.log(`✅ Released ${stableVersion} — prod deploy triggered!`);
