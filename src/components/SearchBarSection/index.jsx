import React from 'react';
import { FaSyncAlt, FaPlus } from 'react-icons/fa';
import './index.css'; // Assuming styles are shared

const SearchBar = ({ searchTerm, onSearch, onRefresh, onCreate }) => {
  return (
    <div className='search-bar'>
      <input
        className='search-input'
        type="text"
        placeholder="Search Keywords..."
        value={searchTerm}
        onChange={onSearch}
      />
      <div className='button-container'>
        <FaSyncAlt
          onClick={onRefresh}
          onMouseOver={(e) => (e.target.style.transform = "rotate(90deg)")}
          onMouseOut={(e) => (e.target.style.transform = "rotate(0deg)")}
          title="Refresh"
          className="refresh-button"
        />
        <FaPlus
          onClick={onCreate}
          title="Create"
          className="create-button"
        />
      </div>
    </div>
  );
};

export default SearchBar;
