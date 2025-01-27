import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import './EditRecommendedTag.css';
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';


const EditRecommendedTag = () => {
    const { id } = useParams();
    const [recommendedTag, setRecommendedTag] = useState("");
    const [status, setStatus] = useState("");
    const navigate = useNavigate();
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchRecommendedTagData = async () => {
            try {
                // Fetch venue category data from the database
                const { data: recommendedTagData, error: recommendedTagError } = await supabase
                    .from("recommended_tags")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (recommendedTagError) throw recommendedTagError;

                setRecommendedTag(recommendedTagData.tag_name);
                setStatus(recommendedTagData.status);
            } catch (error) {
                console.error("Error fetching recommended tag data:", error.message);
            }
        };

        fetchRecommendedTagData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { error: updateError } = await supabase
                .from("recommended_tags")
                .update({
                    tag_name: recommendedTag,
                    status: status,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            showToast("Recommended tag updated successfully.", "success");
            navigate("/admin/recommendedtags");
        } catch (error) {
            console.error("Error updating recommended tag:", error.message);
            showToast("Failed to update recommended tag.", "error");
        }
    };
 
    return (
        <div className="edit-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/recommendedtags" /> 
            <h2>Edit Recommended Tag</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Tag Name:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={recommendedTag}
                            onChange={(e) => setRecommendedTag(e.target.value)}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Status:</label>
                        <select
                            className="custom-select"
                            value={status}  
                            onChange={(e) => setStatus(e.target.value)} 
                        >
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>

                    <button type="submit" className="submit-btn">Submit</button>
                
                </div>
            </form>
        </div>
    );
};

export default EditRecommendedTag;
