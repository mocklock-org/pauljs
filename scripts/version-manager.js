const { execSync } = require('child_process');
const semver = require('semver');
const fs = require('fs');
const path = require('path');

const COSMIC_TAGS = {
  wormhole: { 
    description: 'Experimental/alpha builds', 
    semverMatch: version => semver.satisfies(version, '>=1.0.0 <2.0.0') && version.includes('alpha')
  },
  'event-horizon': { 
    description: 'Beta releases', 
    semverMatch: version => semver.satisfies(version, '>=2.0.0 <3.0.0') && version.includes('beta')
  },
  neutron: { 
    description: 'Stable core releases', 
    semverMatch: version => semver.satisfies(version, '>=3.0.0 <4.0.0') && !version.includes('-')
  },
  quasar: { 
    description: 'Performance-focused releases', 
    semverMatch: version => semver.satisfies(version, '>=4.0.0 <5.0.0') && !version.includes('-')
  },
  nova: { 
    description: 'AI-enhanced releases', 
    semverMatch: version => semver.satisfies(version, '>=5.0.0 <6.0.0') && !version.includes('-')
  },
  'cosmos-2025': { 
    description: 'Long-term support releases', 
    semverMatch: version => semver.satisfies(version, '>=6.0.0 <7.0.0') && !version.includes('-')
  },
  singularity: { 
    description: 'Breaking changes/major rewrites', 
    semverMatch: version => semver.satisfies(version, '>=7.0.0') && !version.includes('-')
  }
};

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  return packageJson.version;
}

function getNextVersion(currentVersion, type = 'patch') {
  if (currentVersion.includes('alpha')) {
    return semver.inc(currentVersion, 'prerelease', 'alpha');
  }
  
  if (currentVersion.includes('beta')) {
    return semver.inc(currentVersion, 'prerelease', 'beta');
  }

  return semver.inc(currentVersion, type);
}

function getCosmicTag(version) {
  return Object.entries(COSMIC_TAGS).find(([_, { semverMatch }]) => semverMatch(version))?.[0] || 'latest';
}

function publishWithTag(version, tag) {
  console.log(`Publishing version ${version} with tag ${tag}...`);
  execSync(`npm publish --tag ${tag}`, { stdio: 'inherit' });
  
  if (version.includes('alpha')) {
    console.log('Tagging as wormhole (experimental build)...');
    execSync(`npm dist-tag add pauljs@${version} wormhole`, { stdio: 'inherit' });
  }

  if (version.includes('beta')) {
    console.log('Tagging as event-horizon (beta build)...');
    execSync(`npm dist-tag add pauljs@${version} event-horizon`, { stdio: 'inherit' });
  }
}

function updateChangelog(version, tag) {
  const changelogPath = path.join(__dirname, '../CHANGELOG.md');
  const date = new Date().toISOString().split('T')[0];
  const header = `\n## [${version}] - ${date} (${tag})\n`;
  
  let changelog = fs.existsSync(changelogPath) 
    ? fs.readFileSync(changelogPath, 'utf8')
    : '# Changelog\n\nAll notable changes to this project will be documented in this file.\n';
  
  const commits = execSync('git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"* %s"')
    .toString()
    .split('\n')
    .filter(msg => !msg.includes('[skip ci]'));

  const entry = `${header}\n${commits.join('\n')}\n`;
  changelog = changelog.replace('# Changelog\n', `# Changelog\n${entry}`);
  
  fs.writeFileSync(changelogPath, changelog);
}

function getVersionInfo(version) {
  const tag = getCosmicTag(version);
  const description = COSMIC_TAGS[tag]?.description;
  const nextVersion = getNextVersion(version);
  
  return {
    current: version,
    tag,
    description,
    next: nextVersion,
    installCommand: `npm install pauljs@${tag}`
  };
}

function main() {
  const version = getCurrentVersion();
  const versionInfo = getVersionInfo(version);
  
  console.log('\nPaulJS Version Information:');
  console.log('---------------------------');
  console.log(`Current version: ${versionInfo.current}`);
  console.log(`Cosmic tag: ${versionInfo.tag}`);
  console.log(`Description: ${versionInfo.description}`);
  console.log(`Next version: ${versionInfo.next}`);
  console.log(`Install command: ${versionInfo.installCommand}`);
  
  updateChangelog(version, versionInfo.tag);
  
  execSync('git add CHANGELOG.md');
  execSync(`git commit -m "docs: update changelog for ${version} [skip ci]"`);
  
  publishWithTag(version, versionInfo.tag);
  
  console.log('\nPublished successfully! 🚀');
}

if (require.main === module) {
  main();
}

module.exports = {
  COSMIC_TAGS,
  getCurrentVersion,
  getNextVersion,
  getCosmicTag,
  publishWithTag,
  updateChangelog,
  getVersionInfo
};