import { useState } from 'react';
import { Button, ConfirmDialog } from '../../components/ui';
import { useToast } from '../../components/ui';

/**
 * A single destructive/important action, wired to a confirmation dialog.
 * Owns its own open/loading state; only closes on success.
 */
export function ConfirmActionButton({
  label, icon, variant = 'danger', size = 'sm',
  confirmTitle = 'Are you sure?', confirmMessage, confirmLabel = 'Confirm',
  onConfirm, onSuccess, successMessage, disabled,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
      if (successMessage) toast.success(successMessage);
      onSuccess?.();
    } catch (err) {
      toast.error(err?.message || 'Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant={variant} size={size} iconLeft={icon} onClick={() => setOpen(true)} disabled={disabled}>
        {label}
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmLabel}
        tone={variant === 'danger' ? 'danger' : 'primary'}
        loading={loading}
      />
    </>
  );
}

export default ConfirmActionButton;
