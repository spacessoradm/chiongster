import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const RedeemItems = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "item_name", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: itemsData, error: itemsDataError } = await supabase
        .from('redeem_items')
        .select('id, item_name, venue_id, created_at')
        .range(start, end);

      if (itemsDataError) throw itemsDataError;

      const { data: venuesData, error: venuesDataError } = await supabase
        .from('venues')
        .select('id, venue_name');

      if (venuesDataError) throw venuesDataError;

      itemsData.forEach(item => {
        const venue = venuesData.find(venue => venue.id === item.venue_id);
        if (venue) {
          item.venue_name = venue.venue_name;
        }
      });

      setItems(itemsData);
      setFilteredItems(itemsData);

      const { count } = await supabase
        .from('redeem_items')
        .select('id', { count: 'exact', head: true });

      setTotalPages(Math.ceil(count / limit));
    } catch (error) {
      setError("Failed to fetch items.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = items.filter((item) =>
        item.item_name.toLowerCase().includes(term)
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchCategories(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchCategories(newPage);
    }
  };

  useEffect(() => {
    fetchItems(page);
  }, [page]);

  const handleRefresh = () => fetchItems(page);

  const handleCreate = () => navigate("create");

  const deleteItem = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('redeem_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      setFilteredItems((prevFilteredItems) =>
        prevFilteredItems.filter((item) => item.id !== id)
      );

      showToast("Item deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete item.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Item Module</p>
      <p className='subtitle-page'>Manage your items here.</p>

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

      {!loading && !error && filteredItems.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'> ID </th>
                <th
                  onClick={() => handleSort("item_name")}
                  className='sort-header'
                >
                  Item Name {sortConfig.key === "item_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'> Venue Name </th>
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
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className='normal-column'>{item.id}</td>
                  <td className='normal-column'>{item.item_name}</td>
                  <td className='normal-column'>{item.venue_name}</td>
                  <td className='normal-column'>{item.created_at}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/redeemitems/view/${item.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/redeemitems/edit/${item.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteItem(item.id)}
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
        !loading && <p>No items found.</p>
      )}
    </div>
  );
};

export default RedeemItems;
