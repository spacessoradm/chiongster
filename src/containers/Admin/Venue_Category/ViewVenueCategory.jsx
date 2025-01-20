import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';

import BackButton from "../../../components/Button/BackButton";

const ViewVenueCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [venueCategory, setVenueCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);

    useEffect(() => {
        const fetchVenueCategoryDetails = async () => {
            setLoading(true);
            setError(null);
    
            try {
                const { data: venueCategoryData, error: venueCategoryDataError } = await supabase
                    .from("venue_category")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (venueCategoryDataError) throw venueCategoryDataError;
    
                setVenueCategory(venueCategoryData);
    
            } catch (err) {
                setError("Failed to fetch caetgory details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchVenueCategoryDetails();
    }, [id]);

    const deleteVenueCategory = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this category?");
        if (!confirmDelete) return;

        try {
            setLoading(true);

            const { error: venueCategoryError } = await supabase
                .from("venue_category")
                .delete()
                .eq("id", id);

            if (venueCategoryError) throw venueCategoryError;

            navigate("/admin/venuecategory"); // Redirect after deletion
        } catch (err) {
            setError("Failed to delete category.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <p>Loading category...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            {/* Back Button */}
            <BackButton />

            {/* Action Buttons */}
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            </div>
            <div className="edit-user-container">
            <div className="admin-content">
                <h2>Venue Category Details</h2>
                <form>
                    <div className="form-group">
                        <label>Venue Name:</label>
                        <input
                            type="text"
                            value={venueCategory.category_name}
                            disabled={isDisabled}
                        />
                    </div>

                    <div className="form-group">
                        <label>Venue Description:</label>
                        <input
                            type="text"
                            value={venueCategory.description}
                            disabled={isDisabled}
                        />
                    </div>

                    <div className="form-group">
                        <label>Created At:</label>
                        <input
                            type="text"
                            value={venueCategory.created_at}
                            disabled={isDisabled}
                        />
                    </div>

                </form>
            </div>
        </div>
        </div>
        
    );
};

export default ViewVenueCategory;
