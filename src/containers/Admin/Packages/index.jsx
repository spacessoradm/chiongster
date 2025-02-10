import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const Packages = () => {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "package_name", direction: "asc" });
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

      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .range(start, end);

      if (packagesError) throw packagesError;

      setPackages(packagesData);
      setFilteredPackages(packagesData);
      setTotalPages(Math.ceil(packagesData.length / limit));
    } catch (error) {
      showToast("Failed to fetch packages.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = packages.filter((packages) =>
        packages.package_name.toLowerCase().includes(term)
      );
      setFilteredPackages(filtered);
    } else {
      setFilteredPackages(packages);
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

  const deletePackage = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this package?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPackages((prevPackages) => prevPackages.filter((packages) => packages.id !== id));
      setFilteredPackages((prevFilteredPackages) =>
        prevFilteredPackages.filter((packages) => packages.id !== id)
      );

      showToast("Package deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete package.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Packages Module</p>
      <p className='subtitle-page'>Manage your packages here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading packages...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && filteredPackages.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("package_name")}
                  className='sort-header'
                >
                  Package Name {sortConfig.key === "package_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
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
              {filteredPackages.map((packages) => (
                <tr key={packages.id}>
                  <td className='normal-column'>{packages.id}</td>
                  <td className='normal-column'>{packages.package_name}</td>
                  <td className='normal-column'>{packages.status}</td>
                  <td className='normal-column'>{new Date(packages.created_at).toLocaleString()}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/packages/view/${packages.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/packages/edit/${packages.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deletePackage(packages.id)}
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
        !loading && <p>No packages found.</p>
      )}
    </div>
  );
};

export default Packages;
