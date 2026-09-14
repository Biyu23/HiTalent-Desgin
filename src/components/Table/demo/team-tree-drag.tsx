import { QuestionCircleOutlined } from '@ant-design/icons';
import { Table as AntdTable, Button, Select, Space, Tooltip } from 'antd';
import { createStyles, css } from 'antd-style';
import React, { useMemo, useState } from 'react';
import Table from '..';
import type { RowDragEndEvent, TableColumn, TableColumnState } from '../type';

interface TeamMetric {
  key: string;
  team: string;
  companies: number;
  openings: number;
  associatedJobs: number;
  candidates: number;
  submittedJob: number;
  submittedClient: number;
  interviews: number;
  children?: TeamMetric[];
}

const initialData: readonly TeamMetric[] = [
  {
    key: 'us',
    team: 'US',
    companies: 8,
    openings: 21,
    associatedJobs: 13,
    candidates: 42,
    submittedJob: 18,
    submittedClient: 11,
    interviews: 9,
    children: [
      {
        key: 'us-executive',
        team: 'US - Executive',
        companies: 2,
        openings: 5,
        associatedJobs: 4,
        candidates: 8,
        submittedJob: 4,
        submittedClient: 3,
        interviews: 2,
      },
      {
        key: 'us-am',
        team: 'US - AM',
        companies: 1,
        openings: 3,
        associatedJobs: 2,
        candidates: 7,
        submittedJob: 2,
        submittedClient: 1,
        interviews: 1,
      },
      {
        key: 'us-ella',
        team: 'US - Ella Zheng - FTE Team',
        companies: 2,
        openings: 6,
        associatedJobs: 3,
        candidates: 12,
        submittedJob: 5,
        submittedClient: 3,
        interviews: 3,
      },
      {
        key: 'us-support',
        team: 'US - Supporting Team',
        companies: 3,
        openings: 7,
        associatedJobs: 4,
        candidates: 15,
        submittedJob: 7,
        submittedClient: 4,
        interviews: 3,
      },
    ],
  },
  {
    key: 'apac',
    team: 'APAC',
    companies: 6,
    openings: 17,
    associatedJobs: 9,
    candidates: 36,
    submittedJob: 15,
    submittedClient: 8,
    interviews: 7,
    children: [
      {
        key: 'apac-shanghai',
        team: 'APAC - Shanghai',
        companies: 3,
        openings: 9,
        associatedJobs: 5,
        candidates: 20,
        submittedJob: 9,
        submittedClient: 5,
        interviews: 4,
      },
      {
        key: 'apac-singapore',
        team: 'APAC - Singapore',
        companies: 3,
        openings: 8,
        associatedJobs: 4,
        candidates: 16,
        submittedJob: 6,
        submittedClient: 3,
        interviews: 3,
      },
    ],
  },
  {
    key: 'emea',
    team: 'EMEA',
    companies: 5,
    openings: 12,
    associatedJobs: 7,
    candidates: 28,
    submittedJob: 10,
    submittedClient: 6,
    interviews: 5,
  },
];

const initialColumnState: TableColumnState = [
  { key: 'team', width: 270 },
  { key: 'companies', width: 180 },
  { key: 'openings', width: 180 },
  { key: 'associatedJobs', width: 250 },
  { key: 'candidates', width: 190 },
  { key: 'submittedJob', width: 190 },
  { key: 'submittedClient', width: 210 },
  { key: 'interviews', width: 220 },
];

const metricKeys = [
  'companies',
  'openings',
  'associatedJobs',
  'candidates',
  'submittedJob',
  'submittedClient',
  'interviews',
] as const;

function flattenTeams(records: readonly TeamMetric[]): TeamMetric[] {
  return records.flatMap((record) => [
    record,
    ...(record.children ? flattenTeams(record.children) : []),
  ]);
}

const useDemoStyles = createStyles(({ token }) => ({
  shell: css`
    overflow: hidden;
    background: ${token.colorBgContainer};
    border: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    .ant-table-thead > tr > th {
      padding-block: 14px;
      font-weight: 650;
      background: ${token.colorFillQuaternary};
    }

    .ant-table-tbody > tr > td,
    .ant-table-summary > tr > td {
      padding-block: 11px;
    }

    .ant-table-summary {
      font-weight: 600;
      background: ${token.colorBgContainer};
    }
  `,
  filters: css`
    display: flex;
    width: 100%;
    min-height: 58px;
    align-items: center;
    justify-content: space-between;
    gap: ${token.margin}px;
    padding-inline: ${token.padding}px;
  `,
  filterFields: css`
    display: flex;
    min-width: 0;
    flex-wrap: wrap;
    gap: ${token.marginSM}px;
  `,
  filterSelect: css`
    min-width: 180px;
  `,
  activePeriod: css`
    .ant-select-selector {
      color: ${token.colorPrimary} !important;
      background: ${token.colorPrimaryBg} !important;
      border-color: ${token.colorPrimaryBorder} !important;
    }
  `,
}));

export default function TeamTreeDragDemo() {
  const { styles } = useDemoStyles();
  const [dataSource, setDataSource] = useState(() => [...initialData]);
  const [columnState, setColumnState] = useState(initialColumnState);
  const [period, setPeriod] = useState('week');
  const [teamScope, setTeamScope] = useState('all');
  const [pipeline, setPipeline] = useState('all');
  const columns = useMemo<readonly TableColumn<TeamMetric>[]>(
    () => [
      {
        key: 'team',
        title: 'Team',
        dataIndex: 'team',
        fixed: 'left',
        hideable: false,
        minWidth: 220,
      },
      { key: 'companies', title: 'Created Companies', dataIndex: 'companies' },
      { key: 'openings', title: 'Sum of Openings', dataIndex: 'openings' },
      {
        key: 'associatedJobs',
        title: (
          <Space size={4}>
            Associated with Jobs
            <Tooltip title="Jobs associated with this team">
              <QuestionCircleOutlined />
            </Tooltip>
          </Space>
        ),
        dataIndex: 'associatedJobs',
      },
      {
        key: 'candidates',
        title: 'Created Candidates',
        dataIndex: 'candidates',
      },
      {
        key: 'submittedJob',
        title: 'Submitted to Job',
        dataIndex: 'submittedJob',
      },
      {
        key: 'submittedClient',
        title: 'Submitted to Client',
        dataIndex: 'submittedClient',
      },
      {
        key: 'interviews',
        title: 'Interview Appointments',
        dataIndex: 'interviews',
      },
    ],
    [],
  );
  const totals = useMemo(() => {
    const rows = flattenTeams(dataSource);
    return Object.fromEntries(
      metricKeys.map((key) => [
        key,
        rows.reduce((sum, record) => sum + record[key], 0),
      ]),
    ) as Record<(typeof metricKeys)[number], number>;
  }, [dataSource]);
  const visibleMetricKeys = useMemo(
    () =>
      columnState.flatMap((item) =>
        item.visible !== false &&
        metricKeys.includes(item.key as (typeof metricKeys)[number])
          ? [item.key as (typeof metricKeys)[number]]
          : [],
      ),
    [columnState],
  );

  const moveRow = ({ nextDataSource }: RowDragEndEvent<TeamMetric>) => {
    setDataSource([...nextDataSource]);
  };

  const resetFilters = () => {
    setPeriod('week');
    setTeamScope('all');
    setPipeline('all');
  };

  return (
    <Table<TeamMetric>
      data-demo="team-tree-drag"
      rowKey="key"
      columns={columns}
      dataSource={dataSource}
      columnState={columnState}
      onColumnStateChange={setColumnState}
      columnSetting={{ title: 'Metric columns' }}
      columnResize
      columnDrag
      rowDrag={{
        mode: 'tree',
        autoExpandDelay: 500,
        handle: { title: '' },
      }}
      onRowDragEnd={moveRow}
      zebraStripe={false}
      className={styles.shell}
      toolbarExtra={
        <div className={styles.filters}>
          <div className={styles.filterFields}>
            <Select
              className={`${styles.filterSelect} ${styles.activePeriod}`}
              value={period}
              onChange={setPeriod}
              options={[
                { label: 'Period: This Week', value: 'week' },
                { label: 'Period: This Month', value: 'month' },
                { label: 'Period: This Quarter', value: 'quarter' },
              ]}
            />
            <Select
              className={styles.filterSelect}
              value={teamScope}
              onChange={setTeamScope}
              options={[
                { label: 'Team / User: All', value: 'all' },
                { label: 'Team / User: US', value: 'us' },
                { label: 'Team / User: APAC', value: 'apac' },
              ]}
            />
            <Select
              className={styles.filterSelect}
              value={pipeline}
              onChange={setPipeline}
              options={[
                { label: 'Pipeline Operation: All', value: 'all' },
                { label: 'Pipeline Operation: Active', value: 'active' },
              ]}
            />
          </div>
          <Space>
            <Button type="primary">Search</Button>
            <Button onClick={resetFilters}>Reset</Button>
          </Space>
        </div>
      }
      expandable={{ defaultExpandedRowKeys: ['us', 'apac'] }}
      pagination={false}
      scroll={{ x: 1690, y: 420 }}
      summary={() => (
        <AntdTable.Summary fixed>
          <AntdTable.Summary.Row>
            <AntdTable.Summary.Cell index={0} />
            <AntdTable.Summary.Cell index={1}>Total</AntdTable.Summary.Cell>
            {visibleMetricKeys.map((key, index) => (
              <AntdTable.Summary.Cell key={key} index={index + 2}>
                {totals[key]}
              </AntdTable.Summary.Cell>
            ))}
          </AntdTable.Summary.Row>
        </AntdTable.Summary>
      )}
    />
  );
}
