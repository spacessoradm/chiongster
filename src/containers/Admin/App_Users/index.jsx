import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import './index.css';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const AppUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // For filtered data
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

  const fetchUsers = async (pageNumber = 1) => {
    setLoading(true);
    setError(null); // Reset error state before fetching
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      // Fetch users from auth.users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, unique_id')
        .range(start, end);

      if (usersError) throw usersError;

      // Fetch roles from user_roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role_id')
        .eq('role_id', 2);

      if (rolesError) throw rolesError;

      // Merge the data
      const usersWithRoles = users
        .map(user => {
          // Find the role for this user
          const userRole = roles.find(role => role.user_id === user.id && role.role_id === 2);

          // Only include users with role_id === 2
          if (!userRole) {
            return null; // Exclude this user if no matching role is found
          }

          return {
            id: user.id,
            username: user.username,
            unique_id: user.unique_id,
            role: 'Client' // role_id === 2 is treated as 'Client'
          };
        })
        .filter(user => user !== null);

      setUsers(usersWithRoles);
      setFilteredUsers(usersWithRoles); // Initialize filtered data
      setTotalPages(Math.ceil(usersWithRoles.length / limit)); // Calculate total pages
    } catch (error) {
      setError("Failed to fetch app users.");
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
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users); // Reset to full list if no search term
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
    fetchUsers(page);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchUsers(newPage);
    }
  };

  // Fetch data on component mount and when page changes
  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('profile')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      setFilteredUsers((prevFilteredUsers) =>
        prevFilteredUsers.filter((user) => user.id !== id)
      );

      alert("User deleted successfully.");
    } catch (err) {
      setError("Failed to delete user.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchItems(page);

  const handleCreate = () => navigate("create");

  return (
    <div className='app-users'>
      <h1>Manage Users</h1>

      <SearchBar
                searchTerm={searchTerm}
                onSearch={handleSearch}
                onRefresh={handleRefresh}
                onCreate={handleCreate}
      />

      {/* Show loading state */}
      {loading && <p>Loading users...</p>}

      {/* Show error state */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Display users */}
      {!loading && !error && filteredUsers.length > 0 ? (
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
                <th
                  onClick={() => handleSort("role")}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  Role {sortConfig.key === "role" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className='normal-column'>{user.id}</td>
                  <td className='normal-column'>{user.username}</td>
                  <td className='normal-column'>{user.role}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/appusers/view/${user.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/appusers/edit/${user.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteItem(user.id)}
                      title='Delete'
                      className='delete-button'
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        !loading && <p>No users found.</p>
      )}
    </div>
  );
};

export default AppUsers;
