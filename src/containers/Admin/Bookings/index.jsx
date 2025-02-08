import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";

import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const Bookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 15;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchDataList = async (pageNumber = 1) => {
    setLoading(true);

    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: bookingList, error: bookingListError } = await supabase
        .from('booking')
        .select('*')
        .range(start, end);

      if (bookingListError){
        showToast("Failed to fetch booking list. " + bookingListError , "error");
      }

      const { data: profileNameList, error: profileNameListError } = await supabase
        .from('profiles')
        .select('id, username');

      if (profileNameListError){
        showToast("Failed to fetch profile name list. " + profileNameListError , "error");
      }
 

      bookingList.forEach(booking => {
        const profile = profileNameList.find(prof => prof.id === booking.user_id);
        if (profile) {
          booking.username = profile.username;
        }
      });

      setBookings(bookingList);
      setFilteredBookings(bookingList);
      setTotalPages(Math.ceil(bookingList.length / limit));
    } catch (error) {
      showToast("Failed to fetch booking list. " + error , "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = bookings.filter((booking) =>
        booking.username.toLowerCase().includes(term)
      );
      setFilteredBookings(filtered);
    } else {
      setFilteredBookings(bookings);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchDataList(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchDataList(newPage);
    }
  };

  useEffect(() => {
    fetchDataList(page);
  }, [page]);

  const deleteBooking = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this booking?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('booking')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== id));
      setFilteredBookings((prevFilteredBookings) =>
        prevFilteredBookings.filter((booking) => booking.id !== id)
      );

      alert("Booking deleted successfully.");
    } catch (err) {
      setError("Failed to delete booking.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchDataList(page);

  const handleCreate = () => navigate("create");

  return (
    <div className='venue-category' style={{ fontFamily: "Courier New" }}>
      <p className='title-page'>Booking Module</p>
      <p className='subtitle-page'>Manage user booking here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {/* Show loading state */}
      {loading && <p>Loading records...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && filteredBookings.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("user")}
                  className='sort-header'
                >
                  User {sortConfig.key === "user" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("checkin_date")}
                  className='sort-header'
                >
                  CheckIn Date {sortConfig.key === "checkin_date" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("booking_date")}
                  className='sort-header'
                >
                  Booking Date {sortConfig.key === "booking_date" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className='normal-column'>{booking.id}</td>
                  <td className='normal-column'>{booking.username}</td>
                  <td className='normal-column'>{new Date(booking.preferred_date).toLocaleDateString()}</td>
                  <td className='normal-column'>{new Date(booking.created_at).toLocaleString()}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/bookings/view/${booking.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/bookings/edit/${booking.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteBooking(booking.id)}
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
        !loading && <p>No Bookings found.</p>
      )}
    </div>
  );
};

export default Bookings;
