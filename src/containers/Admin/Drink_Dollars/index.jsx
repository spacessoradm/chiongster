import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

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
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchDrinkDollars = async (pageNumber = 1) => {
    setLoading(true);
    setError(null); // Reset error state before fetching
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, username')
        .range(start, end);

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
      showToast("Failed to fetch drink dollar records.", "error");
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

  const handleRefresh = () => fetchDrinkDollars(page);

  const handleCreate = () => navigate("create");


  return (
    <div className='app-users'>
      <p className='title-page'>Drink Dollar Module</p>
      <p className='subtitle-page'>Manage users drink dollar here.</p>

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
              <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("username")}
                  className='sort-header'
                >
                  Username {sortConfig.key === "username" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'>Coins</th>
                <th
                  onClick={() => handleSort("lastupdate")}
                  className='sort-header'
                >
                  Last Update {sortConfig.key === "lastupdate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrinkDollars.map((drinkDollar) => (
                <tr key={drinkDollar.id}>
                  <td className='normal-column'>{drinkDollar.id}</td>
                  <td className='normal-column'>{drinkDollar.username}</td>
                  <td className='normal-column'>
                    {drinkDollar.coins}
                  </td>
                  <td className='normal-column'>
                    {new Date(drinkDollar.lastupdate).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/drinkdollars/view/${drinkDollar.id}`)}
                      title='View'
                      className='view-button'
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
        !loading && <p>No records found.</p>
      )}
    </div>
  );
};

export default DrinkDollars;
