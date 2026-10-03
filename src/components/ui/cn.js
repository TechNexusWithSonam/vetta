/**
 * Join class-name fragments, dropping anything falsy. Flattens one level of
 * arrays so `cn('a', cond && 'b', ['c', 'd'])` works. Deliberately tiny — the
 * project has no `clsx`/`tailwind-merge` dependency and doesn't need one; keep
 * conditional classes non-conflicting at the call site.
 */
export function cn(...parts) {
  return parts
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim();
}

export default cn;
