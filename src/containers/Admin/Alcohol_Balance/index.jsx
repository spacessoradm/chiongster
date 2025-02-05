import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const AlcoholBalance = () => {
  const navigate = useNavigate();

  const [alcoholBalances, setAlcoholBalances] = useState([]);
  const [filteredAlcoholBalances, setFilteredAlcoholBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "alcohol_name", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchAlcoholBalances = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: alcoholBalancesData, error: alcoholBalancesDataError } = await supabase
        .from('alcohol_balance')
        .select('id, alcohol_name, venue_id, created_at')
        .range(start, end);

      if (alcoholBalancesDataError) throw alcoholBalancesDataError;

      const { data: venuesData, error: venuesDataError } = await supabase
        .from('venues')
        .select('id, venue_name');

      if (venuesDataError) throw venuesDataError;

      alcoholBalancesData.forEach(item => {
        const venue = venuesData.find(venue => venue.id === item.venue_id);
        if (venue) {
          item.venue_name = venue.venue_name;
        }
      });

      setAlcoholBalances(alcoholBalancesData);
      setFilteredAlcoholBalances(alcoholBalancesData);

      const { count } = await supabase
        .from('alcohol_balance')
        .select('id', { count: 'exact', head: true });

      setTotalPages(Math.ceil(count / limit));
    } catch (error) {
      showToast("Failed to fetch alcohol balances.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = alcoholBalances.filter((item) =>
        item.alcohol_name.toLowerCase().includes(term)
      );
      setFilteredAlcoholBalances(filtered);
    } else {
      setFilteredAlcoholBalances(alcoholBalances);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchAlcoholBalances(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchAlcoholBalances(newPage);
    }
  };

  useEffect(() => {
    fetchAlcoholBalances(page);
  }, [page]);

  const handleRefresh = () => fetchAlcoholBalances(page);

  const handleCreate = () => navigate("create");

  const deleteAlcoholBalance = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this alcohol balance?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('alcohol_balance')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAlcoholBalances((prevAlcoholBalances) => prevAlcoholBalances.filter((item) => item.id !== id));
      setFilteredAlcoholBalances((prevFilteredAlcoholBalances) =>
        prevFilteredAlcoholBalances.filter((item) => item.id !== id)
      );

      showToast("Alcohol balance deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete alcohol balance.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Alcohol Balance Module</p>
      <p className='subtitle-page'>Manage your alcohol balances here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && (
        <p className="loading-message">Loading items...</p>
      )}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && !error && filteredAlcoholBalances.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'> ID </th>
                <th
                  onClick={() => handleSort("alcohol_name")}
                  className='sort-header'
                >
                  Alcohol Name {sortConfig.key === "alcohol_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("created_at")}
                  className='sort-header'
                >
                  Created At {sortConfig.key === "created_at" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'> Actions </th>
              </tr>
            </thead>
            <tbody>
              {filteredAlcoholBalances.map((item) => (
                <tr key={item.id}>
                  <td className='normal-column'>{item.id}</td>
                  <td className='normal-column'>{item.alcohol_name}</td>
                  <td className='normal-column'>{item.created_at}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/alcoholbalance/view/${item.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/alcoholbalance/edit/${item.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteAlcoholBalance(item.id)}
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
        !loading && <p>No alcohol balances found.</p>
      )}
    </div>
  );
};

export default AlcoholBalance;
