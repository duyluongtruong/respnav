import { Icon, List, ActionPanel, Action } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import {getConfigs} from '../utils/config';
import {BambooBuildByProjectProps, BambooProjectPlan} from '../types';
import {getLiftProgressCanvas} from '../utils/progress';

const bambooBaseUrl = getConfigs().bambooBaseUrl;
const bambooAccessKey = getConfigs().bambooAccessKey;

export function BambooBuildPlan(props: BambooBuildByProjectProps) {
    const { data, isLoading } = useFetch(
        `${bambooBaseUrl}/rest/api/latest/result/${props.projectKey}?max-result=100`,
        {
            method: 'GET',
            headers: { 
                "Authorization": `Bearer ${bambooAccessKey}`,
                "Accept": "application/json"
            },
            parseResponse: parseResponse
        }
    );

    const numberOfFailedBuild = data?.filter(result => result.icon === 'failed.png').length;
    const numberOfPassedBuild = data?.filter(result => result.icon === 'success.png').length;
    const {canvas, text} = getLiftProgressCanvas(numberOfPassedBuild, numberOfFailedBuild, 40);
    return (
      <List isLoading={isLoading} searchBarPlaceholder={"Search Build Plan for project " + props.projectKey}>
        <List.Section >
            <List.Item icon="report.png" title={canvas} subtitle={text} ></List.Item>
        </List.Section>
        <List.Section title={"Confluence Bamboo Build by Project " + props.projectKey} subtitle={data?.length + ""}>
        {data?.map((build) => (
            <List.Item
              key={build.key}
              title={build.name}
              icon={build.icon}
              accessories={[{text: build.key}]}
              actions = {
              <ActionPanel title='Action for Bamboo Plan'>
                  <Action.OpenInBrowser url={build.lastestBuildLinkt} title="Open Latest Build"/>
              </ActionPanel> }
          />
        ))}
        </List.Section>
      </List>
    );
}

async function parseResponse(response: Response) : Promise<BambooProjectPlan[]> {
    const respJson = await response.json();
    return respJson.results.result
        .map(buildResult => {
            let icon = 'success.png';
            if (buildResult.buildState === 'Failed'){
                icon = 'failed.png';
            }

            return {
                key: buildResult.buildResultKey,
                name: buildResult.plan.shortName,
                description: buildResult.plan.name,
                icon: icon,
                link: `${bambooBaseUrl}/browse/${buildResult.plan.key}`,
                lastestBuildLinkt: `${bambooBaseUrl}/browse/${buildResult.buildResultKey}`
            };
         });
}