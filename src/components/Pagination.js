import React from "react";

const DEFAULT_ITEMS_PER_PAGE = 20;
const ALLOWED_PAGE_SIZES = [10, 20, 50, 100];

const PageSizeSelect = ({ value, onChange }) => (
  <select
    className="form-control form-control-sm"
    style={{ width: 70, display: "inline-block" }}
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
  >
    {ALLOWED_PAGE_SIZES.map((size) => (
      <option key={size} value={size}>
        {size}
      </option>
    ))}
  </select>
);

const Pagination = ({
  currentPage,
  totalItems,
  onPageChange,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className="pagination-wrapper" aria-label="Page navigation">
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
        </li>
        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <li key={`ellipsis-${idx}`} className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          ) : (
            <li
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => onPageChange(page)}>
                {page}
              </button>
            </li>
          ),
        )}
        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export { DEFAULT_ITEMS_PER_PAGE, ALLOWED_PAGE_SIZES, PageSizeSelect };
export default Pagination;
