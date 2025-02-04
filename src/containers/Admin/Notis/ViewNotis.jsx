import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './ViewNotis.css';   
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';
import SingleSelect from '../../../components/Input/SingleSelect';

const ViewNotis = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [notis, setNotis] = useState("");
    const [loading, setLoading] = useState(true);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
            setToastInfo({ visible: true, message, type });
            setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchNotisDetails = async () => { 
            setLoading(true);
    
            try {
                const { data: notisData, error: notisDataError } = await supabase
                    .from("notis")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (notisDataError) throw notisDataError;
    
                setNotis(notisData);
    
            } catch (err) {
                showToast("Failed to fetch notis details.", "error");
            } finally {
                setLoading(false);
            }
        };
    
        fetchNotisDetails();
    }, [id]);
    
    if (loading) return <p>Loading notis...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/notis" />    
            <h2>Notis Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form className="outsider">
                <div className="insider">

                <PlainInput
                        label="Notis Name:"
                        value={notis.notis_name}
                        type="text"
                        readOnly
                    />
                    <TextArea
                        label="Description:"
                        value={notis.notis_description}
                        rows={20}
                        readOnly
                    />
                    <SingleSelect
                        label="Status:"
                        options={[
                            { value: "enabled", label: "Enabled" },
                            { value: "disabled", label: "Disabled" },
                        ]}
                        selectedValue={notis.status}
                        readOnly
                    />

                </div>
                </form>
        </div>
        
    );
};

export default ViewNotis;
