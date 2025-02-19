import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './index.css';   
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

import PlainInput from '../../../components/Input/PlainInput';
import SingleSelect from '../../../components/Input/SingleSelect';

const ViewTier = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [tier, setTier] = useState("");
    const [loading, setLoading] = useState(true);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
            setToastInfo({ visible: true, message, type });
            setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchSingleTier = async () => { 
            setLoading(true);
    
            try {
                const { data: tierData, error: tierError } = await supabase
                    .from("tiers")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (tierError) throw tierError;
    
                setTier(tierData);
    
            } catch (err) {
                showToast("Failed to fetch tier details.", "error");
            } finally {
                setLoading(false);
            }
        };
    
        fetchSingleTier();
    }, [id]);
    
    if (loading) return <p>Loading tier...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/tiers" />    
            <h2>Tier Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form className="outsider">
                <div className="insider">

                    <PlainInput
                            label="Name:"
                            value={tier.name}
                            type="text"
                            readOnly
                    />
                    <PlainInput
                            label="Description:"
                            value={tier.description}
                            type="text"
                            readOnly
                    />
                    <PlainInput
                            label="Color Code:"
                            value={tier.color_code}
                            type="text"
                            readOnly
                    />
                    <SingleSelect
                            label="Status:"
                            options={[
                                { value: "enabled", label: "Enabled" },
                                { value: "disabled", label: "Disabled" },
                            ]}
                            selectedValue={tier.status}
                            readOnly
                    />

                </div>
            </form>
        </div>
        
    );
};

export default ViewTier;
