import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import './index.css';

const DrinkDollars = () => {
  const navigate = useNavigate();

  const [drinkDollars, setDrinkDollars] = useState([]);
  const [filteredDrinkDollars, setFilteredDrinkDollars] = useState([]); // For filtered data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // For search functionality
  const [sortConfig, setSortConfig] = useState({ key: "username", direction: "asc" }); // Default sorting
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages

  const limit = 10; 

  const fetchDrinkDollars = async (pageNumber = 1) => {
    setLoading(true);
    setError(null); // Reset error state before fetching
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, username');

      // Fetch users from auth.users
      const { data: drinkDollarData, error: drinkDollarDataError } = await supabase
        .from('drink_dollars')
        .select('*');

      if (drinkDollarDataError) throw drinkDollarDataError;

      // Merge the data
      const usersWithDrinkDollars = users.map(user => {
        const userDollar = drinkDollarData.find(drinkDollarDt => drinkDollarDt.user_id === user.id);
      
        // Return a user object only if userDollar is defined
        if (userDollar) {
          return {
            id: userDollar.id,
            username: user.username,
            coins: userDollar.coins,
            lastupdate: userDollar.modified_at,
          };
        }
      
        // Otherwise, return null or handle missing data appropriately
        return null; 
      }).filter(Boolean); // This removes null values, ensuring the array is clean.
      
      setDrinkDollars(usersWithDrinkDollars);
      setFilteredDrinkDollars(usersWithDrinkDollars); // Initialize filtered data
      setTotalPages(Math.ceil(usersWithDrinkDollars.length / limit)); // Calculate total pages
    } catch (error) {
      setError("Failed to fetch drink dollar records.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search functionality
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = drinkDollars.filter((drinkDollar) =>
        drinkDollar.username.toLowerCase().includes(term)
      );
      setFilteredDrinkDollars(filtered);
    } else {
      setFilteredDrinkDollars(drinkDollars); // Reset to full list if no search term
    }
  };

  // Handle sorting functionality
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    // Refetch sorted data
    fetchDrinkDollars(page);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchDrinkDollars(newPage);
    }
  };

  // Fetch data on component mount and when page changes
  useEffect(() => {
    fetchDrinkDollars(page);
  }, [page]);

  const deleteRecord = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('drink_dollars')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDrinkDollars((prevDrinkDollars) => prevDrinkDollars.filter((drinkDollar) => drinkDollar.id !== id));
      setFilteredDrinkDollars((prevFilteredDrinkDollars) =>
        prevFilteredDrinkDollars.filter((drinkDollar) => drinkDollar.id !== id)
      );

      alert("Record deleted successfully.");
    } catch (err) {
      setError("Failed to delete record.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='app-users'>
      <h1>Manage Drink Dollars</h1>

      {/* Search and Refresh */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Search users..."
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
          onClick={() => fetchDrinkDollars(page)}
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
      </div>

      {/* Show loading state */}
      {loading && <p>Loading records...</p>}

      {/* Show error state */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Display users */}
      {!loading && !error && filteredDrinkDollars.length > 0 ? (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4" }}>
              <th style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>ID</th>
                <th
                  onClick={() => handleSort("username")}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  Username {sortConfig.key === "username" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>Coins</th>
                <th
                  onClick={() => handleSort("lastupdate")}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  Last Update {sortConfig.key === "lastupdate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrinkDollars.map((drinkDollar) => (
                <tr key={drinkDollar.id}>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{drinkDollar.id}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{drinkDollar.username}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>
                    {drinkDollar.coins}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                    {new Date(drinkDollar.lastupdate).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>
                  <button
                    onClick={() => navigate(`/admin/drinkdollars/view/${drinkDollar.id}`)}
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
                      onClick={() => navigate(`/admin/drinkdollars/edit/${drinkDollar.id}`)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
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
        !loading && <p>No records found.</p>
      )}
    </div>
  );
};

export default DrinkDollars;
