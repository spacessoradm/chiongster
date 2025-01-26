import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

const VenueCategory = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "category_name", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  const fetchCategories = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('venue_category')
        .select('id, category_name, description, created_at');

      if (categoriesError) throw categoriesError;

      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
      setTotalPages(Math.ceil(categoriesData.length / limit));
    } catch (error) {
      setError("Failed to fetch categories.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = categories.filter((category) =>
        category.category_name.toLowerCase().includes(term)
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
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
    fetchCategories(page);
  }, [page]);

  const deleteCategory = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('venue_category')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories((prevCategories) => prevCategories.filter((category) => category.id !== id));
      setFilteredCategories((prevFilteredCategories) =>
        prevFilteredCategories.filter((category) => category.id !== id)
      );

      alert("Category deleted successfully.");
    } catch (err) {
      setError("Failed to delete category.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='venue-category' style={{ fontFamily: "Courier New" }}>
      <h2>Manage Venue Categories</h2>
      <p></p>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", fontFamily: "Courier New" }}>
        <input
          type="text"
          placeholder="Search categories..."
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
          onClick={() => fetchCategories(page)}
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
          Create Category
        </button>
      </div>

      {loading && <p>Loading categories...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && filteredCategories.length > 0 ? (
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
                  onClick={() => handleSort("category_name")}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  Category Name {sortConfig.key === "category_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    textAlign: "left",
                  }}
                >
                  Description
                </th>
                <th
                  onClick={() => handleSort("created_at")}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  Created At {sortConfig.key === "created_at" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{category.id}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{category.category_name}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{category.description}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{category.created_at}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>
                    <button
                      onClick={() => navigate(`/admin/venuecategory/view/${category.id}`)}
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
                      onClick={() => navigate(`/admin/venuecategory/edit/${category.id}`)}
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
                      onClick={() => deleteCategory(category.id)}
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
        !loading && <p>No categories found.</p>
      )}
    </div>
  );
};

export default VenueCategory;
