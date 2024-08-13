import { ActionPanel, Action, List, showHUD, Image, getApplications, useNavigation, Navigation} from "@raycast/api";
import { ReactNode, useEffect, useState } from "react";
import { getDirectSubfolders } from './utils/fs'
import {getConfigs} from './utils/config';
import {OpenCommandPreferences} from './components/OpenCommandPreferences';
import { Repos } from './types';
import orderBy from 'lodash/orderBy';
import {runAppleScriptSilently} from './utils/applescript'
import { GitDetail } from "./components/GitDetail";


const OPEN_IN_ITERM_AS =
      'tell application "iTerm"\n' +
      'activate\n' +
      'tell current window\n' +
      'set newTab to (create tab with default profile)\n' +
      'tell last session of newTab\n' +
      'write text "cd " & quoted form of "%s"\n' +
      'end tell\n' +
      'end tell\n' +
      'end tell\n';

export default function Command() {
  const rootDir = getConfigs().rootSourceFolder;
  const vsCode = getConfigs().vsCode;
  const idea = getConfigs().idea;
  if (!rootDir || !vsCode || !idea) {
    return (
      <OpenCommandPreferences/>
    );
  }

  const { push } = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reposList, setreposList] = useState<Repos[]>([]);
  useEffect(() => {
    (async () => {
      const reposList = orderBy(getDirectSubfolders(rootDir), ['name']);
      // for (const repo of reposList) {
      //   const gitRepoInfo = await gitInfo(repo.path);
      //   repo.gitInfo = gitRepoInfo;
      // }
     
      setreposList(reposList);
      setIsLoading(false);
    })();
  }, []);

  // start loading repos
  //const reposList = orderBy(getDirectSubfolders(rootDir), ['name']);

  return (
    <List
      searchBarPlaceholder="Search reposistory locally"
      isLoading={isLoading}
    >
      <List.Section title="Reposistory" subtitle={reposList?.length + ""}>
        {reposList?.map((repo) => (
            <List.Item
              title={repo.name}
              icon={repo.repoIcon}
              accessories={[{text: repo.path}]}

              actions= {
                getActions(repo, push)
              }
          />
        ))}
      </List.Section>
    </List>
  );
}

function getActions(repo : Repos, push: Navigation) : ReactNode {
  const vsCode = getConfigs().vsCode;
  const idea = getConfigs().idea;
  
  if (repo.repoIcon === 'java.png') {
    return (
      <ActionPanel title={`Actions for this reposistory "${repo.name}":`}>
          <Action.Open
            target= {repo.path}
            title={`Open In "${idea.path}"`}
            icon= {{ source: "idea.png", mask: Image.Mask.Circle }}
            
            application={idea}
          />
          <Action.ShowInFinder 
            title="Open In Finder" 
            path={repo.path} 
            shortcut={{ modifiers: ["cmd"], key: "f" }} />
          <Action.Open
            target= {repo.path}
            title={`Open In "${vsCode.path}"`}
            icon= {{ source: "vscode.jpg", mask: Image.Mask.Circle }}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
            application={vsCode}
          />
          <Action 
            title="Open in iTerm"
            icon="iterm.png"
            shortcut={{ modifiers: ["cmd"], key: "t" }}
            onAction= {() => {
              openInIterm(repo.path);
            }}
          />
          <Action
            title="Open Git Detail"
            icon={{ source: "git-icon.svg", mask: Image.Mask.Circle }}
            shortcut={{ modifiers: ["cmd"], key: "g" }}
            onAction={() => {
              push(<GitDetail repo={repo} />);
            }}
          />
       </ActionPanel>
    );
  } else {
    return (
      <ActionPanel title={`Actions for this reposistory "${repo.name}":`}>
        <Action.Open
          target= {repo.path}
          title={`Open In "${vsCode.path}"`}
          icon= {{ source: "vscode.jpg", mask: Image.Mask.Circle }}
          application={vsCode}
        />
        <Action.ShowInFinder 
          title="Open In Finder" 
          path={repo.path}
          shortcut={{ modifiers: ["cmd"], key: "f" }} />
        <Action.Open
          target= {repo.path}
          title={`Open In "${idea.path}"`}
          icon= {{ source: "idea.png", mask: Image.Mask.Circle }}
          shortcut={{ modifiers: ["cmd"], key: "i" }}
          application={idea}
        />
        <Action 
            title="Open in iTerm"
            icon={{ source: "iterm.png", mask: Image.Mask.Circle }}
            shortcut={{ modifiers: ["cmd"], key: "t" }}
            onAction= {() => {
              openInIterm(repo.path);
            }}
          />
        <Action
          title="Open Git Detail"
          icon={{ source: "git-icon.svg", mask: Image.Mask.Circle }}
          shortcut={{ modifiers: ["cmd"], key: "g" }}
          onAction={() => {
            push(<GitDetail repo={repo} />);
          }}
        />
       </ActionPanel>
    );
  }
}

async function openInIterm(path: string) {
  const applications = await getApplications();
    const isItermInstalled = applications.some((app) => app.name === "iTerm2");
    if (!isItermInstalled) {
      await showHUD("iTerm is not installed");
      return;
    }

  const script = OPEN_IN_ITERM_AS.replace('%s', path);
  runAppleScriptSilently(script);
}



