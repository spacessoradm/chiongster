import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import './index.css';
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';


const EditVenueCategory = () => {
    const { id } = useParams();
    const [venueCategory, setVenueCategory] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [seqInMenu, setSeqInMenu] = useState("");
    const navigate = useNavigate();
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

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
                setSeqInMenu(venueCategoryData.seq_in_menu);
            } catch (error) {
                console.error("Error fetching venue category data:", error.message);
            }
        };

        fetchVenueCategoryData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Update venue category data in the database
            const { error: updateError } = await supabase
                .from("venue_category")
                .update({
                    category_name: name,
                    description: description,
                    seq_in_menu: seqInMenu,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            showToast("Venue category updated successfully.", "success");
            navigate("/admin/venuecategory");
        } catch (error) {
            console.error("Error updating venue category:", error.message);
            showToast("Failed to update venue category.", "error");
        }
    };
 
    return (
        <div className="edit-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/venuecategory" /> 
            <h2>Edit Venue Category</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">

                    <PlainInput 
                        label="Category Name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <TextArea 
                        label="Category Description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <PlainInput 
                        label="Seq in Menu"
                        name="seqInMenu"
                        value={seqInMenu}
                        onChange={(e) => setSeqInMenu(e.target.value)}
                    />

                    <button type="submit" className="submit-btn">Submit</button>
                
                </div>
            </form>
        </div>
    );
};

export default EditVenueCategory;
