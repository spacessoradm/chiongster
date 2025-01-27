import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import './EditLanguage.css';
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';


const EditLanguage = () => {
    const { id } = useParams();
    const [language, setLanguage] = useState("");
    const [status, setStatus] = useState("");
    const navigate = useNavigate();
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchLanguageData = async () => {
            try {
                // Fetch venue category data from the database
                const { data: languageData, error: languageError } = await supabase
                    .from("languages")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (languageError) throw languageError;

                setLanguage(languageData.language_name);
                setStatus(languageData.status);
            } catch (error) {
                console.error("Error fetching language data:", error.message);
            }
        };

        fetchLanguageData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { error: updateError } = await supabase
                .from("languages")
                .update({
                    language_name: language,
                    status: status,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            showToast("Language updated successfully.", "success");
            navigate("/admin/languages");
        } catch (error) {
            console.error("Error updating language:", error.message);
            showToast("Failed to update language.", "error");
        }
    };
 
    return (
        <div className="edit-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/languages" /> 
            <h2>Edit Language</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Language Name:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
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

export default EditLanguage;
