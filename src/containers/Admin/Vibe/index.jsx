import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const Vibe = () => {
  const navigate = useNavigate();

  const [vibes, setVibes] = useState([]);
  const [filteredVibes, setFilteredVibes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "vibe_name", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchVibes = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: vibesData, error: vibesError } = await supabase
        .from('vibe')
        .select('id, vibe_name, description, created_at')
        .range(start, end);

      if (vibesError) throw vibesError;

      setVibes(vibesData);
      setFilteredVibes(vibesData);
      setTotalPages(Math.ceil(vibesData.length / limit));
    } catch (error) {
      showToast("Failed to fetch vibes.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = vibes.filter((vibe) =>
        vibe.vibe_name.toLowerCase().includes(term)
      );
      setFilteredVibes(filtered);
    } else {
      setFilteredVibes(vibes);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchVibes(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchVibes(newPage);
    }
  };

  useEffect(() => {
    fetchVibes(page);
  }, [page]);

  const handleRefresh = () => fetchVibes(page);

  const handleCreate = () => navigate("create");

  const deleteVibe = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this vibe?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('vibe')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVibes((prevVibes) => prevVibes.filter((vibe) => vibe.id !== id));
      setFilteredVibes((prevFilteredVibes) =>
        prevFilteredVibes.filter((vibe) => vibe.id !== id)
      );

      showToast("Vibe deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete vibe.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Vibe Module</p>
      <p className='subtitle-page'>Manage your vibes here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading vibes...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && !error && filteredVibes.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("vibe_name")}
                  className='sort-header'
                >
                  Vibe Name {sortConfig.key === "vibe_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'> Description</th>
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
              {filteredVibes.map((vibe) => (
                <tr key={vibe.id}>
                  <td className='normal-column'>{vibe.id}</td>
                  <td className='normal-column'>{vibe.vibe_name}</td>
                  <td className='normal-column'>{vibe.description}</td>
                  <td className='normal-column'>{vibe.created_at}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/vibe/view/${vibe.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/vibe/edit/${vibe.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteVibe(vibe.id)}
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
        !loading && <p>No vibes found.</p>
      )}
    </div>
  );
}; 

export default Vibe;
