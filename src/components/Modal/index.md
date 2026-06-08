---
category: Components
title: Modal 弹窗
---

# Modal 高级弹窗

在 Ant Design Modal 的基础上，提供了拖拽移动、最大化沉浸式展示以及最小化至全局 Dock 的桌面级窗口体验。

## 为什么需要这个组件

Ant Design 的 Modal 在桌面级复杂交互中存在不足：无法拖拽移动遮挡了背后的关键信息、无法全屏查看长内容、关闭弹窗后表单数据全部丢失需要重新填写。HiTalent Design Modal 通过内置拖拽、最大化、最小化悬浮窗三大能力，将弹窗升级为真正的桌面级工作窗口，且最小化时 DOM 不销毁，完美保留表单状态。

## 代码演示

### 基础用法

<code src="./demo/basic.tsx"></code>

### 表单提交

<code src="./demo/form-submit.tsx"></code>

### 高级窗口管理

<code src="./demo/advanced.tsx"></code>

### 命令式控制（Ref API）

<code src="./demo/imperative-control.tsx"></code>

### 多窗口最小化

<code src="./demo/multiple-minimize.tsx"></code>

## API

<API src="./type.ts" identifier="ModalProps" hideTitle></API>

## ModalRef

<API src="./type.ts" identifier="ModalRef" hideTitle></API>
