const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function determineCosmicTag(version) {
  if (version.includes('-alpha') && version.startsWith('1.')) {
    return 'wormhole';
  } else if (version.includes('-beta') && version.startsWith('2.')) {
    return 'event-horizon';
  } else if (version.startsWith('3.')) {
    return 'neutron';
  } else if (version.startsWith('4.')) {
    return 'quasar';
  } else if (version.startsWith('5.')) {
    return 'nova';
  } else if (version.startsWith('6.')) {
    return 'cosmos-2025';
  } else if (version.startsWith('7.')) {
    return 'singularity';
  }
  return 'latest';
}

function generateChangelogEntry(version, tag) {
  const date = new Date().toISOString().split('T')[0];
  return `# ${version} [${tag}] - ${date}

## Changes
- Version bump to ${version}
- Tagged as ${tag} release

## Installation
\`\`\`bash
npm install pauljs@${tag}
\`\`\`
`;
}

function main() {
  const packageJson = require('../package.json');
  const currentVersion = packageJson.version;
  const cosmicTag = determineCosmicTag(currentVersion);
  
  console.log('\nPaulJS Version Information:');
  console.log('---------------------------');
  console.log(`Current version: ${currentVersion}`);
  console.log(`Cosmic tag: ${cosmicTag}`);
  console.log(`Install command: npm install pauljs@${cosmicTag}`);

  // Generate and write changelog
  const changelogContent = generateChangelogEntry(currentVersion, cosmicTag);
  fs.writeFileSync(path.join(__dirname, '..', 'CHANGELOG.md'), changelogContent);
  
  console.log('\nChangelog has been updated successfully.');
}

if (require.main === module) {
  main();
}

module.exports = {
  determineCosmicTag
};