import React, { useEffect, useRef, useState } from "react";

const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
  placeholder,
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

  // Auto-focus search when opened
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
    if (!open) setSearch("");
  }, [open]);

  const toggle = (val) => {
    const strVal = String(val);
    if (selected.includes(strVal)) {
      onChange(selected.filter((v) => v !== strVal));
    } else {
      onChange([...selected, strVal]);
    }
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const displayText = () => {
    if (selected.length === 0) return null;
    if (selected.length === 1) {
      const opt = options.find((o) => String(o.value) === selected[0]);
      return opt ? opt.label : selected[0];
    }
    return `${selected.length} selected`;
  };

  const hasValue = selected.length > 0;
  const toggleClasses = [
    "ms-dropdown-toggle",
    open && "open",
    hasValue && "has-value",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="ms-dropdown" ref={ref}>
      {label && <label>{label}</label>}
      <button
        type="button"
        className={toggleClasses}
        onClick={() => setOpen(!open)}
      >
        {hasValue ? (
          <span className="ms-dropdown-text">{displayText()}</span>
        ) : (
          <span className="ms-dropdown-text placeholder">
            {placeholder || "All"}
          </span>
        )}
        {hasValue && selected.length > 1 && (
          <span className="ms-dropdown-count">{selected.length}</span>
        )}
        <span className="ms-dropdown-arrow">{open ? "\u25B2" : "\u25BC"}</span>
      </button>
      {open && (
        <div className="ms-dropdown-menu">
          {options.length > 5 && (
            <div className="ms-dropdown-search">
              <input
                ref={searchRef}
                type="text"
                placeholder="Type to search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          {filteredOptions.length === 0 ? (
            <div className="ms-dropdown-no-match">No matches</div>
          ) : (
            filteredOptions.map((opt) => {
              const isChecked = selected.includes(String(opt.value));
              return (
                <label
                  key={opt.value}
                  className={`ms-dropdown-item${isChecked ? " checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })
          )}
          {selected.length > 0 && (
            <button
              type="button"
              className="ms-dropdown-clear"
              onClick={() => onChange([])}
            >
              ✕ Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
