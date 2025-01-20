import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

const Venues = () => {
    const navigate = useNavigate();
    
    const [venues, setVenues] = useState([]);
    const [filteredVenues, setFilteredVenues] = useState([]); // For filtered data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // For search functionality
    const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" }); // Default sorting
    const [page, setPage] = useState(1); // Current page
    const [totalPages, setTotalPages] = useState(1); // Total pages

    const limit = 10; // Number of venues per page

    // Fetch recipes from Supabase
    const fetchVenues = async (pageNumber = 1) => {
        setLoading(true);
        setError(null); // Reset error state before fetching
        try {
            const start = (pageNumber - 1) * limit;
            const end = start + limit - 1;

            const { data, count, error } = await supabase
                .from("venues") // Ensure this matches your Supabase table name
                .select("*", { count: "exact" }) // Include count to calculate total pages
                .order(sortConfig.key, { ascending: sortConfig.direction === "asc" })
                .range(start, end); // Paginate results

            if (error) throw error;

            setVenues(data);
            setFilteredVenues(data); // Initialize filtered data
            setTotalPages(Math.ceil(count / limit)); // Calculate total pages
        } catch (err) {
            setError("Failed to fetch venues.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle search functionality
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (term) {
            const filtered = venues.filter((venue) =>
                venue.venue_name.toLowerCase().includes(term)
            );
            setFilteredVenues(filtered);
        } else {
            setFilteredVenues(venues); // Reset to full list if no search term
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
        fetchVenues(page);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
            fetchVenues(newPage);
        }
    };

    // Fetch data on component mount and when page changes
    useEffect(() => {
        fetchVenues(page);
    }, [page]);

    const deleteVenues = async () => {}

    const deleteVenue = async (id, imagePath) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this venue?");
        if (!confirmDelete) return;
    
        try {
            setLoading(true);
    
            // Step 1: Delete the image from Supabase Storage
            const { error: storageError } = await supabase.storage
                .from("venue-main") // Replace with your actual bucket name
                .remove([imagePath]); // Pass the path to the file
    
            if (storageError) {
                console.error("Failed to delete image:", storageError);
                setError("Failed to delete venue image.");
                return;
            }
    
            // Step 2: Delete the recipe from the database
            const { error } = await supabase
                .from("venues") // Ensure this matches your Supabase table name
                .delete()
                .eq("id", id);
    
            if (error) throw error;
    
            // Update the recipes state to remove the deleted recipe
            setVenues((prevVenues) => prevVenues.filter((venue) => venue.id !== id));
            setFilteredVenues((prevFilteredVenues) =>
                prevFilteredVenues.filter((venue) => venue.id !== id)
            );
    
            alert("Venue and image deleted successfully.");
        } catch (err) {
            setError("Failed to delete venue.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <h1 style={{ color: "#333" }}>Manage Venues</h1>

            {/* Search and Refresh */}
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
                <input
                    type="text"
                    placeholder="Search venues..."
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
                    onClick={() => fetchVenues(page)}
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
                    onClick={() => navigate("create")} // Navigate to the create page
                    style={{
                        padding: "10px 20px",
                        borderRadius: "4px",
                        border: "none",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        cursor: "pointer",
                    }}
                >
                    Create Venue
                </button>
            </div>

            {/* Show loading state */}
            {loading && <p>Loading venues...</p>}

            {/* Show error state */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Display venues */}
            {!loading && !error && filteredVenues.length > 0 ? (
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
                                <th
                                    onClick={() => handleSort("id")}
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "10px",
                                        textAlign: "left",
                                        cursor: "pointer",
                                    }}
                                >
                                    ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </th>
                                <th
                                    onClick={() => handleSort("venue_name")}
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "10px",
                                        textAlign: "left",
                                        cursor: "pointer",
                                    }}
                                >
                                    Venue Name {sortConfig.key === "venue_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </th>
                                <th
                                    onClick={() => handleSort("address")}
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "10px",
                                        textAlign: "left",
                                        cursor: "pointer",
                                    }}
                                >
                                    Address {sortConfig.key === "address" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </th>
                                <th
                                    onClick={() => handleSort("venue_category")}
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "10px",
                                        textAlign: "left",
                                        cursor: "pointer",
                                    }}
                                >
                                    Category {sortConfig.key === "venue_category" && (sortConfig.direction === "asc" ? "↑" : "↓")}
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
                                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Image</th>
                                <th style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVenues.map((venue) => (
                                <tr key={venue.id}>
                                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>{venue.id}</td>
                                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>{venue.venue_name}</td>
                                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>{venue.address}</td>
                                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>{venue.prep_time}</td>
                                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>{new Date(venue.created_at).toLocaleString()}</td>
                                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                                        <img
                                            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${venue.pic_path}`}
                                            alt={venue.name}
                                            style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                        />
                                    </td>
                                    <td
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "10px",
                                            textAlign: "center",
                                        }}
                                    >

                                        <button
                                            onClick={() => navigate(``)} // Navigate to the detail page
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
                                            onClick={() => navigate(``)} // Navigate to the edit page
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
                                            onClick={() => deleteVenues()}
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
                !loading && <p>No venues found.</p>
            )}
        </div>
    );
};

export default Venues;
