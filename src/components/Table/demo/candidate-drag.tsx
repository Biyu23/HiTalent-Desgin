import {
  EyeOutlined,
  FullscreenOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  WechatOutlined,
} from '@ant-design/icons';
import { Badge, Button, Checkbox, Tooltip, Typography } from 'antd';
import { createStyles, css } from 'antd-style';
import React, { useMemo, useState } from 'react';
import Table from '..';
import type { RowDragEndEvent, TableColumn, TableColumnState } from '../type';
import type { Candidate } from './candidateData';
import { candidateData } from './candidateData';

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

    .ant-pagination {
      margin-inline: ${token.margin}px;
    }
  `,
  toolbar: css`
    display: flex;
    min-height: 52px;
    align-items: center;
    justify-content: space-between;
    padding-inline: ${token.padding}px;
  `,
  titleGroup: css`
    display: flex;
    align-items: center;
    gap: ${token.marginSM}px;
  `,
  title: css`
    margin: 0 !important;
    font-size: 18px !important;
  `,
  divider: css`
    width: 1px;
    height: 18px;
    background: ${token.colorSplit};
  `,
  cellText: css`
    display: block;
    overflow: hidden;
    color: ${token.colorTextSecondary};
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  nameCell: css`
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: ${token.marginSM}px;
  `,
  channels: css`
    display: inline-flex;
    flex: none;
    gap: 2px;
    color: ${token.colorPrimary};

    .ant-btn {
      width: 20px;
      min-width: 20px;
      height: 20px;
      padding: 0;
    }
  `,
}));

const channelIcons = {
  view: <EyeOutlined />,
  phone: <PhoneOutlined />,
  mail: <MailOutlined />,
  linkedin: <LinkedinOutlined />,
  wechat: <WechatOutlined />,
};

const channelLabels = {
  view: '查看档案',
  phone: '电话',
  mail: '邮件',
  linkedin: 'LinkedIn',
  wechat: '微信',
};

const initialColumnState: TableColumnState = [
  { key: 'name', width: 330 },
  { key: 'jobTitle', width: 240 },
  { key: 'industry', width: 220 },
  { key: 'recentCompany', width: 230 },
  { key: 'jobFunction', width: 220 },
  { key: 'school', width: 250 },
  { key: 'degree', width: 130 },
  { key: 'experience', width: 130 },
];

export default function CandidateDragDemo() {
  const { styles } = useDemoStyles();
  const [dataSource, setDataSource] = useState(() => [...candidateData]);
  const [columnState, setColumnState] = useState(initialColumnState);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const columns = useMemo<readonly TableColumn<Candidate>[]>(
    () => [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        render: (name: string, record) => (
          <div className={styles.nameCell}>
            <Typography.Link>{name}</Typography.Link>
            <span className={styles.channels}>
              {record.channels.map((channel) => (
                <Tooltip key={channel} title={channelLabels[channel]}>
                  <Button
                    type="link"
                    size="small"
                    aria-label={channelLabels[channel]}
                    icon={channelIcons[channel]}
                  />
                </Tooltip>
              ))}
            </span>
          </div>
        ),
      },
      {
        key: 'jobTitle',
        title: 'Job Title',
        dataIndex: 'jobTitle',
        render: (value: string) => (
          <span className={styles.cellText} title={value}>
            {value}
          </span>
        ),
      },
      {
        key: 'industry',
        title: 'Industry',
        dataIndex: 'industry',
        render: (value: string) => (
          <span className={styles.cellText} title={value}>
            {value}
          </span>
        ),
      },
      {
        key: 'recentCompany',
        title: 'Recent Company',
        dataIndex: 'recentCompany',
        render: (value: string) => (
          <span className={styles.cellText} title={value}>
            {value}
          </span>
        ),
      },
      {
        key: 'jobFunction',
        title: 'Job Function',
        dataIndex: 'jobFunction',
        render: (value: string) => (
          <span className={styles.cellText} title={value}>
            {value}
          </span>
        ),
      },
      {
        key: 'school',
        title: 'School',
        dataIndex: 'school',
        render: (school: string) => (
          <Typography.Link ellipsis title={school}>
            {school}
          </Typography.Link>
        ),
      },
      { key: 'degree', title: 'Degree', dataIndex: 'degree' },
      {
        key: 'experience',
        title: 'Experience',
        dataIndex: 'experience',
        align: 'right',
        render: (years: number) => `${years} years`,
      },
    ],
    [styles.cellText, styles.channels, styles.nameCell],
  );

  const moveRow = ({ nextDataSource }: RowDragEndEvent<Candidate>) => {
    setDataSource([...nextDataSource]);
  };

  return (
    <Table<Candidate>
      data-demo="candidate-drag"
      rowKey="key"
      size="middle"
      columns={columns}
      dataSource={dataSource}
      columnState={columnState}
      onColumnStateChange={setColumnState}
      columnSetting={{ title: 'Choose visible columns' }}
      columnResize
      columnDrag
      rowDrag={{ mode: 'flat', handle: { title: '' } }}
      onRowDragEnd={moveRow}
      zebraStripe={false}
      className={styles.shell}
      toolbarExtra={
        <div className={styles.toolbar}>
          <div className={styles.titleGroup}>
            <Typography.Title level={4} className={styles.title}>
              Candidate List
            </Typography.Title>
            <span className={styles.divider} />
            <Checkbox>HR LinkedIn Tracking</Checkbox>
            <Badge count={candidateData.length * 9} overflowCount={99} />
          </div>
          <Tooltip title="Fullscreen preview">
            <Button
              type="text"
              aria-label="Fullscreen preview"
              icon={<FullscreenOutlined />}
            />
          </Tooltip>
        </div>
      }
      rowSelection={{
        fixed: 'left',
        selectedRowKeys: selectedKeys,
        onChange: setSelectedKeys,
      }}
      scroll={{ x: 1770, y: 420 }}
      pagination={{
        pageSize: 8,
        pageSizeOptions: [8, 12],
        showSizeChanger: true,
        showTotal: (total) => `${total.toLocaleString()} results`,
      }}
    />
  );
}
