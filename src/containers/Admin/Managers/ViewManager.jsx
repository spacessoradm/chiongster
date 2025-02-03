import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './ViewManager.css';   
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

const ViewManager = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [managerProfile, setManagerProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
            setToastInfo({ visible: true, message, type });
            setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchManagerProfile = async () => { 
            setLoading(true);
            setError(null);
    
            try {
                const { data: managerData, error: managerDataError } = await supabase
                    .from("manager_profiles")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (managerDataError) throw managerDataError;
    
                setManagerProfile(managerData);
    
            } catch (err) {
                showToast("Failed to fetch manager profile details.", "error");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchManagerProfile();
    }, [id]);

    
    if (loading) return <p>Loading manager profile...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/managers" />    
            <h2>Manager Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form className="outsider">
            <div className="insider">
                    <div className="field-container">
                        <label>Username:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="username"
                            name="username"
                            value={managerProfile.username}
                            readOnly
                        />
                    </div>

                    <div className="field-container">
                        <label>First Name:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={managerProfile.first_name}
                            readOnly
                        />
                    </div>

                    <div className="field-container">
                        <label>Last Name:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={managerProfile.last_name}
                            readOnly
                            />
                    </div>

                    <div className="field-container">
                        <label>Email:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="email"
                            name="email"
                            value={managerProfile.email}
                            readOnly
                        />
                    </div>

                    <div className="field-container">
                        <label>Phone:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="phone"
                            name="phone"
                            value={managerProfile.phone}
                            readOnly
                        />
                    </div>

                    <div className="field-container">
                        <label>Status:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="status"
                            name="status"
                            value={managerProfile.status}
                            readOnly
                        />
                    </div>


                </div>
            </form>
        </div>
        
    );
};

export default ViewManager;
