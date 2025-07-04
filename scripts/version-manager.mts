import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

function determineCosmicTag(version: string): string {
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

function getContributors(): string[] {
  try {
    let gitCommand = 'git log --format="%aN"';
    try {
      // Get the previous tag, not the current one
      const lastTag = execSync('git describe --tags --abbrev=0 HEAD^').toString().trim();
      console.log(`Found previous tag: ${lastTag}`);
      gitCommand = `git log ${lastTag}..HEAD --format="%aN"`;
    } catch (e) {
      console.log('No previous tag found, getting all contributors');
    }
    
    console.log(`Running git command: ${gitCommand}`);
    const contributors = execSync(gitCommand)
      .toString()
      .trim()
      .split('\n')
      .filter(name => name && !name.includes('[bot]') && !name.includes('Automated'))
      .filter((name, index, self) => self.indexOf(name) === index);

    console.log(`Found contributors: ${contributors.join(', ')}`);
    return contributors;
  } catch (error) {
    console.warn('Warning: Could not fetch contributors:', error);
    return [];
  }
}

interface CommitsByType {
  features: string[];
  fixes: string[];
  docs: string[];
  chores: string[];
  refactor: string[];
  tests: string[];
  updates: string[];
  other: string[];
}

function getCommitsByType(): CommitsByType {
  try {
    // Get all commits since the last tag, including the current one
    let gitCommand = 'git log --no-merges --pretty=format:"%s|%aN"';
    try {
      // Get the previous tag, not the current one
      const lastTag = execSync('git describe --tags --abbrev=0 HEAD^').toString().trim();
      console.log(`Found previous tag: ${lastTag}`);
      gitCommand = `git log ${lastTag}..HEAD --no-merges --pretty=format:"%s|%aN"`;
    } catch (e) {
      console.log('No previous tag found, getting all commits');
    }

    console.log(`Running git command: ${gitCommand}`);
    const commits = execSync(gitCommand)
      .toString()
      .trim()
      .split('\n')
      .filter(line => line && !line.includes('[skip ci]') && !line.startsWith('release:'));

    console.log(`Found ${commits.length} commits to process`);
    console.log('Commits:', commits);

    const changes: CommitsByType = {
      features: [],
      fixes: [],
      docs: [],
      chores: [],
      refactor: [],
      tests: [],
      updates: [],
      other: []
    };

    commits.forEach(commit => {
      const [message, author] = commit.split('|');
      console.log(`Processing commit: "${message}" by ${author}`);
      
      const cleanMessage = message
        .replace(/\[wormhole\]/g, '')
        .replace(/\[alpha\]/g, '')
        .replace(/\[beta\]/g, '')
        .replace(/ci:/g, '')
        .replace(/feat:/g, '')
        .replace(/fix:/g, '')
        .replace(/docs?:/g, '')
        .replace(/chore:/g, '')
        .replace(/refactor:/g, '')
        .replace(/test:/g, '')
        .replace(/update:/g, '')
        .trim();

      const entry = `${cleanMessage} (by @${author})`;

      if (message.match(/^feat(\([^)]+\))?:/) || message.includes('[feature]')) {
        changes.features.push(entry);
      } else if (message.match(/^fix(\([^)]+\))?:/) || message.includes('[bug]')) {
        changes.fixes.push(entry);
      } else if (message.match(/^docs?(\([^)]+\))?:/)) {
        changes.docs.push(entry);
      } else if (message.match(/^chore(\([^)]+\))?:/)) {
        changes.chores.push(entry);
      } else if (message.match(/^refactor(\([^)]+\))?:/)) {
        changes.refactor.push(entry);
      } else if (message.match(/^test(\([^)]+\))?:/)) {
        changes.tests.push(entry);
      } else if (message.match(/^update(\([^)]+\))?:/)) {
        changes.updates.push(entry);
      } else if (!message.startsWith('ci:')) {
        changes.other.push(entry);
      }
    });

    // Log what we found
    (Object.entries(changes) as Array<[keyof CommitsByType, string[]]>).forEach(([type, entries]) => {
      if (entries.length > 0) {
        console.log(`Found ${entries.length} ${type}:`, entries);
      }
    });

    Object.keys(changes).forEach(key => {
      changes[key as keyof CommitsByType] = [...new Set(changes[key as keyof CommitsByType])].filter(Boolean);
    });

    return changes;
  } catch (error) {
    console.warn('Warning: Could not fetch commits:', error);
    return {
      features: [],
      fixes: [],
      docs: [],
      chores: [],
      refactor: [],
      tests: [],
      updates: [],
      other: []
    };
  }
}

function generateChangelogEntry(version: string, tag: string): string {
  const date = new Date().toISOString().split('T')[0];
  const contributors = getContributors();
  const changes = getCommitsByType();

  let changelog = `# ${version} [${tag}] - ${date}\n\n`;

  changelog += '## What\'s Changed\n\n';
  
  if (changes.features.length > 0) {
    changelog += '### Features\n';
    changes.features.forEach(feat => {
      changelog += `- ${feat}\n`;
    });
    changelog += '\n';
  }

  if (changes.fixes.length > 0) {
    changelog += '### Bug Fixes\n';
    changes.fixes.forEach(fix => {
      changelog += `- ${fix}\n`;
    });
    changelog += '\n';
  }

  if (changes.updates.length > 0) {
    changelog += '### Updates\n';
    changes.updates.forEach(update => {
      changelog += `- ${update}\n`;
    });
    changelog += '\n';
  }

  if (changes.refactor.length > 0) {
    changelog += '### Refactoring\n';
    changes.refactor.forEach(ref => {
      changelog += `- ${ref}\n`;
    });
    changelog += '\n';
  }

  if (changes.docs.length > 0) {
    changelog += '### Documentation\n';
    changes.docs.forEach(doc => {
      changelog += `- ${doc}\n`;
    });
    changelog += '\n';
  }

  if (changes.tests.length > 0) {
    changelog += '### Testing\n';
    changes.tests.forEach(test => {
      changelog += `- ${test}\n`;
    });
    changelog += '\n';
  }

  if (changes.chores.length > 0) {
    changelog += '### Maintenance\n';
    changes.chores.forEach(chore => {
      changelog += `- ${chore}\n`;
    });
    changelog += '\n';
  }

  if (changes.other.length > 0) {
    changelog += '### Other Changes\n';
    changes.other.forEach(change => {
      changelog += `- ${change}\n`;
    });
    changelog += '\n';
  }

  if (contributors.length > 0) {
    changelog += '## Contributors\n\n';
    contributors.forEach(contributor => {
      changelog += `- @${contributor}\n`;
    });
    changelog += '\n';
  }

  changelog += `## Installation\n\n`;
  changelog += '```bash\n';
  changelog += `npx create-pauljs-app --tag ${tag}\n`;
  changelog += '```\n';

  return changelog;
}

async function main(): Promise<void> {
  try {
    const packageJson = JSON.parse(
      await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf-8')
    ) as PackageJson;
    
    const currentVersion = packageJson.version;
    const cosmicTag = determineCosmicTag(currentVersion);
    
    console.log('\nPaulJS Version Information:');
    console.log('---------------------------');
    console.log(`Current version: ${currentVersion}`);
    console.log(`Cosmic tag: ${cosmicTag}`);
    
    console.log('\nGenerating changelog...');
    const changelogContent = generateChangelogEntry(currentVersion, cosmicTag);
    
    console.log('Writing changelog to CHANGELOG.md...');
    await fs.writeFile(path.join(__dirname, '..', 'CHANGELOG.md'), changelogContent);
    
    console.log('Verifying changelog was written...');
    try {
      await fs.access(path.join(__dirname, '..', 'CHANGELOG.md'));
      console.log('Changelog written successfully.');
      console.log('\nChangelog content:');
      console.log(changelogContent);
    } catch {
      throw new Error('Failed to write CHANGELOG.md');
    }
  } catch (error) {
    console.error('\nError in version manager:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export {
  determineCosmicTag,
  getContributors,
  getCommitsByType,
  generateChangelogEntry,
  type CommitsByType
}; 