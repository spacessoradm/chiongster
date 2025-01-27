import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './ViewLanguage.css';   
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

const ViewLanguage = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [language, setLanguage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
            setToastInfo({ visible: true, message, type });
            setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchLanguageDetails = async () => { 
            setLoading(true);
            setError(null);
    
            try {
                const { data: languageData, error: languageDataError } = await supabase
                    .from("languages")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (languageDataError) throw languageDataError;
    
                setLanguage(languageData);
    
            } catch (err) {
                showToast("Failed to fetch language details.", "error");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchLanguageDetails();
    }, [id]);

    const deleteLanguage = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this language?");
        if (!confirmDelete) return;

        try {
            setLoading(true);

            const { error: languageError } = await supabase
                .from("languages")
                .delete()
                .eq("id", id);

            if (languageError) throw languageError;

            navigate("/admin/languages"); // Redirect after deletion
        } catch (err) {
            showToast("Failed to delete language.", "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <p>Loading language...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/languages" />    
            <h2>Language Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Language Name:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={language.language_name}
                            disabled={isDisabled}
                        />
                    </div>
                    <div className="field-container">
                        <label>Status:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={language.status}
                            disabled={isDisabled}
                        />
                    </div>
                    <div className="field-container">
                        <label>Created At:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={language.created_at}
                            disabled={isDisabled}
                        />
                    </div>

                </div>
                </form>
        </div>
        
    );
};

export default ViewLanguage;
