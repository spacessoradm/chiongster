import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../config/supabaseClient";
import { FaEye, FaEdit, FaFileImage, FaGripVertical, FaTrashAlt } from "react-icons/fa";

import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const Venues = () => {
    const navigate = useNavigate();
    
    const [venues, setVenues] = useState([]);
    const [filteredVenues, setFilteredVenues] = useState([]); // For filtered data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // For search functionality
    const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" }); // Default sorting
    const [page, setPage] = useState(1); // Current page
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };


    // Fetch recipes from Supabase
    const fetchVenues = async (pageNumber = 1) => {
        setLoading(true);
        setError(null); // Reset error state before fetching
        try {
            const start = (pageNumber - 1) * limit;
            const end = start + limit - 1;
          
            const { data: venuesData, error: venuesDataError } = await supabase
                  .from('venues')
                  .select('id, address,venue_name, pic_path, venue_category_id, created_at')
                  .range(start, end);
          
            if (venuesDataError) throw venuesDataError;
          
            const { data: venueCategoryData, error: venueCategoryDataError } = await supabase
                .from('venue_category')
                .select('id, category_name')
          
            if (venueCategoryDataError) throw venueCategoryDataError;
        
          
            venuesData.forEach(venue => {
                  const venueCategory = venueCategoryData.find(venueCategory => venueCategory.id === venue.venue_category_id);
                  if (venueCategory) {
                    venue.venue_category_name = venueCategory.category_name;
                  }
                });

            if (error) throw error;

            setVenues(venuesData);
            setFilteredVenues(venuesData);

            console.log(venuesData);

            setToastInfo({ visible: true, message: 'Data fetched successfully', type: 'success' });

            const { count } = await supabase
                .from('venues')
                .select('id', { count: 'exact', head: true });

            setTotalPages(Math.ceil(count / limit));
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

    const handleRefresh = () => fetchVenues(page);

    const handleCreate = () => navigate("create");

    const deleteVenue = async (id, imagePath) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this venue?");
        if (!confirmDelete) return;
    
        try {
            setLoading(true);
    
            // Step 1: Delete the image from Supabase Storage
            const { error: storageError } = await supabase.storage
                .from("venue-main")
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
        <div className='whole-page'>
            <p className='title-page'>Venues Module</p>
            <p className='subtitle-page'>Manage your venues here.</p>

            <SearchBar
                searchTerm={searchTerm}
                onSearch={handleSearch}
                onRefresh={handleRefresh}
                onCreate={handleCreate}
            />

            {loading && (
                <p className="loading-message">Loading items...</p>
            )}

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            {/* Display venues */}
            {!loading && !error && filteredVenues.length > 0 ? (
                <>
                    <table className="table-container">
                        <thead>
                            <tr className="header-row">
                                <th
                                    onClick={() => handleSort("id")}
                                    className='sort-header'
                                >
                                    ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </th>
                                <th
                                    onClick={() => handleSort("venue_name")}
                                    className='sort-header'
                                >
                                    Venue Name {sortConfig.key === "venue_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </th>
                                <th
                                    onClick={() => handleSort("address")}
                                    className='sort-header'
                                >
                                    Address {sortConfig.key === "address" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </th>
                                <th
                                    onClick={() => handleSort("venue_category_name")}
                                    className='sort-header'
                                >
                                    Category {sortConfig.key === "venue_category_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </th>
                                <th
                                    onClick={() => handleSort("created_at")}
                                    className='sort-header'
                                >
                                    Created At {sortConfig.key === "created_at" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </th>
                                <th className='normal-header'>Image</th>
                                <th className='normal-header'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVenues.map((venue) => (
                                <tr key={venue.id}>
                                    <td className="normal-column">{venue.id}</td>
                                    <td className="normal-column">{venue.venue_name}</td>
                                    <td className="normal-column">{venue.address}</td>
                                    <td className="normal-column">{venue.venue_category_name}</td>
                                    <td className="normal-column">{new Date(venue.created_at).toLocaleString()}</td>
                                    <td className="normal-column">
                                        <img
                                            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${venue.pic_path}`}
                                            alt={venue.name}
                                            style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                        />
                                    </td>
                                    <td className='action-column'>
                                        <FaFileImage 
                                        onClick={() => navigate(`/admin/venues/create/${venue.id}`)}
                                        title='Gallery'
                                        className='create-button'
                                        />

                                        <FaGripVertical 
                                        onClick={() => navigate(`/admin/venues/addpromotion/${venue.id}`)}
                                        title='Promotion'
                                        className='create-button'
                                        />
                                        
                                        <FaTrashAlt 
                                        onClick={() => deleteVenue(venue.id)}
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
                !loading && <p>No venues found.</p>
            )}
        </div>
    );
};

export default Venues;
