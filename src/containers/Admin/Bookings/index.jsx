import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

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

  const limit = 10;

  const fetchBookings = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('booking')
        .select('*');

      if (bookingsError) throw bookingsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Merge the data
      const usersWithBookings = profilesData.map(profilesDt => {
        const userBooking = bookingsData.find(bookingsDt => bookingsDt.user_id === profilesDt.id);
      
        if (userBooking) {
          return {
            id: userBooking.id, // Access the `userBooking` object
            user: profilesDt.username,
            checkin_date: userBooking.checkin_date, // Ensure the correct field is used
            booking_date: userBooking.created_at,
          };
        }
      
        // Return null or handle missing data appropriately
        return null; 
      }).filter(Boolean); // Filter out any null values
      

      setBookings(usersWithBookings);
      setFilteredBookings(usersWithBookings);
      setTotalPages(Math.ceil(usersWithBookings.length / limit));
    } catch (error) {
      setError("Failed to fetch bookings.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = bookings.filter((booking) =>
        booking.user.toLowerCase().includes(term)
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

    fetchBookings(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchBookings(newPage);
    }
  };

  useEffect(() => {
    fetchBookings(page);
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

  return (
    <div className='venue-category' style={{ fontFamily: "Courier New" }}>
      <h2>Manage Booking</h2>
      <p></p>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", fontFamily: "Courier New" }}>
        <input
          type="text"
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "100%",
            maxWidth: "400px",
          }}
        />
        <button
          onClick={() => fetchBookings(page)}
          style={{
            padding: "10px 20px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#4CAF50",
            color: "white",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
        <button
          onClick={() => navigate("create")}
          style={{
            padding: "10px 20px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#4CAF50",
            color: "white",
            cursor: "pointer",
          }}
        >
          Create
        </button>
      </div>

      {loading && <p>Loading bookings...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && filteredBookings.length > 0 ? (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              fontFamily: "Courier New",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4" }}>
                <th style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>ID</th>
                <th
                  onClick={() => handleSort("user")}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  User {sortConfig.key === "user" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("checkin_date")}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  Checkin Date {sortConfig.key === "checkin_date" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("booking_date")}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  Booking Date {sortConfig.key === "booking_date" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{booking.id}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{booking.user}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{booking.checkin_date}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{booking.booking_date}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>
                    <button
                      onClick={() => navigate(`/admin/bookings/view/${booking.id}`)}
                      style={{
                        marginRight: "10px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        backgroundColor: "#FFA500",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                      }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/admin/bookings/edit/${booking.id}`)}
                      style={{
                        marginRight: "10px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBooking(booking.id)}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              style={{
                marginRight: "10px",
                padding: "8px 12px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              style={{
                marginLeft: "10px",
                padding: "8px 12px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: page === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        !loading && <p>No Bookings found.</p>
      )}
    </div>
  );
};

export default Bookings;
