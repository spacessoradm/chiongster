import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './index.css';   
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';

const ViewVibe = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [vibe, setVibe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
            setToastInfo({ visible: true, message, type });
            setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchVibeDetails = async () => { 
            setLoading(true);
            setError(null);
    
            try {
                const { data: vibeData, error: vibeDataError } = await supabase
                    .from("vibe")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (vibeDataError) throw vibeDataError;
    
                setVibe(vibeData);
    
            } catch (err) {
                showToast("Failed to fetch vibe details.", "error");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchVibeDetails();
    }, [id]);
    
    if (loading) return <p>Loading vibe...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/vibe" />    
            <h2>Vibe Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form className="outsider">
                <div className="insider">

                    <PlainInput label="Vibe Name" value={vibe.vibe_name} readOnly />
                    <TextArea label="Vibe Description" value={vibe.description} readOnly />
                    <PlainInput label="Sequence in Menu" value={vibe.seq_in_menu} readOnly />
                    <PlainInput label="Created At" value={vibe.created_at} readOnly />

                </div>
                </form>
        </div>
        
    );
};

export default ViewVibe;
