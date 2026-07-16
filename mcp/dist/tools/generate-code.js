import {
  componentRegistry,
  getComponentNames,
} from '../data/component-registry.js';
/**
 * 关键词匹配表：根据需求描述中的关键词匹配组件
 */
const MATCH_RULES = [
  {
    keywords: [
      '按钮',
      'button',
      '提交',
      '点击',
      'loading',
      'loading',
      '加载',
      '节流',
      '防抖',
      '防重复',
      'tooltip',
      '提示',
      '保存按钮',
      '删除按钮',
      '确认按钮',
    ],
    component: 'Button',
    confidence: 'high',
  },
  {
    keywords: [
      '弹窗',
      'modal',
      '对话框',
      '拖拽',
      '最小化',
      '最大化',
      '全屏',
      '悬浮窗',
      '窗口',
      '表单弹窗',
      '确认框',
      '详情弹窗',
      'drawer',
    ],
    component: 'Modal',
    confidence: 'high',
  },
  {
    keywords: [
      '选择器',
      'select',
      '下拉',
      '多选',
      '单选',
      '选项',
      '搜索选择',
      '字段映射',
      '全选',
      'popover',
      '弹出选择',
      '虚拟滚动',
      '大数据选择',
    ],
    component: 'PopoverSelect',
    confidence: 'high',
  },
  {
    keywords: [
      '配置',
      'config',
      '前缀',
      'prefix',
      '国际化',
      '语言',
      'locale',
      'i18n',
      '全局',
    ],
    component: 'ConfigProvider',
    confidence: 'medium',
  },
];
/**
 * 对需求文本进行匹配打分
 */
function matchRequirement(requirement) {
  const lower = requirement.toLowerCase();
  const scores = {};
  for (const rule of MATCH_RULES) {
    const matchedKeywords = [];
    let score = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
        score +=
          rule.confidence === 'high' ? 3 : rule.confidence === 'medium' ? 2 : 1;
      }
    }
    if (score > 0) {
      scores[rule.component] = { score, matchedKeywords };
    }
  }
  // 没有匹配到任何组件
  if (Object.keys(scores).length === 0) {
    return {
      bestMatch: 'Button',
      confidence: 'low',
      reason: '未能从需求描述中明确识别组件类型，默认匹配最常用的 Button 组件',
      alternatives: getComponentNames()
        .filter((n) => n !== 'ConfigProvider')
        .map((name) => ({
          name,
          reason: `${name} 是 HiTalent Design 的可用组件，可能与您的需求相关`,
        })),
    };
  }
  // 按分数排序，取最高分
  const sorted = Object.entries(scores).sort(
    ([, a], [, b]) => b.score - a.score,
  );
  const [bestName, bestScore] = sorted[0];
  // 评出备选组件（分数不低于最高分 60% 的）
  const alternatives = sorted
    .slice(1)
    .filter(([, s]) => s.score >= bestScore.score * 0.6)
    .map(([name, s]) => ({
      name,
      reason: `匹配关键词: ${s.matchedKeywords.join(', ')}`,
    }));
  // 如果只有一个高分匹配，confidence 为 high
  let confidence = 'medium';
  if (bestScore.score >= 6 && alternatives.length === 0) {
    confidence = 'high';
  } else if (bestScore.score < 3) {
    confidence = 'low';
  }
  return {
    bestMatch: bestName,
    confidence,
    reason: `匹配关键词: ${bestScore.matchedKeywords.join(', ')}`,
    alternatives,
  };
}
/**
 * 根据组件文档生成代码骨架模板
 */
function generateSkeleton(doc) {
  switch (doc.name) {
    case 'Button':
      return `import { Button } from 'hi-talent-design';

// TODO: 根据实际需求调整 props
<Button
  type="primary"
  // autoLoading={true}          // 自动 loading（默认开启）
  // throttle={1000}             // 节流间隔（ms）
  // tooltip="提示文字"           // tooltip 提示
  // disabled={false}
  onClick={async () => {
    // 返回 Promise 时自动触发 loading
    // await yourApiCall();
  }}
>
  ${'{{children}}'}
</Button>`;
    case 'Modal':
      return `import { useRef, useState } from 'react';
import { Modal } from 'hi-talent-design';
import type { ModalRef } from 'hi-talent-design';

const modalRef = useRef<ModalRef>(null);
const [open, setOpen] = useState(false);

<Modal
  ref={modalRef}           // 可选，用于命令式控制
  title="${'{{标题}}'}
  open={open}
  // draggable              // 允许拖拽
  // minimizable            // 允许最小化
  // maximizable            // 允许最大化
  // minimizePosition="bottom-right"
  onCancel={() => setOpen(false)}
  onOk={() => {
    // 处理确认逻辑
    setOpen(false);
  }}
>
  ${'{{弹窗内容}}'}
</Modal>`;
    case 'PopoverSelect':
      return `import { PopoverSelect } from 'hi-talent-design';

<PopoverSelect
  // mode="single" | "multiple"
  options={${'{{options}}'}}
  // placeholder="请选择"
  // showSearch              // 显示搜索框
  // allowClear              // 允许清除
  // showSelectAll           // 多选全选
  // showConfirm             // 多选确认模式
  // valueType="string" | "array"
  // fieldNames={{ label: 'name', value: 'id' }}
  onChange={(value) => {
    console.log('选中值:', value);
  }}
/>`;
    case 'ConfigProvider':
      return `import { ConfigProvider } from 'hi-talent-design';
// import { zh_CN, en_US } from 'hi-talent-design';

<ConfigProvider
  prefixCls="htd"          // 默认 'htd'
  // locale={zh_CN}         // 默认 zh_CN
>
  ${'{{children}}'}
</ConfigProvider>`;
    default:
      return `// 请参考组件文档中的示例代码`;
  }
}
/**
 * 根据匹配到的组件和需求生成代码指引
 */
function buildCodeGuide(doc, requirement) {
  const lower = requirement.toLowerCase();
  // 找出与需求最相关的 props
  const relevantProps = doc.props
    .filter((p) => {
      // 检查 prop 名称或描述是否与需求关键词相关
      return p.name !== 'style' && p.name !== 'className';
    })
    // 如果声明了 default 值且不是 "-"，则优先展示有特色的 props
    .sort((a, b) => {
      const aHasDefault = a.default !== '-' ? 1 : 0;
      const bHasDefault = b.default !== '-' ? 1 : 0;
      return bHasDefault - aHasDefault;
    })
    .slice(0, 8)
    .map((p) => ({
      ...p,
      whyRelevant:
        p.default !== '-'
          ? `此属性有默认值 ${p.default}，通常无需手动设置`
          : '根据需求场景，此属性可能需要配置',
    }));
  // 找出最相关的示例（简单启发式：示例标题是否包含需求中的词）
  const relevantExamples = doc.examples
    .map((ex) => {
      const titleLower = ex.title.toLowerCase();
      const matchCount = lower
        .split(/\s+/)
        .filter((w) => titleLower.includes(w)).length;
      return { ex, matchCount };
    })
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 2)
    .map(({ ex }) => ({
      ...ex,
      whyRelevant: '此示例展示了与您需求最接近的使用模式',
    }));
  // 如果只有一个示例或没有匹配的，至少返回一个
  if (relevantExamples.length === 0 && doc.examples.length > 0) {
    relevantExamples.push({
      ...doc.examples[0],
      whyRelevant: '基础示例，展示了组件的标准用法',
    });
  }
  // 生成代码骨架
  const skeletonTemplate = generateSkeleton(doc);
  return {
    imports: doc.imports,
    relevantProps,
    relevantExamples,
    notes: doc.notes.slice(0, 5),
    skeletonTemplate,
  };
}
/**
 * generate_code 工具的主处理函数
 */
export function handleGenerateCode(input) {
  // 如果未指定组件名，自动匹配
  let targetName = input.componentName;
  let matchInfo = null;
  if (!targetName) {
    matchInfo = matchRequirement(input.requirement);
    targetName = matchInfo.bestMatch;
  }
  const doc = componentRegistry[targetName];
  if (!doc) {
    const names = getComponentNames();
    return {
      matched: false,
      suggestion: `组件 "${targetName}" 不存在。可用的组件有：${names.join(
        ', ',
      )}。请使用 list_components 查看所有可用组件。`,
    };
  }
  const codeGuide = buildCodeGuide(doc, input.requirement);
  return {
    matched: true,
    componentName: targetName,
    confidence: matchInfo?.confidence ?? 'high',
    matchReason: matchInfo?.reason ?? `用户指定了组件名称 "${targetName}"`,
    componentDoc: doc,
    alternatives: matchInfo?.alternatives,
    codeGenerationGuide: codeGuide,
  };
}
//# sourceMappingURL=generate-code.js.map
