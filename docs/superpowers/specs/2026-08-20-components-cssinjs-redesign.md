# Components CSS-in-JS Redesign

## 1. Objective

Rebuild the component styling and interaction architecture under `src/components` without preserving backward compatibility. The result must provide a consistent, strongly typed semantic styling API, correct namespace propagation, reusable pointer interaction primitives, and predictable client-side behavior.

This project targets client-rendered React applications only. SSR and hydration compatibility are explicitly out of scope.

## 2. Scope

The redesign covers:

- Button
- SvgIcon
- PopoverSelect
- ResponsiveButtonGroup
- Drawer
- Modal
- Table
- Shared minimize, namespace, semantic-style, action, and pointer-resize utilities used by those components
- Public component types, exports, documentation, and demos

No test framework or new test dependency will be introduced. Validation uses lint, library builds, documentation builds, focused client-side manual probes, and demos.

## 3. Architectural Boundaries

### 3.1 Semantic styling

Create an internal semantic styling module that defines:

- `rootClassName?: string`
- `classNames?: Partial<Record<Slot, string>>`
- `styles?: Partial<Record<Slot, CSSPropertiesWithVars>>`
- `CSSPropertiesWithVars`, which supports typed `--*` custom properties

Each component declares a finite string union for its slots. Shared helpers merge classes and styles in this order:

1. Internal defaults
2. Parent or adapter defaults
3. Consumer values

Consumer inline styles win. Class order is deterministic but is not documented as a specificity mechanism. Documentation must recommend semantic `styles`, compound selectors rooted at `rootClassName`, or theme tokens for reliable overrides.

### 3.2 Component namespace

Resolve namespace information once per public component and pass it to every internal child and portal. The resolved namespace contains:

- HiTalent component prefix
- Ant Design prefix
- CSS-in-JS hash id
- Stable element and modifier class generators

Internal children must not resolve their own component prefix. Component code and styles must not contain literal `.ant-*` selectors. Ant Design selectors are built from the resolved Ant Design prefix when a DOM selector is unavoidable. Refs and Ant Design semantic class names are preferred over DOM queries.

### 3.3 Pointer resize

Create one reusable pointer-resize engine for Drawer, Modal, and Table. It owns:

- Active pointer id
- Pointer capture and release
- On-demand document/window listeners
- Cancellation on pointercancel, blur, deactivation, and unmount
- Body cursor and user-select locking through a shared reference-counted lock manager
- RAF-coalesced move delivery
- Start, move, commit, cancel, and cleanup lifecycle

Components provide only geometry-specific functions: initial value, pointer-to-value conversion, constraints, cursor, and callbacks.

### 3.4 Action runner

Button and ResponsiveButtonGroup share an action runner that owns:

- Leading-edge throttling
- Per-action pending state
- Thenable normalization
- Unmount protection
- Timer cleanup
- Consistent completion and rejection handling

The component layer decides how pending state is rendered; it does not reimplement asynchronous lifecycle logic.

## 4. Public Styling Contracts

All public components accept `rootClassName`, `classNames`, and `styles`. `className` and `style` apply to the primary interactive element. `rootClassName` applies to the complete component boundary. For components with portals, the corresponding popup/dock slot styles the portal root; the namespace and hash are always attached automatically.

### 4.1 Slot definitions

| Component             | Slots                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Button                | `root`, `content`                                                                                                                          |
| SvgIcon               | `root`, `svg`                                                                                                                              |
| PopoverSelect         | `root`, `trigger`, `triggerText`, `actions`, `popup`, `search`, `selectAll`, `menu`, `item`, `footer`, `empty`                             |
| ResponsiveButtonGroup | `root`, `visible`, `overflowTrigger`, `popup`, `menuItem`                                                                                  |
| Drawer                | `root`, `mask`, `wrapper`, `content`, `header`, `body`, `footer`, `dragger`, `minimizeButton`, `minimizedDock`                             |
| Modal                 | `root`, `mask`, `wrapper`, `content`, `header`, `title`, `actions`, `body`, `footer`, `resizeHandle`, `minimizedDock`                      |
| Table                 | `root`, `toolbar`, `toolbarExtra`, `settingTrigger`, `settingPopup`, `table`, `headerCell`, `resizeHandle`, `rowDragHandle`, `dragOverlay` |

Every slot must have all of the following:

- An exported slot type
- An exported classNames type
- An exported styles type
- A concrete DOM or portal target
- Documentation and a demo usage where practical

### 4.2 Root semantics

- Button: root is the button element.
- SvgIcon: root is the focusable icon wrapper; svg targets the rendered SVG.
- PopoverSelect: root wraps the trigger; popup targets the Popover portal root.
- ResponsiveButtonGroup: root contains visible actions and measurement infrastructure; popup targets the overflow Dropdown portal.
- Drawer: root targets the Ant Design Drawer root boundary; minimizedDock targets the separate dock portal.
- Modal: root targets the Ant Design Modal root boundary; wrapper and content remain distinct semantic slots.
- Table: root is the outer element containing toolbar and table. The `table` slot targets the Ant Design Table boundary. This removes the existing ambiguity where `className/style` cannot control the full component.

## 5. Component Behavior Redesign

### 5.1 PopoverSelect

Replace the current broad generic props with a discriminated union based on `mode` and `valueType`:

- Single mode emits a scalar or `undefined`.
- Multiple + array emits an array.
- Multiple + string emits a string.

Option generics flow through mapping, rendering, selection, and callbacks without being erased to `Record<string, any>`. Field-name mapping produces a typed internal option. Duplicate or invalid option values are rejected in development diagnostics and handled deterministically at runtime.

### 5.2 ResponsiveButtonGroup

Public item keys are strings. Overflow lookup never coerces mixed key types.

Measurement becomes iterative:

1. Measure each action once.
2. Calculate a candidate collapsed count.
3. Render and measure only that candidate overflow trigger.
4. Recalculate until stable, with a bounded iteration guard.

This removes the quadratic hidden render tree. Measurement refs, ResizeObserver, RAF, and timers must be cleaned on unmount.

### 5.3 Drawer, Modal, and Table resize

All three use the shared pointer-resize engine. Only the active interaction owns global listeners. A move from a different pointer id is ignored. Body style locking is reference counted, so simultaneous interactions cannot restore another interaction's cursor or user-select state.

Modal separates operation/style context from high-frequency window state. Header consumers do not subscribe to position or size. Table resize previews are RAF-coalesced and commits remain synchronous at interaction end.

### 5.4 Table drag

Table resolves its prefix once and passes it into column and row drag hooks. Drag overlays receive the same namespace, hash, and semantic style slots.

Column drag uses one table-scoped dynamic style node. CSS variables live on the Table root rather than `document.documentElement`. The style node and variables are removed together on unmount. Random identifiers are permitted because the target is client-only, but each identifier must be stable for the mounted instance and collision resistant.

### 5.5 MinimizedDock

A registry owns shared dock containers by namespace and position. Each entry tracks:

- Container and scroll wrapper nodes
- Reference count
- Current namespace/hash classes
- Creation and destruction lifecycle

Dock, header, title, actions, and container styling use semantic slots or documented internal ownership. No stale hash classes remain after theme changes.

## 6. Performance Rules

- No permanent global pointer listeners per component instance or table column.
- High-frequency pointer updates are coalesced through RAF.
- Contexts do not combine high-frequency state with unrelated consumers.
- Hidden measurement work is O(n) plus a bounded number of candidate passes.
- Portal content does not register duplicate component styles when an existing parent registration can provide the hash and rules.
- Dynamic styles are scoped to a component root and consolidated per instance.
- Memoization is used only around expensive derivation or stable child boundaries, not simple primitive expressions.

## 7. Type Safety

- Public and internal component code must not use `any` except for documented third-party compatibility boundaries that cannot be represented safely.
- Third-party compatibility casts remain isolated in adapter files.
- PopoverSelect option and result types remain intact through every hook and child component.
- `classNames`, `styles`, and slot unions are exported from the root package entry.
- CSS custom properties are part of the public style type.
- Keyboard and mouse events are not cast to each other. Shared activation callbacks use an explicit union or a semantic activation event type.

## 8. Error and Cleanup Semantics

- Interaction cleanup is idempotent.
- User callbacks run after internal state reaches a consistent point.
- A throwing start callback cancels the interaction and releases all resources before the error escapes.
- Async action completion always clears pending state for the matching operation.
- Stale async operations cannot clear a newer operation's state.
- Portal registry and dynamic styles survive shared use and are destroyed when their reference count reaches zero.

## 9. Documentation and Demos

Update Chinese and English component documentation to describe root semantics and slot tables. Add or revise demos for:

- Semantic classes and styles for each component family
- Custom HiTalent prefix
- Custom Ant Design prefix
- Portal popup and minimized dock styling
- Drawer, Modal, and Table resize
- Table row and column drag
- PopoverSelect single, multiple-array, and multiple-string values
- ResponsiveButtonGroup with many items and asynchronous actions

Old APIs and migration compatibility are not documented because backward compatibility is not a goal.

## 10. Validation

No test dependency is added. Completion requires:

1. `npm run lint`
2. Full ESM/CJS/declaration build
3. Dumi documentation build
4. Client-side manual probes for semantic slots, both prefix systems, portals, resize, drag, PopoverSelect result types, and responsive overflow behavior
5. Git diff review for unintended generated or unrelated changes

## 11. Acceptance Criteria

- No component source or component style file contains a hard-coded `.ant-*` selector.
- Every internal child and portal uses the namespace resolved by its public component.
- Every documented semantic slot has a type and a concrete target.
- Table root styling controls both toolbar and table.
- PopoverSelect runtime values match its discriminated TypeScript contract.
- ResponsiveButtonGroup does not render all collapsed combinations.
- Resize listeners exist only during an active interaction and honor pointer ids.
- Unmount leaves no body styles, listeners, RAF callbacks, timers, portal containers, style nodes, or root CSS variables behind.
- Non-adapter component code contains no `any`.
- Lint, library build, and documentation build pass.
