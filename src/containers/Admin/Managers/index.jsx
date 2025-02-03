import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const Managers = () => {
  const navigate = useNavigate();

  const [managerProfiles, setManagerProfiles] = useState([]);
  const [filteredManagerProfiles, setFilteredManagerProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "username", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchManagerProfiles = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: managerProfilesData, error: managerProfilesError } = await supabase
        .from('manager_profiles')
        .select('*')
        .range(start, end);

      if (managerProfilesError) throw managerProfilesError;

      setManagerProfiles(managerProfilesData);
      setFilteredManagerProfiles(managerProfilesData);
      setTotalPages(Math.ceil(managerProfilesData.length / limit));
    } catch (error) {
      showToast("Failed to fetch manager profiles.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = managerProfiles.filter((managerprofile) =>
        managerprofile.username.toLowerCase().includes(term)
      );
      setFilteredManagerProfiles(filtered);
    } else {
      setFilteredManagerProfiles(managerProfiles);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchManagerProfiles(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchLanguages(newPage);
    }
  };

  useEffect(() => {
    fetchManagerProfiles(page);
  }, [page]);

  const handleRefresh = () => fetchManagerProfiles(page);

  const handleCreate = () => navigate("create");

  const deleteManagerProfiles = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this manager profile?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("manager_profiles")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setManagerProfiles((prevManagerProfiles) =>
        prevManagerProfiles.filter((managerprofile) => managerprofile.id !== id)
      );
      setFilteredManagerProfiles((prevFilteredManagerProfiles) =>
        prevFilteredManagerProfiles.filter((managerprofile) => managerprofile.id !== id)
      );

      showToast("Manager profile deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete manager profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Manager Module</p>
      <p className='subtitle-page'>Manage your manager profiles here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading manager profiles...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && !error && filteredManagerProfiles.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("username")}
                  className='sort-header'
                >
                  Username {sortConfig.key === "username" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'>email</th>
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
              {filteredManagerProfiles.map((managerprofile) => (
                <tr key={managerprofile.id}>
                  <td className='normal-column'>{managerprofile.id}</td>
                  <td className='normal-column'>{managerprofile.username}</td>
                  <td className='normal-column'>{managerprofile.email}</td>
                  <td className='normal-column'>{managerprofile.created_at}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/managers/view/${managerprofile.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/managers/edit/${managerprofile.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteManagerProfile(managerprofile.id)}
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
        !loading && <p>No managers found.</p>
      )}
    </div>
  );
};

export default Managers;
