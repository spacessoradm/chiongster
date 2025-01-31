import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './ViewRedeemItem.css';
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

const ViewRedeemItem = () => {
    const { id } = useParams();
    const [redeemItem, setRedeemItem] = useState(null);
    const [venueName, setVenueName] = useState('');
    const [loading, setLoading] = useState(true);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
            setToastInfo({ visible: true, message, type });
            setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchRedeemItemDetails = async () => {
            setLoading(true);
    
            try {
                const { data: redeemItemData, error: redeemItemDataError } = await supabase
                    .from("redeem_items")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (redeemItemDataError) throw redeemItemDataError;
    
                setRedeemItem(redeemItemData);

                const { data: venueData, error: venueDataError } = await supabase
                    .from("venues")
                    .select("venue_name")
                    .eq("id", redeemItemData.venue_id)

                if (venueDataError) throw venueDataError;

                setVenueName(venueData[0].venue_name);
    
            } catch (err) {
                showToast("Failed to fetch category details.", "error");
            } finally {
                setLoading(false);
            }
        };   
        fetchRedeemItemDetails();
    }, [id]);

    
    if (loading) return <p>Loading redeem item...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/redeemitems" />    
            <h2>Redeem Item Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <div className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Item Name:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            value={redeemItem.item_name}
                            readOnly
                        />
                    </div>
                    <div className="field-container">
                        <label>Description:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            value={redeemItem.item_description}
                            readOnly
                        />
                    </div>
                    <div className="field-container">
                        <label>Amount:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            value={redeemItem.amount}
                            readOnly
                        />
                    </div>
                    <div className="field-container">
                        <label>Venue:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            value={venueName}
                            readOnly
                        />
                    </div>
                    <div className="field-container">
                        <img
                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${redeemItem.pic_path}`}
                        style={{ width: "250px", height: "250px", objectFit: "cover" }}
                      />
                    </div>
                </div>
            </div>
        </div>
        
    );
};

export default ViewRedeemItem;
