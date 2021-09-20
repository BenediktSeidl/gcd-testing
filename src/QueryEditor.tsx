import defaults from 'lodash/defaults';

import React from 'react';
import { InlineFieldRow, InlineField, Select } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';
import { GraphOfServiceQuery } from './components/templategraphs';
import { CombinedGraphSelect, FilterEditor, SelectAggregation } from './components/combinedgraphs';
//import { logError } from '@grafana/runtime';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

interface GraphModeProps {
  query: MyQuery;
  onChange: (value: MyQuery) => void;
}

function GraphModeSelect({ query, onChange }: GraphModeProps) {
  const onModeChange = ({ value }: SelectableValue<string>) => {
    if (value === query.graphMode) {
      return;
    }
    onChange({ refId: query.refId, graphMode: value, params: { site_id: query.params.site_id }, context: {} });
  };

  const graph_modes = [
    { label: 'Service graph', value: 'graph' },
    { label: 'Single metric', value: 'metric' },
    { label: 'Combined graph', value: 'combined' },
  ];
  return (
    <InlineField labelWidth={14} label="Mode">
      <Select
        width={32}
        options={graph_modes}
        onChange={onModeChange}
        value={query.graphMode}
        placeholder="Select Graph"
      />
    </InlineField>
  );
}

export const QueryEditor = (props: Props) => {
  const query = defaults(props.query, defaultQuery);

  return (
    <div className="gf-form-group">
      <InlineFieldRow>
        <GraphModeSelect {...props} query={query} />
      </InlineFieldRow>

      {(query.graphMode === 'graph' || query.graphMode === 'metric') && <GraphOfServiceQuery {...props} />}
      {query.graphMode === 'combined' && (
        <>
          <FilterEditor {...props} />
          <SelectAggregation {...props} />
          <CombinedGraphSelect {...props} />
        </>
      )}
    </div>
  );
};
