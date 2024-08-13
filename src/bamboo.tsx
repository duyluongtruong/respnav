import { Icon, List, ActionPanel, Action } from "@raycast/api";
import { useState } from "react";
import { useFetch } from "@raycast/utils";
import {getConfigs} from './utils/config';
import {OpenCommandPreferences} from './components/OpenCommandPreferences';
import {BambooBuildByProject} from './components/BambooBuildByProject'
import { BambooProject } from "./types";

export default function BambooCommand() {
  const bambooBaseUrl = getConfigs().bambooBaseUrl;
  const bambooAccessKey = getConfigs().bambooAccessKey;
  if (!bambooBaseUrl || !bambooAccessKey) {
    return (
      <OpenCommandPreferences/>
    );
  }

  // load all quickfilter from Bamboo 
  const { data, isLoading } = useFetch(
    `${bambooBaseUrl}/rest/api/latest/project?max-result=1000`,
    {
      headers: { Accept: "application/json", Authorization: `Bearer ${bambooAccessKey}` },
      parseResponse: parseResponse
    }
  );

  return (
  <List isLoading={isLoading} searchBarPlaceholder="Search Confluence Project"> 
    <List.Section title="Confluence Bamboo Quick Filter" subtitle={data?.length + ""}>
        {data?.map((project) => (
            <List.Item
              key={project.key}
              title={project.name}
              icon={Icon.Filter}
              accessories={[{text: project.description ?? project.name}]}
              actions={
                <ActionPanel title='Action for Bamboo QuickFilter'>
                  <Action.Push
                    title="See Package Details"
                    target={<BambooBuildByProject restLink={project.link} projectKey={project.key} />}
                    icon={Icon.Info}
                  />
                </ActionPanel>
              }
          />
        ))}
      </List.Section>
  </List>) ;
}

async function parseResponse(response : Response) : Promise<BambooProject> {
  const jsonResp = await response.json();

  return jsonResp.projects.project
    // .filter(project => {
    //   return project.key.startsWith('CONF');
    // })
    .map(project => {
    return {
      name: project.name,
      description: project.description,
      key: project.key,
      link: project.link.href
    }
  });
}
