/**
 * description: 支持 8 个方位的多弹窗最小化。点击"打开单个"正常展示一个弹窗，手动最小化收起；点击"批量最小化"直接以最小化态挂入角落，不会叠加多层遮罩。同位置个数超限时自动滚动且隐藏滚动条。
 */
import { Button, Radio, Space, Tag } from 'antd';
import { MinimizePosition, Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useCallback, useState } from 'react';

const POSITIONS: MinimizePosition[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'top',
  'bottom',
  'left',
  'right',
];

const messages = {
  'zh-CN': {
    'multi.hint':
      '选择方位后点击按钮体验：单个打开可手动最小化；批量打开直接以最小化态挂载到角落，不会叠加多层遮罩。同位置数量超出屏幕时自动滚动（滚动条隐形），溢出边缘有渐隐提示。',
    'multi.single': '打开单个',
    'multi.batch': '批量打开 8 个（直接最小化）',
    'multi.ticket': '业务工单',
    'multi.position': '停靠方位',
    'multi.desc': '当前方位 {position}。点击右上角"减号"最小化。',
    'multi.descBatch':
      '直接以最小化态挂载到 {position}。点击悬浮窗的放大图标即可恢复。',
  },
  'en-US': {
    'multi.hint':
      'Choose a position, then try: "Open Single" for a normal modal (minimize it manually); "Batch 8 (pre-minimized)" to dock 8 cards instantly with no stacked masks. Overflow scrolls silently with a fade hint at the edge.',
    'multi.single': 'Open Single',
    'multi.batch': 'Batch 8 (pre-minimized)',
    'multi.ticket': 'Business Ticket',
    'multi.position': 'Dock Position',
    'multi.desc': 'Docked at {position}. Click the minus icon to minimize.',
    'multi.descBatch':
      'Pre-minimized at {position}. Click expand on the dock card to restore.',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [position, setPosition] = useState<MinimizePosition>('bottom-right');

  // ---- 单个正常弹窗（追踪最小化状态用于计数） ----
  const [singleId] = useState(() => Date.now());
  const [singleOpen, setSingleOpen] = useState(false);
  const [singleMinimized, setSingleMinimized] = useState(false);

  // ---- 批量最小化弹窗（受控 minimized） ----
  const [batch, setBatch] = useState<
    { id: number; title: string; minimized: boolean }[]
  >([]);

  // 精确的 dock 计数 = 批量弹窗数 + 单个弹窗是否最小化
  const dockCount = batch.length + (singleMinimized ? 1 : 0);

  const handleBatch = useCallback(() => {
    const now = Date.now();
    const items = Array.from({ length: 8 }, (_, i) => ({
      id: now + i,
      title: `${t('multi.ticket')} #${Math.floor(Math.random() * 10000)}`,
      minimized: true,
    }));
    setBatch((prev) => [...prev, ...items]);
  }, [t]);

  const handleRestoreBatch = useCallback((id: number) => {
    setBatch((prev) =>
      prev.map((m) => (m.id === id ? { ...m, minimized: false } : m)),
    );
  }, []);

  const handleClose = useCallback((id: number) => {
    setBatch((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ color: '#666', fontSize: 13, maxWidth: 560 }}>
        👉 <b>{t('multi.hint')}</b>
      </div>

      <Space align="center" wrap>
        <span style={{ fontWeight: 500 }}>{t('multi.position')}:</span>
        <Radio.Group
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        >
          {POSITIONS.map((p) => (
            <Radio.Button key={p} value={p}>
              {p}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Space>

      <Space>
        <Button type="primary" onClick={() => setSingleOpen(true)}>
          {t('multi.single')}
        </Button>
        <Button danger onClick={handleBatch}>
          {t('multi.batch')}
        </Button>
        <Tag>
          {t('multi.position')}: {position}
        </Tag>
        <Tag color="blue">Docks: {dockCount}</Tag>
      </Space>

      {/* 单个正常弹窗 */}
      <Modal
        key={singleId}
        title={t('multi.ticket')}
        open={singleOpen}
        draggable
        maximizable
        minimizable
        minimizePosition={position}
        onMinimizeChange={setSingleMinimized}
        onCancel={() => setSingleOpen(false)}
        onOk={() => setSingleOpen(false)}
      >
        <div style={{ padding: '20px 0', minHeight: 120 }}>
          <h3>{t('multi.ticket')}</h3>
          <p>{t('multi.desc').replace('{position}', position)}</p>
        </div>
      </Modal>

      {/* 批量弹窗：minimized 受控，初始即为最小化态，无遮罩叠加 */}
      {batch.map((m) => (
        <Modal
          key={m.id}
          title={m.title}
          open
          draggable
          minimizable
          minimizePosition={position}
          minimized={m.minimized}
          onMinimizeChange={(v) => {
            if (!v) handleRestoreBatch(m.id);
          }}
          onCancel={() => handleClose(m.id)}
          onOk={() => handleClose(m.id)}
        >
          <div style={{ padding: '20px 0', minHeight: 120 }}>
            <p style={{ color: '#999' }}>ID: {m.id}</p>
            <p>{t('multi.descBatch').replace('{position}', position)}</p>
          </div>
        </Modal>
      ))}
    </Space>
  );
};
