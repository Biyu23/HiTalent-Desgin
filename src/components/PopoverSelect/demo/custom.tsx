/**
 * title: 高度定制渲染
 * description: 使用 `optionRender` 自定义每一项的长相，使用 `dropdownRender` 在列表外部追加自定义 DOM（如：新增按钮）。
 */
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Divider, Tag } from 'antd';
import { PopoverSelect } from 'myui';
import React from 'react';
import { standardOptions } from './mock';

export default () => {
  return (
    <div style={{ width: 300 }}>
      <PopoverSelect
        options={standardOptions}
        placeholder="自定义列表与选项"
        optionRender={(item) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ flex: 1 }}>
              <UserOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              {item.label}
            </span>
            {item.value === 'FE' && (
              <Tag
                color="blue"
                style={{
                  flexShrink: 0,
                }}
              >
                热门
              </Tag>
            )}
          </div>
        )}
        // 2. 接管整个下拉面板
        dropdownRender={(menu) => (
          <div>
            {/* 必须把原始的 menu 渲染出来 */}
            {menu}
            <Divider style={{ margin: 0 }} />
            <div style={{ padding: '8px' }}>
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => alert('跳转到创建页面！')}
              >
                新建职位
              </Button>
            </div>
          </div>
        )}
      />
    </div>
  );
};
