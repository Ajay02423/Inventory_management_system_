import LoadingSpinner from "./LoadingSpinner";

export default function TableState({ loading, itemsLength, colSpan, emptyMessage, children }) {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td className="px-4 py-10 text-center text-sm text-ink/60" colSpan={colSpan}>
            <span className="inline-flex items-center gap-3">
              <LoadingSpinner />
              Loading data...
            </span>
          </td>
        </tr>
      </tbody>
    );
  }

  if (!itemsLength) {
    return (
      <tbody>
        <tr>
          <td className="px-4 py-10 text-center text-sm text-ink/60" colSpan={colSpan}>
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  return <tbody>{children}</tbody>;
}
