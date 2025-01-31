import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const Blogs = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "title", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchBlogs = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: blogsData, error: blogsDataError } = await supabase
        .from('blogs')
        .select('id, title, tags_id, created_at, image_path')
        .range(start, end);

      if (blogsDataError) throw blogsDataError;

      const { data: tagsData, error: tagsDataError } = await supabase
        .from('blog_tags')
        .select('id, tag_name');

      if (tagsDataError) throw tagsDataError;

      blogsData.forEach(blog => {
        const tag = tagsData.find(tag => tag.id === blog.tags_id);
        if (tag) {
          blog.tag_name = tag.tag_name;
        }
      });

      setBlogs(blogsData);
      setFilteredBlogs(blogsData);

      const { count } = await supabase
        .from('blogs')
        .select('id', { count: 'exact', head: true });

      setTotalPages(Math.ceil(count / limit));
    } catch (error) {
      showToast("Failed to fetch blogs.", "error");
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
      fetchBlogs(newPage);
    }
  };

  useEffect(() => {
    fetchBlogs(page);
  }, [page]);

  const handleRefresh = () => fetchItems(page);

  const handleCreate = () => navigate("create");

  const deleteBlog = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
      setFilteredBlogs((prevFilteredBlogs) =>
        prevFilteredBlogs.filter((blog) => blog.id !== id)
      );

      showToast("Blog deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete blog.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Blog Module</p>
      <p className='subtitle-page'>Manage app blogs here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && (
        <p className="loading-message">Loading blogs...</p>
      )}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && !error && filteredBlogs.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'> ID </th>
                <th className='normal-header'> Image </th>
                <th
                  onClick={() => handleSort("title")}
                  className='sort-header'
                >
                  Blog Title {sortConfig.key === "title" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'> Tags </th>
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
              {filteredBlogs.map((blog) => (
                <tr key={blog.id}>
                  <td className='normal-column'>{blog.id}</td>
                  <td className="normal-column">
                      <img
                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${blog.image_path}`}
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                      />
                  </td>
                  <td className='normal-column'>{blog.title}</td>
                  <td className='normal-column'>{blog.tags}</td>
                  <td className='normal-column'>{blog.created_at}</td>
                  <td className='action-column'>
                    
                    <FaTrashAlt 
                      onClick={() => deleteBlog(blog.id)}
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
        !loading && <p>No blogs found.</p>
      )}
    </div>
  );
};

export default Blogs;
