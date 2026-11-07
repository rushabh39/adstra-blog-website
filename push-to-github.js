/**
 * Helper script to push this repository to GitHub using isomorphic-git
 * Usage: node push-to-github.js <REPO_URL> <GITHUB_TOKEN>
 * Example: node push-to-github.js https://github.com/yourusername/fince-news.git ghp_yourTokenHere
 */
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const remoteUrl = process.argv[2] || process.env.GITHUB_REPO_URL;
const token = process.argv[3] || process.env.GITHUB_TOKEN;

if (!remoteUrl) {
  console.log('Error: Missing GitHub repository URL.');
  console.log('Usage: node push-to-github.js <REPO_URL> [GITHUB_TOKEN]');
  process.exit(1);
}

async function push() {
  console.log(`Setting remote origin: ${remoteUrl}`);
  try {
    await git.addRemote({ fs, dir, remote: 'origin', url: remoteUrl, force: true });
  } catch (e) {
    // remote already exists, update
    await git.deleteRemote({ fs, dir, remote: 'origin' }).catch(() => {});
    await git.addRemote({ fs, dir, remote: 'origin', url: remoteUrl });
  }

  console.log('Pushing main branch to GitHub...');
  const pushResult = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    force: false,
    onAuth: () => {
      if (!token) {
        throw new Error('Authentication required. Please supply your GitHub Personal Access Token.');
      }
      return { username: token };
    }
  });

  console.log('Push completed successfully!', pushResult);
}

push().catch(err => {
  console.error('Push failed:', err.message || err);
  process.exit(1);
});
