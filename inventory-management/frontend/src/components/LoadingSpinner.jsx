export default function LoadingSpinner({ className = "h-5 w-5" }) {
  return (
    <span
      className={`${className} inline-block animate-spin rounded-full border-2 border-current border-r-transparent`}
      aria-hidden="true"
    />
  );
}
