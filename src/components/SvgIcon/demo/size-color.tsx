import { SvgIcon } from 'hi-talent-design';
import { Space, Slider, Switch, Radio } from 'antd';
import React, { useState } from 'react';

export default () => {
  const [size, setSize] = useState<number>(24);
  const [spin, setSpin] = useState<boolean>(false);
  const [rotate, setRotate] = useState<number>(0);
  const [color, setColor] = useState<string>('#1677ff');

  return (
    <div>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space wrap>
          <span>尺寸:</span>
          <Slider min={14} max={48} value={size} onChange={(v) => setSize(v)} style={{ width: 120 }} />
          <span>旋转:</span>
          <Slider min={0} max={360} value={rotate} onChange={(v) => setRotate(v)} style={{ width: 120 }} />
          <span>Spin 动画:</span>
          <Switch checked={spin} onChange={setSpin} />
          <span>颜色:</span>
          <Radio.Group value={color} onChange={(e) => setColor(e.target.value)} size="small">
            <Radio.Button value="#1677ff">科技蓝</Radio.Button>
            <Radio.Button value="#52c41a">活力绿</Radio.Button>
            <Radio.Button value="#ff4d4f">警示红</Radio.Button>
            <Radio.Button value="#faad14">醒目黄</Radio.Button>
          </Radio.Group>
        </Space>

        <div style={{ padding: '24px', background: '#fafafa', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 24 }}>
          <SvgIcon size={size} color={color} spin={spin} rotate={rotate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </SvgIcon>

          <SvgIcon size={size} color={color} spin={spin} rotate={rotate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </SvgIcon>
        </div>
      </Space>
    </div>
  );
};
