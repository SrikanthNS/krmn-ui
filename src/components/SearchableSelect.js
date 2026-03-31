import React, { useEffect, useRef, useState } from "react";

/**
 * A searchable single-select dropdown that replaces native <select>.
 *
 * Props:
 *  - options: [{ value, label }]
 *  - value: currently selected value (string)
 *  - onChange(value): called with the selected value string
 *  - placeholder: text when nothing is selected
 *  - className: extra class on the wrapper (e.g. "is-invalid")
 *  - id: optional id for label association
 *  - disabled: boolean
 */
const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select…",
  className = "",
  id,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const searchRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus search when opened; clear search on close
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
    if (!open) setSearch("");
  }, [open]);

  const selectedOption = options.find((o) => String(o.value) === String(value));

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (val) => {
    onChange(String(val));
    setOpen(false);
  };

  const toggleClasses = [
    "ss-toggle",
    open && "open",
    selectedOption && "has-value",
    className.includes("is-invalid") && "is-invalid",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`ss-dropdown ${className}`} ref={ref} id={id}>
      <button
        type="button"
        className={toggleClasses}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
      >
        {selectedOption ? (
          <span className="ss-text">{selectedOption.label}</span>
        ) : (
          <span className="ss-text ss-placeholder">{placeholder}</span>
        )}
        <span className="ss-arrow">{open ? "\u25B2" : "\u25BC"}</span>
      </button>
      {open && (
        <div className="ss-menu">
          {options.length > 5 && (
            <div className="ss-search">
              <input
                ref={searchRef}
                type="text"
                placeholder="Type to search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          <div className="ss-options">
            {filteredOptions.length === 0 ? (
              <div className="ss-no-match">No matches</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`ss-option${String(opt.value) === String(value) ? " selected" : ""}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
