/**
 * Vetta design system — single import surface.
 *
 *   import { Button, Card, CardBody, Modal, useToast } from '../components/ui';
 *
 * Tokens live in `src/index.css` under `@theme` (`brand-*`, `ink-*`,
 * `shadow-card`, `rounded-card`, …). See `./README.md` for the catalogue.
 *
 * `Skeleton`, `ErrorState`, and `EmptyState` keep the exact API they had in the
 * old `components/ui.jsx`, so existing page imports are unchanged.
 */

export { cn } from './cn.js';

export { Button } from './Button.jsx';
export { Input, Textarea, Label, FieldError, FieldHint, FieldShell } from './Input.jsx';
export { FIELD_BASE, fieldTone } from './fieldStyles.js';
export { Select } from './Select.jsx';
export { Checkbox, Radio, RadioGroup } from './Choice.jsx';
export { Badge } from './Badge.jsx';
export { Card, CardHeader, CardBody, CardFooter } from './Card.jsx';
export { Spinner, LoadingState } from './Spinner.jsx';
export { Skeleton, SkeletonText, SkeletonTable } from './Skeleton.jsx';
export { ErrorState, EmptyState } from './states.jsx';
export { Modal, ConfirmDialog } from './Modal.jsx';
export { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel } from './Dropdown.jsx';
export { Tooltip } from './Tooltip.jsx';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs.jsx';
export { Table, THead, TBody, TR, TH, TD, TableEmpty } from './Table.jsx';
export { Pagination } from './Pagination.jsx';
export { Breadcrumb } from './Breadcrumb.jsx';

// Toasts already have an app-wide provider under `src/auth/`. Re-exported here
// so components can pull everything from one place; the provider stays mounted
// in `App.jsx`.
export { useToast } from '../../auth/useToast.js';
export { ToastProvider } from '../../auth/Toast.jsx';
