import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const Tiers = () => {
  const navigate = useNavigate();

  const [tiers, setTiers] = useState([]);
  const [filteredTiers, setFilteredTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchList = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: tiersData, error: tiersError } = await supabase
        .from('tiers')
        .select('*')
        .range(start, end);

      if (tiersError) throw tiersError;

      setTiers(tiersData);
      setFilteredTiers(tiersData);
      setTotalPages(Math.ceil(tiersData.length / limit));
    } catch (error) {
      showToast("Failed to fetch tiers.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = tiers.filter((tiers) =>
        tiers.name.toLowerCase().includes(term)
      );
      setFilteredTiers(filtered);
    } else {
      setFilteredTiers(tiers);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchList(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchList(newPage);
    }
  };

  useEffect(() => {
    fetchList(page);
  }, [page]);

  const handleRefresh = () => fetchList(page);

  const handleCreate = () => navigate("create");

  const deleteTier = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this tier?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('tiers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTiers((prevTiers) => prevTiers.filter((tiers) => tiers.id !== id));
      setFilteredTiers((prevFilteredTiers) =>
        prevFilteredTiers.filter((tiers) => tiers.id !== id)
      );

      showToast("Tier deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete tier.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Tiers Module</p>
      <p className='subtitle-page'>Manage your tiers here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading tiers...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && filteredTiers.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("name")}
                  className='sort-header'
                >
                  Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
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
              {filteredTiers.map((tiers) => (
                <tr key={tiers.id}>
                  <td className='normal-column'>{tiers.id}</td>
                  <td className='normal-column'>{tiers.name}</td>
                  <td className='normal-column'>{tiers.status}</td>
                  <td className='normal-column'>{new Date(tiers.created_at).toLocaleString()}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/tiers/view/${tiers.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/tiers/edit/${tiers.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteTier(tiers.id)}
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
        !loading && <p>No tiers found.</p>
      )}
    </div>
  );
};

export default Tiers;
