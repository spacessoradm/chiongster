import React from 'react';
import { FaArrowCircleLeft, FaArrowCircleRight } from "react-icons/fa";
import './index.css';

const Pagination = ({ page, totalPages, onPageChange }) => {
  return (
    <div className="pagination-container">
      <FaArrowCircleLeft
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        title="Previous Page"
        className={`pagination-button ${page === 1 ? "disabled" : ""}`}
      />
      <span className="pagination-info">Page {page} of {totalPages}</span>
      <FaArrowCircleRight
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        title="Next Page"
        className={`pagination-button ${page === totalPages ? "disabled" : ""}`}
      />
    </div>
  );
};

export default Pagination;
