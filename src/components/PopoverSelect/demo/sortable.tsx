import { Space, Typography } from 'antd';
import { PopoverSelect } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    title: '职位',
    order: '顺序',
    FE: '前端',
    BE: '后端',
    PM: '产品',
    QA: '测试',
  },
  'en-US': {
    title: 'Positions',
    order: 'Order',
    FE: 'Frontend',
    BE: 'Backend',
    PM: 'Product',
    QA: 'QA',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [order, setOrder] = useState<Array<'FE' | 'BE' | 'PM' | 'QA'>>([
    'FE',
    'BE',
    'PM',
    'QA',
  ]);
  return (
    <Space direction="vertical">
      <PopoverSelect
        mode="multiple"
        options={order.map((value) => ({ value, label: t(value) }))}
        sortable
        onSortChange={(options) =>
          setOrder(options.map((option) => option.value))
        }
        placeholder={t('title')}
        labelRender={(label, { values }) =>
          values.length ? (
            <>
              {t('title')}：{label}
            </>
          ) : (
            label
          )
        }
        showCancelBtn
        allowClear
      />
      <Typography.Text type="secondary">
        {t('order')}：{order.map((value) => t(value)).join(' / ')}
      </Typography.Text>
    </Space>
  );
};
