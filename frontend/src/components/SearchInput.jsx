import { Search } from "lucide-react";

export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
      <input
        className="field-input pl-11"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type="search"
      />
    </label>
  );
}
