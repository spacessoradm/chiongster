import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const RecommendedTags = () => {
  const navigate = useNavigate();

  const [recommendedTags, setRecommendedTags] = useState([]);
  const [filteredRecommendedTags, setFilteredRecommendedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "tag_name", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchRecommendedTags = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: recommendedTagsData, error: recommendedTagsError } = await supabase
        .from('recommended_tags')
        .select('*')
        .range(start, end);

      if (recommendedTagsError) throw recommendedTagsError;

      setRecommendedTags(recommendedTagsData);
      setFilteredRecommendedTags(recommendedTagsData);
      setTotalPages(Math.ceil(recommendedTagsData.length / limit));
    } catch (error) {
      showToast("Failed to fetch recommended tags.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = recommendedTags.filter((recommendedTag) =>
        recommendedTag.tag_name.toLowerCase().includes(term)
      );
      setFilteredRecommendedTags(filtered);
    } else {
      setFilteredRecommendedTags(recommendedTags);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchRecommendedTags(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchRecommendedTags(newPage);
    }
  };

  useEffect(() => {
    fetchRecommendedTags(page);
  }, [page]);

  const handleRefresh = () => fetchRecommendedTags(page);

  const handleCreate = () => navigate("create");

  const deleteRecommendedTag = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this recommended tag?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('recommended_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRecommendedTags((prevRecommendedTags) => prevRecommendedTags.filter((recommendedTag) => recommendedTag.id !== id));
      setFilteredRecommendedTags((prevFilteredRecommendedTags) =>
        prevFilteredRecommendedTags.filter((recommendedTag) => recommendedTag.id !== id)
      );

      showToast("Recommended tag deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete recommended tag.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Recommended Tags Module</p>
      <p className='subtitle-page'>Manage your recommended tags here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading recommended tags...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && !error && filteredRecommendedTags.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("tag_name")}
                  className='sort-header'
                >
                  Tag Name {sortConfig.key === "tag_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
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
              {filteredRecommendedTags.map((recommendedTag) => (
                <tr key={recommendedTag.id}>
                  <td className='normal-column'>{recommendedTag.id}</td>
                  <td className='normal-column'>{recommendedTag.tag_name}</td>
                  <td className='normal-column'>{recommendedTag.status}</td>
                  <td className='normal-column'>{recommendedTag.created_at}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/recommendedtags/view/${recommendedTag.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/recommendedtags/edit/${recommendedTag.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteRecommendedTag(recommendedTag.id)}
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
        !loading && <p>No recommended tags found.</p>
      )}
    </div>
  );
};

export default RecommendedTags;
