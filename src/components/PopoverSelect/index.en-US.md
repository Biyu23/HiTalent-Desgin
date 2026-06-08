---
category: Components
title: PopoverSelect
---

# PopoverSelect

An advanced selector with a Popover-based dropdown menu. Built-in virtual scrolling, select-all control, field-name mapping, and flexible value formatting.

## Why this component

Ant Design's Select struggles with large datasets and its styling is rigid. PopoverSelect uses a Popover-based dropdown with built-in virtual scrolling to effortlessly handle tens of thousands of items, supports field-name mapping to adapt to any backend data structure, and flexibly switches between string and array value formats — especially useful when dealing with legacy databases using `varchar` fields.

## Demos

### Basic Single Select

<code src="./demo/basic.tsx" title="Basic Single Select & Search" description="Default mode is single select: click to select and auto-close the popover. Enable `showSearch` for local keyword filtering."></code>

### Multiple Select with Confirmation

<code src="./demo/multiple.tsx" title="Multiple Select with Confirmation" description="Enable `mode='multiple'` for multi-select with confirm button by default. Optionally show cancel/clear buttons and customize separator and max tag count."></code>

### String Value & Select All

<code src="./demo/string-value.tsx" title="String Value & Select All" description="Perfect for legacy backend `varchar` fields. Set `valueType='string'` to automatically convert between comma-separated strings and arrays. The select-all button intelligently matches the current search results."></code>

### Field Mapping & Virtual Scroll

<code src="./demo/virtual.tsx" title="Field Mapping & Virtual Scroll" description="Use `fieldNames` to avoid manual data mapping. Built-in `rc-virtual-list` handles 10,000+ items smoothly without lag."></code>

### Custom Rendering

<code src="./demo/custom.tsx" title="Custom Rendering" description="Use `optionRender` to customize each option's appearance, and `dropdownRender` to inject custom DOM (e.g., an 'Add New' button) outside the list."></code>

### Empty State & No Match

<code src="./demo/empty-state.tsx" title="Empty State & No Match" description="When the options list is empty or the search keyword has no matches, the component automatically displays an Empty placeholder for clear visual feedback."></code>

### Disabled Options

<code src="./demo/disabled-options.tsx" title="Disabled Options" description="Mark individual options as disabled via `disabled: true` in the data, or disable the entire component with the `disabled` prop."></code>

## API

<API src="./type.ts" identifier="PopoverSelectProps" hideTitle></API>
