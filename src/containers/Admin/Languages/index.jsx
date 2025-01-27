import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const Language = () => {
  const navigate = useNavigate();

  const [languages, setLanguages] = useState([]);
  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "language_name", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchLanguages = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: languagesData, error: languagesError } = await supabase
        .from('languages')
        .select('*')
        .range(start, end);

      if (languagesError) throw languagesError;

      setLanguages(languagesData);
      setFilteredLanguages(languagesData);
      setTotalPages(Math.ceil(languagesData.length / limit));
    } catch (error) {
      showToast("Failed to fetch languages.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = languages.filter((language) =>
        language.language_name.toLowerCase().includes(term)
      );
      setFilteredLanguages(filtered);
    } else {
      setFilteredLanguages(languages);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchLanguages(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchLanguages(newPage);
    }
  };

  useEffect(() => {
    fetchLanguages(page);
  }, [page]);

  const handleRefresh = () => fetchLanguages(page);

  const handleCreate = () => navigate("create");

  const deleteLanguage = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this language?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('languages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLanguages((prevLanguages) => prevLanguages.filter((language) => language.id !== id));
      setFilteredLanguages((prevFilteredLanguages) =>
        prevFilteredLanguages.filter((language) => language.id !== id)
      );

      showToast("Language deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete language.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Language Module</p>
      <p className='subtitle-page'>Manage your languages here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading languages...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && !error && filteredLanguages.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("language_name")}
                  className='sort-header'
                >
                  Language Name {sortConfig.key === "language_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'>Status</th>
                <th
                  onClick={() => handleSort("created_at")}
                  className='sort-header'
                >
                  Created At {sortConfig.key === "created_at" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLanguages.map((language) => (
                <tr key={language.id}>
                  <td className='normal-column'>{language.id}</td>
                  <td className='normal-column'>{language.language_name}</td>
                  <td className='normal-column'>{language.status}</td>
                  <td className='normal-column'>{language.created_at}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/languages/view/${language.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/languages/edit/${language.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteLanguage(language.id)}
                      title='Delete'
                      className='delete-button'
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        !loading && <p>No languages found.</p>
      )}
    </div>
  );
};

export default Language;
