import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, description, children, size = "max-w-2xl" }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`panel max-h-[90vh] w-full ${size} overflow-hidden`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-ink/10 px-6 py-5">
          <div>
            <h2 className="text-2xl">{title}</h2>
            {description ? <p className="mt-1 text-sm text-ink/70">{description}</p> : null}
          </div>
          <button className="btn-ghost !rounded-full !p-2" onClick={onClose} type="button" aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[calc(90vh-96px)] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
