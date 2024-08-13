import {exec} from 'child_process';
import * as utils from 'node:util';
import { GitRepoInfo } from '../types';

export async function gitInfo(path: string) : Promise<GitRepoInfo| undefined> {
  const url : string = await _getGitUrl(path);
  const branch = await _gitBranch(path);

  console.log('Git URL ' + url);
  if (url === '') {
    return undefined;
  } 

  console.log('Branch name ' + branch );
  const info = _parseGitUrl(url, branch);
  return info;
}

function _parseGitUrl (gitUrl: string, branch: string) : GitRepoInfo | undefined {
    let gitConfig = _getBitButketInfo(gitUrl, branch);
  
    if (!gitConfig) {
      gitConfig = _getGithubInfo(gitUrl, branch);
  
      if (!gitConfig) {
        gitConfig = _getStashInfo(gitUrl, branch);
      }
    }
  
    return gitConfig;
  }

function _getGithubInfo (gitUrl: string, branch: string) : GitRepoInfo | undefined {
    const GITHUB_HTTP_URL_PATTERN = /https:\/\/github\.com\/(.*)\/(.*)\.git/;
    const GITHUB_GIT_URL_PATTERN = /git@github\.com:(.*)\/(.*)\.git/;
  
    const GITHUB_REPO_LINK = 'https://github.com/%s/%s';
    const GITHUB_REPO_PRS_LINK = 'https://github.com/%s/%s/pulls';
    const GITHUB_BRANCH_PR_LINK = 'https://github.com/%s/%s/pulls?q=';
    const GITHUB_CREATE_PR_LINK = 'https://github.com/%s/%s/compare/%s...master';
  
    let project, repo;
  
    let result = gitUrl.match(GITHUB_HTTP_URL_PATTERN);
    if (!result) {
      result = gitUrl.match(GITHUB_GIT_URL_PATTERN);
    }
  
    if (result) {
      project = result[1];
      repo = result[2];
      return {
        server: 'github',
        repo: repo,
        project: project,
        gitUrl: gitUrl,
        currentBranch: branch,

        link: utils.format(GITHUB_REPO_LINK, project, repo),
        prsLink: utils.format(GITHUB_REPO_PRS_LINK, project, repo),
      }
    }
  }

function _getStashInfo (gitUrl: string, branch: string) : GitRepoInfo | undefined {
    const STASH_SSH_URL_PATTERN = new RegExp("ssh:\\/\\/git@stash.atlassian.com:[\\d]*\\/(.*)\\/(.*)\\.git");
    const STASH_HTTP_URL_PATTERN = new RegExp("https:\\/\\/(.*)@stash.atlassian.com\\/scm\\/(.*)/(.*).git");
  
    const STASH_REPO_LINK = 'https://stash.atlassian.com/projects/%s/repos/%s/browse';
    const STASH_REPO_PRS_LINK = 'https://stash.atlassian.com/projects/%s/repos/%s/pull-requests';
    const STASH_CREATE_PR_LINK = 'https://stash.atlassian.com/projects/%s/repos/%s/pull-requests?create&sourceBranch=%s';
    const STASH_BUILDS_LINK = 'https://stash.atlassian.com/projects/%s/repos/%s/builds?at=refs/heads/%s'
  
    let project, repo;
  
    let result = gitUrl.match(STASH_SSH_URL_PATTERN);
    if (result) {
      project = result[1];
      repo = result[2];
  
    } else {
      result = gitUrl.match(STASH_HTTP_URL_PATTERN);
  
      if (result) {
        project = result[2];
        repo = result[3];
      }
    }
  
    if (project && repo) {
      return {
        server: 'stash',
        repo: repo,
        project: project,
        gitUrl: gitUrl,
        currentBranch: branch,
        link: utils.format(STASH_REPO_LINK, project, repo),
        prsLink: utils.format(STASH_REPO_PRS_LINK, project, repo),
        buildsLink: encodeURI(utils.format(STASH_BUILDS_LINK, project, repo, branch)),
      }
    }
  }

function _getBitButketInfo (gitUrl: string, branch: string) : GitRepoInfo | undefined {
    const BITBUCKET_SSH_URL_PATTERN = /git@bitbucket\.org:(.*)\/(.*)\.git/;
    const BITBUCKET_HTTP_URL_PATTERN = /https:\/\/(.*)@bitbucket\.org\/(.*)\/(.*).git/;
  
    const BITBUCKET_REPO_LINK = 'https://bitbucket.org/%s/%s';
    const BITBUCKET_REPO_PRS_LINK = 'https://bitbucket.org/%s/%s/pull-requests';
    const BITBUCKET_BRANCH_PR_LINK = 'https://bitbucket.org/%s/%s/pull-requests?query=%s';
    const BITBUCKET_CREATE_PR_LINK = 'https://bitbucket.org/%s/%s/pull-requests/new?source=%s';
  
    let project, repo;
  
    let result = gitUrl.match(BITBUCKET_SSH_URL_PATTERN);
    if (result) {
      project = result[1];
      repo = result[2];
  
    } else {
      result = gitUrl.match(BITBUCKET_HTTP_URL_PATTERN);
  
      if (result) {
        project = result[2];
        repo = result[3];
      }
    }
  
    if (project && repo) {
      return {
        server: 'bitbucket',
        repo: repo,
        project: project,
        gitUrl: gitUrl,
        currentBranch: branch,
  
        link: utils.format(BITBUCKET_REPO_LINK, project, repo),
        prsLink: utils.format(BITBUCKET_REPO_PRS_LINK, project, repo),
      }
    }
  }

async function _gitBranch (path: string) : Promise<string> {
    return await _exec(`cd ${path}  &&git rev-parse --abbrev-ref HEAD`);
}

async function _gitRootPath () : Promise<string> {
    return await _exec('git rev-parse --show-toplevel');
}  

async function _getGitUrl (path: string) : Promise<string> {
    const command = `cd ${path}  && git config --get remote.origin.url`;
    return await _exec(command);
}

function _exec(command: string) : Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, function (error, stdout) {
        console.log(`Command ${command} ==> stdout  ${stdout}`)
        if (error || !stdout) {
            resolve('');
        } else {
            resolve(stdout.trim());
        }
        });
    });
}