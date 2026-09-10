# Vetta design system

One import surface for every reusable UI primitive:

```jsx
import { Button, Card, CardBody, Modal, Badge, useToast } from '../components/ui';
```

## Tokens

Defined in [`src/index.css`](../../index.css) under Tailwind v4 `@theme`, so they
generate utilities automatically.

| Token group | Utilities | Notes |
|---|---|---|
| `brand-50 … brand-950` | `bg-brand-600`, `text-brand-700`, `ring-brand-500` | Deep indigo — the Vetta identity. Visually identical to the legacy `indigo-*` classes, which still work; migrate new code to `brand-*`. |
| `accent-400/500/600` | `from-accent-500` | Violet, **gradients only** — used sparingly. |
| `ink-900/700/500/400` | `text-ink-700` | Dark-navy text ramp (heading / body / muted / faint). Slate utilities remain fine too. |
| `shadow-card`, `shadow-card-hover`, `shadow-pop` | `shadow-card` | Card rest / card hover / popover-overlay elevation. |
| `rounded-card` | `rounded-card` | 12px — the standard card radius. |
| `font-sans` | `font-sans` | Inter (loaded in `index.html`), system fallback stack. |

## Components

| Component | Exports |
|---|---|
| Button | `Button` — `variant` primary/secondary/outline/ghost/danger/link · `size` sm/md/lg · `loading` · `iconLeft`/`iconRight` · `iconOnly` · `fullWidth` · `as` |
| Inputs | `Input`, `Textarea` — `label`/`hint`/`error`/`required`/`icon`/`trailing`. `Label`, `FieldError`, `FieldHint`, `FieldShell` for custom controls |
| Select | `Select` — native, `options={[{value,label}]}` or `<option>` children, `placeholder` |
| Choice | `Checkbox` (`indeterminate`), `Radio`, `RadioGroup` (`value`/`onChange`) |
| Badge | `Badge` — `tone` neutral/brand/success/warning/danger/info · `size` · `dot` |
| Card | `Card` (`interactive`, `padded`), `CardHeader` (`title`/`description`/`actions`), `CardBody`, `CardFooter` |
| Loading | `Spinner` (`size` sm/md/lg/xl), `LoadingState`, `Skeleton`, `SkeletonText`, `SkeletonTable` |
| States | `ErrorState` (`error`/`onRetry`/`compact`), `EmptyState` (`icon`/`title`/`hint`/`action`) |
| Modal | `Modal` (`open`/`onClose`/`title`/`size`/`footer`/`dismissible`), `ConfirmDialog` (`onConfirm`/`tone`/`loading`) — portalled, focus-trapped, scroll-locked |
| Dropdown | `Dropdown` (`trigger`/`align`), `DropdownItem` (`icon`/`danger`/`disabled`/`onSelect`), `DropdownSeparator`, `DropdownLabel` — roving focus, Esc/outside-click close |
| Tooltip | `Tooltip` (`label`/`side`/`delay`) — hover + focus, `aria-describedby` |
| Tabs | `Tabs` (`value`/`defaultValue`/`onValueChange`), `TabsList`, `TabsTrigger` (`count`), `TabsContent` — arrow-key roving focus |
| Table | `Table` (scroll container), `THead`, `TBody`, `TR` (`onClick`), `TH`/`TD` (`align`), `TableEmpty` (`colSpan`) |
| Pagination | `Pagination` — `page` + `pageCount` **or** `total` + `pageSize`, `onPageChange` |
| Breadcrumb | `Breadcrumb` — `items={[{label,to}]}`, `linkComponent={Link}` for router links |
| Toast | `useToast()` → `{ toast, success, error, info, dismiss }`. Provider stays in `App.jsx` |

## Conventions

- **Refs**: components accept `ref` as a normal prop (React 19).
- **Class overrides**: every component takes `className` merged last via `cn()`.
  There's no `tailwind-merge` — keep overrides non-conflicting.
- **Accessibility**: labels are bound, errors use `role="alert"` +
  `aria-describedby`, overlays trap focus and restore it, interactive lists use
  arrow-key roving focus. Keep it that way.
- **Motion**: shared keyframes (`vetta-panel-in`, `vetta-menu-in`,
  `vetta-overlay-in`) live in `index.css` and are disabled under
  `prefers-reduced-motion`.
