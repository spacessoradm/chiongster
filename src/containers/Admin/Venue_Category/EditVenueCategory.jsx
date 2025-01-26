import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";


const EditVenueCategory = () => {
    const { id } = useParams();
    const [venueCategory, setVenueCategory] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVenueCategoryData = async () => {
            try {
                // Fetch venue category data from the database
                const { data: venueCategoryData, error: venueCategoryError } = await supabase
                    .from("venue_category")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (venueCategoryError) throw venueCategoryError;

                setVenueCategory(venueCategoryData);
                setName(venueCategoryData.category_name);
                setDescription(venueCategoryData.description);
            } catch (error) {
                console.error("Error fetching venue category data:", error.message);
            }
        };

        fetchVenueCategoryData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Name:", name);
        console.log("Description:", description);

        try {
            // Update venue category data in the database
            const { error: updateError } = await supabase
                .from("venue_category")
                .update({
                    category_name: name,
                    description: description,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            alert("Venue category updated successfully!");
            navigate("/admin/venuecategory");
        } catch (error) {
            console.error("Error updating venue category:", error.message);
            alert("Failed to update venue category.");
        }
    };

    return (
        <div className="edit-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <div className="admin-content">
                <h2>Edit Venue Category</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Category Name:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Category Description:</label>
                        <textarea
                            className="custom-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <button type="submit" className="submit-btn">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default EditVenueCategory;
