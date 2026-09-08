import { Button, Space, Tag, Typography } from 'antd';
import { createStyles, css } from 'antd-style';
import React, { useMemo, useState } from 'react';
import Table from '..';
import type { TableColumn, TableColumnState } from '../type';
import type { Candidate } from './candidateData';
import { candidateData } from './candidateData';

type SortOrder = 'ascend' | 'descend' | null;

interface SortState {
  columnKey?: React.Key;
  order?: SortOrder;
}

const initialColumnState: TableColumnState = [
  { key: 'name', width: 240 },
  { key: 'jobTitle', width: 260 },
  { key: 'recentCompany', width: 230 },
  { key: 'industry', width: 220 },
  { key: 'school', width: 250 },
  { key: 'experience', width: 150 },
];

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

    .ant-table-tbody > tr > td {
      padding-block: 10px;
    }
  `,
  toolbar: css`
    display: flex;
    width: 100%;
    min-height: 52px;
    align-items: center;
    justify-content: space-between;
    padding-inline: ${token.padding}px;
  `,
  title: css`
    margin: 0 !important;
    font-size: 18px !important;
  `,
  muted: css`
    display: block;
    overflow: hidden;
    color: ${token.colorTextSecondary};
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

function compareText(left: string, right: string) {
  return left.localeCompare(right, ['zh-CN', 'en-US']);
}

export default function CandidateSortDemo() {
  const { styles } = useDemoStyles();
  const [sortState, setSortState] = useState<SortState>({});
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const columns = useMemo<readonly TableColumn<Candidate>[]>(
    () => [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        fixed: 'left',
        sorter: (left, right) => compareText(left.name, right.name),
        sortOrder: sortState.columnKey === 'name' ? sortState.order : null,
        render: (name: string) => <Typography.Link>{name}</Typography.Link>,
      },
      {
        key: 'jobTitle',
        title: 'Job Title',
        dataIndex: 'jobTitle',
        sorter: (left, right) => compareText(left.jobTitle, right.jobTitle),
        sortOrder: sortState.columnKey === 'jobTitle' ? sortState.order : null,
        render: (value: string) => (
          <span className={styles.muted} title={value}>
            {value}
          </span>
        ),
      },
      {
        key: 'recentCompany',
        title: 'Recent Company',
        dataIndex: 'recentCompany',
        sorter: (left, right) =>
          compareText(left.recentCompany, right.recentCompany),
        sortOrder:
          sortState.columnKey === 'recentCompany' ? sortState.order : null,
        render: (value: string) => (
          <span className={styles.muted} title={value}>
            {value}
          </span>
        ),
      },
      {
        key: 'industry',
        title: 'Industry',
        dataIndex: 'industry',
        sorter: (left, right) => compareText(left.industry, right.industry),
        sortOrder: sortState.columnKey === 'industry' ? sortState.order : null,
      },
      {
        key: 'school',
        title: 'School',
        dataIndex: 'school',
        sorter: (left, right) => compareText(left.school, right.school),
        sortOrder: sortState.columnKey === 'school' ? sortState.order : null,
        render: (school: string) => (
          <Typography.Link ellipsis title={school}>
            {school}
          </Typography.Link>
        ),
      },
      {
        key: 'experience',
        title: 'Experience',
        dataIndex: 'experience',
        align: 'right',
        sorter: (left, right) => left.experience - right.experience,
        sortOrder:
          sortState.columnKey === 'experience' ? sortState.order : null,
        render: (years: number) => `${years} years`,
      },
    ],
    [sortState, styles.muted],
  );
  const sortLabel = sortState.columnKey
    ? `${String(sortState.columnKey)} · ${
        sortState.order === 'ascend' ? 'ascending' : 'descending'
      }`
    : 'Not sorted';

  return (
    <Table<Candidate>
      data-demo="candidate-sort"
      rowKey="key"
      columns={columns}
      dataSource={[...candidateData]}
      defaultColumnState={initialColumnState}
      columnSetting={{ title: 'Sort table columns' }}
      columnResize
      columnDrag={false}
      rowDrag={false}
      zebraStripe={false}
      classNames={{ root: styles.shell }}
      toolbarExtra={
        <div className={styles.toolbar}>
          <Space>
            <Typography.Title level={4} className={styles.title}>
              Candidate Sort
            </Typography.Title>
            <Tag color={sortState.columnKey ? 'blue' : 'default'}>
              {sortLabel}
            </Tag>
          </Space>
          <Button
            disabled={!sortState.columnKey}
            onClick={() => setSortState({})}
          >
            Reset sort
          </Button>
        </div>
      }
      rowSelection={{
        fixed: 'left',
        selectedRowKeys: selectedKeys,
        onChange: setSelectedKeys,
      }}
      scroll={{ x: 1350 }}
      pagination={{ pageSize: 8, showSizeChanger: false }}
      onChange={(_, __, sorter) => {
        const current = Array.isArray(sorter) ? sorter[0] : sorter;
        setSortState({
          columnKey: current.columnKey,
          order: current.order,
        });
      }}
    />
  );
}
