import { Application } from "@raycast/api"

export interface Configs {
    rootSourceFolder: string,
    bambooBaseUrl: string,
    bambooAccessKey: string,
    vsCode: Application,
    idea: Application
}

export interface Repos {
    name: string,
    path: string,
    repoIcon: string,
    gitInfo?: GitRepoInfo
}

export interface BambooProject {
    name: string,
    description: string,
    key: string,
    link: string
}

export interface GitRepoInfo {
    server: string,
    repo: string,
    project: string,
    currentBranch: string,
    gitUrl: string,
    link: string,
    prsLink: string,
    buildsLink?: string
}

export interface BambooProjectPlan {
    key: string,
    name: string,
    icon: string,
    description: string,
    link: string,
    latestBuildLink: string
}

export interface BambooBuildByProjectProps {
    projectKey: string,
    restLink: string
}

export interface GitDetailProps {
    repo: Repos,
}


