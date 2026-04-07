#!/usr/bin/env bun

const { stdout: tagsRaw } =
  await Bun.$`git tag --sort=-version:refname`.quiet();
const allTags = tagsRaw.toString().trim().split('\n').filter(Boolean);

// Find the latest RC tag
const rcTags = allTags.filter((t) => /^v\d+\.\d+\.\d+-rc\d+$/.test(t));
const latestRc = rcTags[0];

if (!latestRc) {
  console.error(
    '❌ No RC tags found. Run `bun tag <patch|minor|major>` first.',
  );
  process.exit(1);
}

// Strip the -rcN suffix to get the stable version
const stableVersion = latestRc.replace(/-rc\d+$/, '');

console.log(`🏷️  Latest RC      : ${latestRc}`);
console.log(`🚀 Releasing      : ${stableVersion}`);

// Unset placeholder env vars so gh reads the real token from its config
const { stdout: tokenRaw } =
  await Bun.$`bash -c 'unset GH_TOKEN GITHUB_TOKEN; gh auth token'`.quiet();
const ghToken = tokenRaw.toString().trim();

// Inject the real token into a scoped shell for all gh calls
const $ = Bun.$.env({ ...process.env, GH_TOKEN: ghToken });

// Detect repo from git remote to avoid gh CLI auto-detection failures
const { stdout: remoteRaw } = await $`git remote get-url origin`.quiet();
const remote = remoteRaw.toString().trim();
const repoMatch = remote.match(/github\.com[:/](.+?)(?:\.git)?$/);
if (!repoMatch) {
  console.error('❌ Could not detect GitHub repo from git remote.');
  process.exit(1);
}
const repo = repoMatch[1];

// Check if a release already exists for this version
const existingRelease =
  await $`gh release view ${stableVersion} --repo ${repo} --json tagName`
    .quiet()
    .nothrow();
if (existingRelease.exitCode === 0) {
  console.error(`❌ Release ${stableVersion} already exists.`);
  process.exit(1);
}

await $`gh release create ${stableVersion} --repo ${repo} --generate-notes --latest --title ${stableVersion}`;

console.log(`✅ Released ${stableVersion} — prod deploy triggered!`);
