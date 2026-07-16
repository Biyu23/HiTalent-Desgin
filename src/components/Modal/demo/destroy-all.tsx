/**
 * description: 打开多个具备拖拽、最大化、最小化能力的弹窗，每个弹窗可独立切换状态——正常展示、最大化全屏、或最小化至角落悬浮窗。点击"销毁所有弹窗"即可一键清理，无论弹窗当前处于何种状态均可正确关闭。
 */
import { Button, Space, Tag } from 'antd';
import { Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useCallback, useState } from 'react';

const messages = {
  'zh-CN': {
    'destroyAll.open': '打开 3 个弹窗',
    'destroyAll.destroy': '销毁所有弹窗',
    'destroyAll.count': '活跃弹窗',
    'destroyAll.hint':
      '下方 3 个弹窗均支持拖拽、最小化和最大化。你可以自由切换它们的状态——比如把其中几个最小化到角落、一个最大化、另一个保持正常。然后点击"销毁所有弹窗"一键清理，验证不同状态下均能正确销毁。',
    'destroyAll.titleA': '弹窗 A',
    'destroyAll.titleB': '弹窗 B',
    'destroyAll.titleC': '弹窗 C',
    'destroyAll.desc': '可以通过标题栏按钮自由切换状态：',
    'destroyAll.descNormal': '正常 → 普通弹窗',
    'destroyAll.descMax': '最大化 → 全屏沉浸',
    'destroyAll.descMin': '最小化 → 悬浮角落',
    'destroyAll.cleared': '所有弹窗已销毁',
  },
  'en-US': {
    'destroyAll.open': 'Open 3 Modals',
    'destroyAll.destroy': 'Destroy All',
    'destroyAll.count': 'Active',
    'destroyAll.hint':
      'All 3 modals support drag, minimize, and maximize. Try switching their states freely — minimize a couple to the corner dock, maximize one, leave another open normally. Then click "Destroy All" to verify all states are handled correctly.',
    'destroyAll.titleA': 'Modal A',
    'destroyAll.titleB': 'Modal B',
    'destroyAll.titleC': 'Modal C',
    'destroyAll.desc': 'Use the title bar buttons to switch states:',
    'destroyAll.descNormal': 'Normal → standard window',
    'destroyAll.descMax': 'Maximize → fullscreen',
    'destroyAll.descMin': 'Minimize → corner dock',
    'destroyAll.cleared': 'All modals destroyed',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);

  const [showA, setShowA] = useState(false);
  const [showB, setShowB] = useState(false);
  const [showC, setShowC] = useState(false);
  const [cleared, setCleared] = useState(false);

  const openCount = [showA, showB, showC].filter(Boolean).length;

  const handleOpen = useCallback(() => {
    setShowA(true);
    setShowB(true);
    setShowC(true);
    setCleared(false);
  }, []);

  const handleDestroyAll = useCallback(() => {
    Modal.destroyAll();
    setCleared(true);
  }, []);

  return (
    <div>
      <p
        style={{ marginBottom: 12, color: '#666', fontSize: 13, maxWidth: 600 }}
      >
        💡 <b>{t('destroyAll.hint')}</b>
      </p>
      <Space wrap>
        <Button type="primary" onClick={handleOpen}>
          {t('destroyAll.open')}
        </Button>
        <Button danger onClick={handleDestroyAll}>
          {t('destroyAll.destroy')}
        </Button>
        <Tag color={openCount > 0 ? 'blue' : 'default'}>
          {t('destroyAll.count')}: {openCount}
        </Tag>
        {cleared && <Tag color="green">{t('destroyAll.cleared')}</Tag>}
      </Space>

      <Modal
        title={t('destroyAll.titleA')}
        open={showA}
        draggable
        maximizable
        minimizable
        minimizePosition="bottom-right"
        onCancel={() => setShowA(false)}
      >
        <div style={{ padding: '12px 0', minHeight: 100 }}>
          <p>{t('destroyAll.desc')}</p>
          <ul style={{ color: '#666', paddingLeft: 20 }}>
            <li>{t('destroyAll.descNormal')}</li>
            <li>{t('destroyAll.descMax')}</li>
            <li>{t('destroyAll.descMin')}</li>
          </ul>
        </div>
      </Modal>

      <Modal
        title={t('destroyAll.titleB')}
        open={showB}
        draggable
        maximizable
        minimizable
        minimizePosition="bottom-right"
        onCancel={() => setShowB(false)}
      >
        <div style={{ padding: '12px 0', minHeight: 100 }}>
          <p>{t('destroyAll.desc')}</p>
          <ul style={{ color: '#666', paddingLeft: 20 }}>
            <li>{t('destroyAll.descNormal')}</li>
            <li>{t('destroyAll.descMax')}</li>
            <li>{t('destroyAll.descMin')}</li>
          </ul>
        </div>
      </Modal>

      <Modal
        title={t('destroyAll.titleC')}
        open={showC}
        draggable
        maximizable
        minimizable
        minimizePosition="bottom-right"
        onCancel={() => setShowC(false)}
      >
        <div style={{ padding: '12px 0', minHeight: 100 }}>
          <p>{t('destroyAll.desc')}</p>
          <ul style={{ color: '#666', paddingLeft: 20 }}>
            <li>{t('destroyAll.descNormal')}</li>
            <li>{t('destroyAll.descMax')}</li>
            <li>{t('destroyAll.descMin')}</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};
