import { get } from 'lodash';
import { Context, MyQuery } from './types';
export const buildRequestBody = (data: any) => `request=${JSON.stringify(data)}`;

type GraphSpec = [string, any];

export function graphDefinitionRequest(query: MyQuery, range: number[]): string {
  return buildRequestBody({
    specification: graphSpecification(query),
    data_range: {
      time_range: range,
    },
  });
}

function graphSpecification(query: MyQuery): GraphSpec {
  if (query.graphMode === 'graph') {
    return graphTemplateSpecification(query);
  } else if (query.graphMode === 'metric') {
    return singleMetricGraphSpecification(query);
  } else if (query.graphMode === 'combined') {
    return combinedGraphSpecification(query);
  }
  throw new Error('Unknown graph mode');
}

function extractSingleInfos(context: Context) {
  return {
    site: get(context, 'siteopt.site', ''),
    host_name: get(context, 'host.host', ''),
    service_description: get(context, 'service.service', ''),
  };
}

function graphTemplateSpecification({ params, context }: MyQuery): GraphSpec {
  return [
    'template',
    {
      ...extractSingleInfos(context || {}),
      graph_index: params.graph_index,
    },
  ];
}

function singleMetricGraphSpecification({ params, context }: MyQuery): GraphSpec {
  return [
    'single_timeseries',
    {
      ...extractSingleInfos(context || {}),
      metric: params.metric,
    },
  ];
}

function combinedGraphSpecification({ params, context }: MyQuery): GraphSpec {
  return [
    'combined',
    {
      context: context || {},
      datasource: 'services',
      presentation: params.presentation,
      graph_template: params.graph_name,
    },
  ];
}
