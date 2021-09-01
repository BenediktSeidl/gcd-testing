import React, { PureComponent } from 'react';
import { Button, InlineField, Input, Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { EditorProps, SelectOptions } from './types';
import { HostFilter, HostLabelsFilter, HostRegExFilter, ServiceRegExFilter } from './site';

export const SelectAggregation = (props: EditorProps) => {
  const combined_presentations = [
    { value: 'lines', label: 'Lines' },
    { value: 'stacked', label: 'Stacked' },
    { value: 'sum', label: 'Sum' },
    { value: 'average', label: 'Average' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
  ];

  const onPresentationChange = async ({ value }: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = props;
    onChange({ ...query, params: { ...query.params, presentation: value } });
    onRunQuery();
  };

  return (
    <InlineField label="Aggregation" labelWidth={14}>
      <Select
        width={32}
        options={combined_presentations}
        onChange={onPresentationChange}
        value={props.query.params.presentation}
        placeholder="Aggregation"
      />
    </InlineField>
  );
};

export class CombinedGraphSelect extends PureComponent<EditorProps, SelectOptions<string>> {
  constructor(props: EditorProps) {
    super(props);
    this.state = { options: [] };
  }

  async fillOptions() {
    this.setState({ options: await this.props.datasource.combinedGraphIdent(this.props.query) });
  }

  async componentDidMount() {
    if (!this.state.options.length) {
      this.fillOptions();
    }
  }

  async componentDidUpdate({ query: { params: prevParams } }: EditorProps) {
    if (!this.state.options.length || prevParams !== this.props.query.params) {
      this.fillOptions();
    }
  }

  onGraphChange = ({ value }: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, params: { ...query.params, graph_name: value } });
    onRunQuery();
  };

  render() {
    return (
      <InlineField labelWidth={14} label="Graph">
        <Select
          width={32}
          options={this.state.options}
          onChange={this.onGraphChange}
          value={this.props.query.params.graph_index}
          placeholder="Select graph"
        />
      </InlineField>
    );
  }
}

export class FilterEditor extends PureComponent<EditorProps> {
  render() {
    const context = this.props.query.context;
    console.log('filters', context);
    return (
      <>
        {Object.entries(context).map(([filtername, filtervars]) => (
          <SelectFilters {...this.props} filtername={filtername} />
        ))}
        <SelectFilters {...this.props} filtername={null} />
      </>
    );
  }
}

export const SelectFilters = (props: EditorProps) => {
  const all_filters = [
    { value: 'hostname', label: 'Hostname', render: HostFilter },
    { value: 'hostregex', label: 'Hostname regex', render: HostRegExFilter },
    { value: 'serviceregex', label: 'Service regex', render: ServiceRegExFilter },
    { value: 'host_labels', label: 'Host Labels', render: HostLabelsFilter },
  ];
  const context = props.query.context || {};
  const available_filters = all_filters.filter(
    ({ value }) => value === props.filtername || !context.hasOwnProperty(value)
  );
  // Early return in case all filters are on
  if (!available_filters.length) {
    return null;
  }
  const activeFilter = all_filters.find(({ value }) => value === props.filtername);
  const ActiveFilter = activeFilter ? activeFilter.render : null;

  const action = () => {
    const { onChange, query, filtername } = props;
    delete query.context[filtername];
    onChange(query);
  };

  const onFilterChange = ({ value }: SelectableValue<string>) => {
    const { onChange, query, filtername } = props;
    delete query.context[filtername];
    onChange({ ...query, context: { ...query.context, [value]: {} } });
  };

  return (
    <>
      <InlineField label="Filter" labelWidth={14}>
        <Select
          width={32}
          options={available_filters}
          onChange={onFilterChange}
          value={props.filtername}
          placeholder="Filter"
        />
      </InlineField>
      {activeFilter && (
        <>
          <Button icon="minus" variant="secondary" onClick={action} />
          <ActiveFilter {...props} />
        </>
      )}
    </>
  );
};