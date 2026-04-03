// 基础标准数据
export const standardOptions = [
  { label: '前端工程师', value: 'FE' },
  { label: '后端工程师', value: 'BE' },
  { label: 'UI 设计师', value: 'UI', disabled: true },
  { label: '产品经理', value: 'PM' },
  { label: '测试工程师', value: 'QA' },
  { label: '运维工程师', value: 'OP' },
];

// 后端返回的非标准奇葩数据
export const customFieldData = [
  { deptName: '阿里巴巴', deptId: 101 },
  { deptName: '腾讯', deptId: 102 },
  { deptName: '字节跳动', deptId: 103, isLock: true },
];

// 模拟海量数据 (1万条)
export const hugeOptions = Array.from({ length: 10000 }).map((_, i) => ({
  label: `员工编号 ${i + 1}`,
  value: `emp_${i + 1}`,
}));
