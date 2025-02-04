import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const Notis = () => {
  const navigate = useNavigate();

  const [notis, setNotis] = useState([]);
  const [filteredNotis, setFilteredNotis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "notis_name", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchNotis = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: notisData, error: notisError } = await supabase
        .from('notis')
        .select('*')
        .range(start, end);

      if (notisError) throw notisError;

      setNotis(notisData);
      setFilteredNotis(notisData);
      setTotalPages(Math.ceil(notisData.length / limit));
    } catch (error) {
      showToast("Failed to fetch notis.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = notis.filter((noti) =>
        noti.notis_name.toLowerCase().includes(term)
      );
      setFilteredNotis(filtered);
    } else {
      setFilteredNotis(notis);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchNotis(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchNotis(newPage);
    }
  };

  useEffect(() => {
    fetchNotis(page);
  }, [page]);

  const handleRefresh = () => fetchNotis(page);

  const handleCreate = () => navigate("create");

  const deleteNotis = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this noti?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('notis')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotis((prevNotis) => prevNotis.filter((noti) => noti.id !== id));
      setFilteredNotis((prevFilteredNotis) =>
        prevFilteredNotis.filter((noti) => noti.id !== id)
      );

      showToast("Notis deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete notis.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Notis Module</p>
      <p className='subtitle-page'>Manage your notis here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading notis...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && !error && filteredNotis.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("notis_name")}
                  className='sort-header'
                >
                  Notis Name {sortConfig.key === "notis_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
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
              {filteredNotis.map((noti) => (
                <tr key={noti.id}>
                  <td className='normal-column'>{noti.id}</td>
                  <td className='normal-column'>{noti.notis_name}</td>
                  <td className='normal-column'>{noti.status}</td>
                  <td className='normal-column'>{noti.created_at}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/notis/view/${noti.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/notis/edit/${noti.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteNotis(noti.id)}
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
        !loading && <p>No notis found.</p>
      )}
    </div>
  );
};

export default Notis;
