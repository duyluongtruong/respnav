import { ActionPanel, Action, Detail, Image, List } from '@raycast/api';
import { GitDetailProps, GitRepoInfo } from '../types';
import { useEffect, useState, ReactNode } from 'react';
import {gitInfo} from '../utils/git';

export function GitDetail(props : GitDetailProps) {
  const [gitRepoInfo, setGitRepoInfo] = useState<GitRepoInfo>();

  useEffect(
    () => {
        (async () => {
          const gitRepoInfo = await gitInfo(props.repo.path);

          if (gitRepoInfo) {
            setGitRepoInfo(gitRepoInfo);
          }
        })();
    }
  , []);

  return (
    <List>
      <ListContent gitRepoInfo={gitRepoInfo} />
    </List>
  );
}

function ListContent(repos : {gitRepoInfo : GitRepoInfo}) : ReactNode {
  const gitRepoInfo = repos.gitRepoInfo;

  console.log('Branch build links ' + gitRepoInfo?.buildsLink);
  if (gitRepoInfo) {
    return (
      <List.Section title={`Git reposistory Info ${gitRepoInfo.gitUrl}`}>
        <List.Item 
          icon={{ source: "url.svg", mask: Image.Mask.Circle }} 
          title="Open Repo" 
          actions={
            <ActionPanel>
              <Action.OpenInBrowser icon={{ source: "url.svg", mask: Image.Mask.Circle }} title='Open Repo In The Browser' url={gitRepoInfo?.link} />
            </ActionPanel>
          } />
        <List.Item 
          icon={{ source: "pull-requests.svg", mask: Image.Mask.Circle }} 
          title="Open Repo PRs"
          actions={
            <ActionPanel>
              <Action.OpenInBrowser icon={{ source: "pull-requests.svg", mask: Image.Mask.Circle }} title='Open Repo PRs' url={gitRepoInfo?.prsLink} />
            </ActionPanel>
          } />

          {gitRepoInfo.buildsLink && 
          <List.Item 
            icon={{ source: "bamboo.png", mask: Image.Mask.Circle }} 
            title="Open Branch Builds"
            actions={
              <ActionPanel>
                <Action.OpenInBrowser icon={{ source: "bamboo.png", mask: Image.Mask.Circle }} title='Open Branch Builds' url={gitRepoInfo?.buildsLink} />
              </ActionPanel>
            } />
          }
      </List.Section>
    );
  }

  return (
    <List.EmptyView title='Not valid Git repo 😢'></List.EmptyView>
  );
}