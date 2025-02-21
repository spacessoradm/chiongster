import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import './index.css';
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

const EditRecommendedTag = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [recommendedTag, setRecommendedTag] = useState("");
    const [status, setStatus] = useState("");
    const [sequence, setSequence] = useState("");  
    const [iconPath, setIconPath] = useState("");  
    const [newIcon, setNewIcon] = useState(null);  
    const [previewImage, setPreviewImage] = useState(null);
    
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchRecommendedTagData = async () => {
            try {
                const { data, error } = await supabase
                    .from("recommended_tags")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;

                setRecommendedTag(data.tag_name);
                setStatus(data.status);
                setSequence(data.sequence_in_homepage);
                setIconPath(data.icon_url);
            } catch (error) {
                console.error("Error fetching recommended tag data:", error.message);
            }
        };

        fetchRecommendedTagData();
    }, [id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewIcon(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const deleteOldImage = async (oldPath) => {
        if (oldPath) {
            const { error } = await supabase.storage.from('icons').remove([oldPath]);
            if (error) {
                console.error("Error deleting old image:", error.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let uploadedIconPath = iconPath;

            if (newIcon) {
                if (iconPath) {
                    await deleteOldImage(iconPath);  // Delete old image first
                }

                const fileExt = newIcon.name.split('.').pop();
                const fileName = `${id}.${fileExt}`;
                const filePath = `recommended_tags/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('icons')
                    .upload(filePath, newIcon, { upsert: true });

                if (uploadError) throw uploadError;
                
                uploadedIconPath = filePath;
            }

            const { error: updateError } = await supabase
                .from("recommended_tags")
                .update({
                    tag_name: recommendedTag,
                    status,
                    seq_in_homepage: sequence,
                    icon_url: uploadedIconPath,
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
                            className="enhanced-input"
                            value={status}  
                            onChange={(e) => setStatus(e.target.value)} 
                        >
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>

                    <div className="field-container">
                        <label>Sequence in Homepage:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={sequence}
                            onChange={(e) => setSequence(e.target.value)}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Icon Upload:</label>
                        <input
                            className="enhanced-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>

                    {iconPath && !previewImage && (
                        <div>
                            <p>Current Icon:</p>
                            <img
                                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/icons/${iconPath}`}
                                style={{ width: "300px", maxWidth: "100%" }}
                            />
                        </div>
                    )}

                    {previewImage && (
                        <div>
                            <p>New Icon Preview:</p>
                            <img
                                src={previewImage}
                                alt="Preview"
                                style={{ width: "300px", maxWidth: "100%" }}
                            />
                        </div>
                    )}

                    <button type="submit" className="submit-btn">Submit</button>
                </div>
            </form>
        </div>
    );
};

export default EditRecommendedTag;
