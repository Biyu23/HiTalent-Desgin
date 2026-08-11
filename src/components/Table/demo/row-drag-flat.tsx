import { Button, message, Space, Tag } from 'antd';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import HiTable from '../index';
import type { EnhancedColumnType, RowDragResult, TableRef } from '../type';

interface FlatRow {
  key: string;
  name: string;
  owner: string;
  priority: string;
  status: string;
  deadline: string;
}

const messages = {
  'zh-CN': {
    'column.task': '任务名称',
    'column.owner': '负责人',
    'column.priority': '优先级',
    'column.status': '状态',
    'column.deadline': '截止日期',
    'priority.high': '高',
    'priority.medium': '中',
    'priority.low': '低',
    'status.progress': '进行中',
    'status.todo': '待开始',
    'status.done': '已完成',
    'status.delayed': '已延期',
    'task.login': '用户登录页重构',
    'task.dashboard': '数据看板性能优化',
    'task.validation': '补充表单校验规则',
    'task.theme': '全局主题切换',
    'task.notice': '消息通知模块',
    'task.upload': '封装文件上传组件',
    'action.reset': '重置数据',
    'state.saving': '保存中...',
    'state.synced': '已同步',
    'state.count': '拖拽次数',
    'hint.before': '拖拽行左侧的',
    'hint.after': '手柄调整顺序。扁平列表仅支持 before / after。',
    'message.moved': '拖拽完成',
    'message.before': '之前',
    'message.after': '之后',
    'message.failed': '保存行顺序失败',
  },
  'en-US': {
    'column.task': 'Task',
    'column.owner': 'Owner',
    'column.priority': 'Priority',
    'column.status': 'Status',
    'column.deadline': 'Deadline',
    'priority.high': 'High',
    'priority.medium': 'Medium',
    'priority.low': 'Low',
    'status.progress': 'In progress',
    'status.todo': 'To do',
    'status.done': 'Completed',
    'status.delayed': 'Delayed',
    'task.login': 'Refactor sign-in page',
    'task.dashboard': 'Optimize dashboard performance',
    'task.validation': 'Extend form validation',
    'task.theme': 'Add global theme switching',
    'task.notice': 'Build notification module',
    'task.upload': 'Package file upload component',
    'action.reset': 'Reset data',
    'state.saving': 'Saving...',
    'state.synced': 'Synced',
    'state.count': 'Drag count',
    'hint.before': 'Drag the',
    'hint.after':
      'handle at the left of a row. Flat lists support before / after.',
    'message.moved': 'Row moved',
    'message.before': 'before',
    'message.after': 'after',
    'message.failed': 'Failed to save row order',
  },
};

async function mockSaveRowOrder(dataSource: FlatRow[]) {
  await new Promise((resolve) => {
    setTimeout(resolve, 300);
  });
  console.table(dataSource);
}

const RowDragFlatDemo: React.FC = () => {
  const { t } = useDemoIntl(messages);
  const tableRef = useRef<TableRef>(null);
  const initialData = useMemo<FlatRow[]>(
    () => [
      {
        key: '1',
        name: t('task.login'),
        owner: 'Alex',
        priority: t('priority.high'),
        status: t('status.progress'),
        deadline: '2026-08-15',
      },
      {
        key: '2',
        name: t('task.dashboard'),
        owner: 'Morgan',
        priority: t('priority.high'),
        status: t('status.progress'),
        deadline: '2026-08-10',
      },
      {
        key: '3',
        name: t('task.validation'),
        owner: 'Jamie',
        priority: t('priority.medium'),
        status: t('status.todo'),
        deadline: '2026-08-20',
      },
      {
        key: '4',
        name: t('task.theme'),
        owner: 'Taylor',
        priority: t('priority.low'),
        status: t('status.done'),
        deadline: '2026-07-30',
      },
      {
        key: '5',
        name: t('task.notice'),
        owner: 'Casey',
        priority: t('priority.medium'),
        status: t('status.delayed'),
        deadline: '2026-07-15',
      },
      {
        key: '6',
        name: t('task.upload'),
        owner: 'Riley',
        priority: t('priority.low'),
        status: t('status.todo'),
        deadline: '2026-09-01',
      },
    ],
    [t],
  );
  const [saving, setSaving] = useState(false);
  const [dragCount, setDragCount] = useState(0);
  const [flatData, setFlatData] = useState(initialData);

  const columns = useMemo<EnhancedColumnType<FlatRow>[]>(
    () => [
      { title: t('column.task'), dataIndex: 'name', key: 'name', width: 220 },
      {
        title: t('column.owner'),
        dataIndex: 'owner',
        key: 'owner',
        width: 100,
      },
      {
        title: t('column.priority'),
        dataIndex: 'priority',
        key: 'priority',
        width: 90,
        cellPreset: 'tag',
        cellPresetProps: {
          colorMap: {
            [t('priority.high')]: 'red',
            [t('priority.medium')]: 'orange',
            [t('priority.low')]: 'default',
          },
        },
      },
      {
        title: t('column.status'),
        dataIndex: 'status',
        key: 'status',
        width: 110,
        cellPreset: 'tag',
        cellPresetProps: {
          colorMap: {
            [t('status.progress')]: 'processing',
            [t('status.todo')]: 'default',
            [t('status.done')]: 'success',
            [t('status.delayed')]: 'error',
          },
        },
      },
      {
        title: t('column.deadline'),
        dataIndex: 'deadline',
        key: 'deadline',
        width: 130,
        cellPreset: 'date',
        cellPresetProps: { format: 'YYYY-MM-DD' },
      },
    ],
    [t],
  );

  const handleFlatRowDragEnd = useCallback(
    async ({ dragKey, targetKey, position }: RowDragResult<FlatRow>) => {
      const dragIndex = flatData.findIndex((item) => item.key === dragKey);
      const targetIndex = flatData.findIndex((item) => item.key === targetKey);
      if (dragIndex < 0 || targetIndex < 0) return;

      const nextData = [...flatData];
      const [draggedItem] = nextData.splice(dragIndex, 1);
      let insertIndex = targetIndex + (position === 'after' ? 1 : 0);
      if (dragIndex < insertIndex) insertIndex -= 1;
      nextData.splice(insertIndex, 0, draggedItem);
      setFlatData(nextData);
      setDragCount((count) => count + 1);
      setSaving(true);

      try {
        await mockSaveRowOrder(nextData);
        message.success(
          `${t('message.moved')}: "${dragKey}" → "${targetKey}" ${t(
            position === 'after' ? 'message.after' : 'message.before',
          )}`,
        );
      } catch {
        message.error(t('message.failed'));
      } finally {
        setSaving(false);
      }
    },
    [flatData, t],
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button
          onClick={() => {
            setFlatData(initialData);
            tableRef.current?.resetColumnState();
            setDragCount(0);
          }}
        >
          {t('action.reset')}
        </Button>
        <Tag color={saving ? 'processing' : 'success'}>
          {saving ? t('state.saving') : t('state.synced')}
        </Tag>
        <Tag color="blue">
          {t('state.count')}: {dragCount}
        </Tag>
      </Space>

      <div
        style={{
          marginBottom: 12,
          color: 'var(--htd-doc-text-secondary, #888)',
          fontSize: 13,
        }}
      >
        {t('hint.before')} <Tag style={{ margin: '0 4px' }}>⠿</Tag>{' '}
        {t('hint.after')}
      </div>

      <HiTable
        ref={tableRef}
        columns={columns}
        dataSource={flatData}
        enableRowDrag
        showColumnSetting
        enableColumnResize
        onRowDragEnd={handleFlatRowDragEnd}
        zebraStripe
        bordered
        pagination={false}
      />
    </div>
  );
};

export default RowDragFlatDemo;
