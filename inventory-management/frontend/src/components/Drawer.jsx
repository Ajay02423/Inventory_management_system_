import { useEffect } from "react";
import { X } from "lucide-react";

export default function Drawer({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <button
        className={`absolute inset-0 bg-ink/45 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        type="button"
        aria-label="Close details"
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[520px] max-w-[95vw] flex-col overflow-hidden border-l border-white/10 bg-[#fbf7f0] shadow-2xl transition-transform duration-300 max-[539px]:w-full ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex-shrink-0 border-b border-ink/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="truncate pr-4 text-base font-semibold text-ink">{title}</h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-lg p-1.5 text-ink/50 transition-colors hover:bg-black/5 hover:text-ink"
              type="button"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? <div className="flex-shrink-0 border-t border-ink/10 px-5 py-4">{footer}</div> : null}
      </aside>
    </div>
  );
}
