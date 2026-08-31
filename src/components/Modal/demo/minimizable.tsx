import { Button, Flex, InputNumber, Radio, Space, Switch } from 'antd';
import type { MinimizePosition } from 'hi-talent-design';
import { Drawer, Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useMemo, useState } from 'react';

const messages = {
  'zh-CN': {
    openModal1: '打开弹窗 A（审批工单）',
    openModal2: '打开弹窗 B（系统日志）',
    openDrawer: '打开抽屉 C（任务详情）',
    batch3: '挂起 3 个任务',
    batch4: '挂起 4 个任务',
    batch10: '挂起 10 个任务',
    clearBatch: '清空多任务',
    modal1Title: '审批工单 #1024',
    modal2Title: '系统运行日志',
    drawerTitle: '任务分配与详情',
    content:
      '数量不超过阈值时卡片直接展开；超过阈值后折叠为卡片堆，悬停或键盘聚焦时展开全部。任务较多时支持滚动。',
    positionLabel: '停靠位置',
    stackEnabled: '启用折叠',
    threshold: '折叠阈值',
    bottomRight: '右下',
    bottomLeft: '左下',
    topRight: '右上',
    topLeft: '左上',
  },
  'en-US': {
    openModal1: 'Open Modal A (Approval)',
    openModal2: 'Open Modal B (System Log)',
    openDrawer: 'Open Drawer C (Task Detail)',
    batch3: 'Minimize 3 Tasks',
    batch4: 'Minimize 4 Tasks',
    batch10: 'Minimize 10 Tasks',
    clearBatch: 'Clear Tasks',
    modal1Title: 'Approval Ticket #1024',
    modal2Title: 'System Runtime Log',
    drawerTitle: 'Task Detail & Assignment',
    content:
      'Cards stay expanded until their count exceeds the threshold. A collapsed stack expands on hover or keyboard focus and scrolls when it grows beyond the viewport.',
    positionLabel: 'Dock Position',
    stackEnabled: 'Collapse Stack',
    threshold: 'Threshold',
    bottomRight: 'Bottom Right',
    bottomLeft: 'Bottom Left',
    topRight: 'Top Right',
    topLeft: 'Top Left',
  },
};

interface BatchTask {
  id: string;
  type: 'modal' | 'drawer';
  title: string;
  minimized: boolean;
  open: boolean;
}

export default () => {
  const { t } = useDemoIntl(messages);
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [position, setPosition] = useState<MinimizePosition>('bottom-right');
  const [stackEnabled, setStackEnabled] = useState(true);
  const [threshold, setThreshold] = useState(3);
  const [batchTasks, setBatchTasks] = useState<BatchTask[]>([]);

  const minimizeStack = useMemo(
    () => (stackEnabled ? { threshold } : false),
    [stackEnabled, threshold],
  );

  const handleCreateBatch = (count: number) => {
    const timestamp = Date.now();
    const newTasks: BatchTask[] = Array.from({ length: count }).map((_, i) => ({
      id: `task-${timestamp}-${i + 1}`,
      type: i % 2 === 0 ? 'modal' : 'drawer',
      title:
        i % 2 === 0
          ? `协同审批单 #${1000 + i + 1}`
          : `客户档案抽屉 #${2000 + i + 1}`,
      minimized: true,
      open: true,
    }));
    setBatchTasks(newTasks);
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex gap={12} align="center" wrap="wrap">
        <span>{t('positionLabel')}:</span>
        <Radio.Group
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          optionType="button"
          buttonStyle="solid"
          options={[
            { label: t('bottomRight'), value: 'bottom-right' },
            { label: t('bottomLeft'), value: 'bottom-left' },
            { label: t('topRight'), value: 'top-right' },
            { label: t('topLeft'), value: 'top-left' },
          ]}
        />
      </Flex>

      <Flex gap={12} align="center" wrap="wrap">
        <span>{t('stackEnabled')}:</span>
        <Switch checked={stackEnabled} onChange={setStackEnabled} />
        <span>{t('threshold')}:</span>
        <InputNumber
          min={1}
          precision={0}
          disabled={!stackEnabled}
          value={threshold}
          onChange={(value) => {
            if (typeof value === 'number') setThreshold(value);
          }}
        />
      </Flex>

      <Flex gap={8} wrap="wrap">
        <Button type="primary" onClick={() => setOpenModal1(true)}>
          {t('openModal1')}
        </Button>
        <Button onClick={() => setOpenModal2(true)}>{t('openModal2')}</Button>
        <Button onClick={() => setOpenDrawer(true)}>{t('openDrawer')}</Button>
        <Button onClick={() => handleCreateBatch(3)}>{t('batch3')}</Button>
        <Button onClick={() => handleCreateBatch(4)}>{t('batch4')}</Button>
        <Button onClick={() => handleCreateBatch(10)}>{t('batch10')}</Button>
        {batchTasks.length > 0 && (
          <Button danger onClick={() => setBatchTasks([])}>
            {t('clearBatch')} ({batchTasks.length})
          </Button>
        )}
      </Flex>

      <Modal
        title={t('modal1Title')}
        open={openModal1}
        minimizable
        minimizePosition={position}
        minimizeStack={minimizeStack}
        onCancel={() => setOpenModal1(false)}
        onOk={() => setOpenModal1(false)}
      >
        <p>{t('content')}</p>
      </Modal>

      <Modal
        title={t('modal2Title')}
        open={openModal2}
        minimizable
        minimizePosition={position}
        minimizeStack={minimizeStack}
        onCancel={() => setOpenModal2(false)}
        onOk={() => setOpenModal2(false)}
      >
        <p>{t('content')}</p>
      </Modal>

      <Drawer
        title={t('drawerTitle')}
        open={openDrawer}
        minimizable
        minimizePosition={position}
        minimizeStack={minimizeStack}
        onClose={() => setOpenDrawer(false)}
      >
        <p>{t('content')}</p>
      </Drawer>

      {batchTasks.map((task) =>
        task.type === 'modal' ? (
          <Modal
            key={task.id}
            title={task.title}
            open={task.open}
            minimized={task.minimized}
            minimizable
            minimizePosition={position}
            minimizeStack={minimizeStack}
            onMinimizeChange={(minimized) => {
              setBatchTasks((current) =>
                current.map((item) =>
                  item.id === task.id ? { ...item, minimized } : item,
                ),
              );
            }}
            onCancel={() => {
              setBatchTasks((current) =>
                current.filter((item) => item.id !== task.id),
              );
            }}
            onOk={() => {
              setBatchTasks((current) =>
                current.filter((item) => item.id !== task.id),
              );
            }}
          >
            <p>{task.title} 的详细数据...</p>
          </Modal>
        ) : (
          <Drawer
            key={task.id}
            title={task.title}
            open={task.open}
            minimized={task.minimized}
            minimizable
            minimizePosition={position}
            minimizeStack={minimizeStack}
            onMinimizeChange={(minimized) => {
              setBatchTasks((current) =>
                current.map((item) =>
                  item.id === task.id ? { ...item, minimized } : item,
                ),
              );
            }}
            onClose={() => {
              setBatchTasks((current) =>
                current.filter((item) => item.id !== task.id),
              );
            }}
          >
            <p>{task.title} 的详细数据...</p>
          </Drawer>
        ),
      )}
    </Space>
  );
};
