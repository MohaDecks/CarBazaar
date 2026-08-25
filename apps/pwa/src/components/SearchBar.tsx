import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const navigate = useNavigate();

  function submit() {
    navigate(`/search${value ? `?q=${encodeURIComponent(value)}` : ""}`);
  }

  return (
    <div className="search-bar">
      <span className="search-lead" aria-hidden>
        <Search size={18} strokeWidth={1.75} />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search brand, model or year"
        aria-label="Search vehicles"
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button type="button" className="search-btn" onClick={submit} aria-label="Submit search">
        <Search size={16} />
      </button>
    </div>
  );
}
