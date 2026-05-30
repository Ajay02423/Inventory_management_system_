import LoadingSpinner from "./LoadingSpinner";
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  confirming = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={message} size="max-w-md">
      <div className="flex justify-end gap-3">
        <button className="btn-secondary" type="button" onClick={onClose} disabled={confirming}>
          Cancel
        </button>
        <button className="btn-primary bg-berry-700 hover:!bg-berry-800" type="button" onClick={onConfirm} disabled={confirming}>
          {confirming ? <LoadingSpinner /> : null}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
