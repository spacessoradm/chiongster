import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './ViewRecommendedTag.css';   
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

const ViewRecommendedTag = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [recommendedTag, setRecommendedTag] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
            setToastInfo({ visible: true, message, type });
            setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchRecommendedTagDetails = async () => { 
            setLoading(true);
            setError(null);
    
            try {
                const { data: recommendedTagData, error: recommendedTagDataError } = await supabase
                    .from("recommended_tags")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (recommendedTagDataError) throw recommendedTagDataError;
    
                setRecommendedTag(recommendedTagData);
    
            } catch (err) {
                showToast("Failed to fetch recommended tag details.", "error");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchRecommendedTagDetails();
    }, [id]);

    
    if (loading) return <p>Loading recommended tag...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/recommendedtags" />    
            <h2>Recommended Tag Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Tag Name:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={recommendedTag.tag_name}
                            disabled={isDisabled}
                        />
                    </div>
                    <div className="field-container">
                        <label>Status:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={recommendedTag.status}
                            disabled={isDisabled}
                        />
                    </div>
                    <div className="field-container">
                        <label>Created At:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={recommendedTag.created_at}
                            disabled={isDisabled}
                        />
                    </div>

                </div>
                </form>
        </div>
        
    );
};

export default ViewRecommendedTag;
