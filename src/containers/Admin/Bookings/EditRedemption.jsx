import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import "./EditRedemption.css";
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const EditRedemption = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        redeemItem: [{ item_id: "", quantity: "", amount: "" }],
    });
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchRedeemItemData = async () => {
            try {
                const { data: bookingID, error: bookingError } = await supabase
                    .from("booking")
                    .select("venue_id")
                    .eq("id", id);

                const { data: venueItemList, error: venueItemListError } = await supabase
                    .from("venue_redeemitem")
                    .select("id, item_id, amount")
                    .eq("venue_id", bookingID[0].venue_id);
            
                const { data: itemName, error: itemNameError } = await supabase
                    .from("redeem_items")
                    .select("id, item_name");
    
                const mergedList = venueItemList.map(vItem => ({
                    value: vItem.item_id, 
                    label: itemName.find(i => i.id === vItem.item_id)?.item_name || "Unknown"
                }));
    
                setItems(mergedList);

                const { data: redemptionList, error: redemptionListError } = await supabase
                    .from("redemption")
                    .select("*")
                    .eq("booking_id", id);

                if (redemptionList.length > 0) {
                    setFormData({
                        redeemItem: redemptionList.map((item) => ({
                            item_id: item.item_name,
                            quantity: item.quantity,
                            amount: item.amount,
                        })),
                    });
                    console.log(formData);
                }
    
            } catch (error) {
                showToast("Error fetching redemption data", "error");
            }
        };

        fetchRedeemItemData();
    }, [id]);

    const handleRedeemItemChange = (index, field, value) => {
        setFormData((prev) => {
            const updatedRedeemItem = [...prev.redeemItem];
            updatedRedeemItem[index][field] = value;

            return { ...prev, redeemItem: updatedRedeemItem };
        });
    };

    const addRedeemItemGroup = () => {
        setFormData((prev) => ({
            ...prev,
            redeemItem: [
                ...prev.redeemItem,
                { item_id: "", amount: "" },
            ],
        }));
    };

    const removeRedeemItemGroup = (index) => {
        setFormData((prev) => ({
            ...prev,
            redeemItem: prev.redeemItem.filter((_, i) => i !== index),
        }));
    };

    const handleSaveRedeemItem = async () => {
        try {
            const deleteOldData = await supabase
                .from("redemption")
                .delete()
                .eq("booking_id", id);

            if (deleteOldData.error) throw deleteOldData.error;

            // Insert new menu data
            if (formData.redeemItem.length > 0) {
                const redemption = formData.redeemItem.map((item) => ({
                    booking_id: id,
                    item_name: item.item_id,
                    quantity: item.quantity,
                    amount: item.amount,
                    created_at: new Date().toISOString(),
                    modified_at: new Date().toISOString(),
                }));

                const { error } = await supabase.from("redemption").insert(redemption);
                if (error) throw error;
            }

            showToast("Redemption saved successfully", "success");
            navigate(`/admin/bookings/Edit/${id}`);
        } catch (error) {
            showToast("Error saving redemption", "error");
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/bookings" />
            <h2>Edit Venue Redemption</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <div style={{ marginTop: "20px" }}>
                {formData.redeemItem.map((groupRedeemItem, index) => (
                    <div key={index} className="enhanced-input">
                        <label>Item:</label>
                        <select
                            value={groupRedeemItem.item_id || ""}
                            onChange={(e) => handleRedeemItemChange(index, "item_id", e.target.value)}
                            className="enhanced-input"
                        >
                            <option value="">Select an item</option>
                            {items.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                        <label>Quantity:</label>
                        <input
                            type="text"
                            value={groupRedeemItem.quantity}
                            onChange={(e) =>
                                handleRedeemItemChange(index, "quantity", e.target.value)
                            }
                            className="enhanced-input"
                        />
                        <label>Amount:</label>
                        <input
                            type="text"
                            value={groupRedeemItem.amount}
                            onChange={(e) =>
                                handleRedeemItemChange(index, "amount", e.target.value)
                            }
                            className="enhanced-input"
                            readOnly
                        />
                        <button
                            onClick={() => removeRedeemItemGroup(index)}
                            style={{
                                background: "#f44336",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "5px 10px",
                                cursor: "pointer",
                                marginTop: "10px",
                                width: "15%",
                            }}
                        >
                            Remove Menu Group
                        </button>
                    </div>
                ))}
                <button
                    onClick={addRedeemItemGroup}
                    style={{
                        marginTop: "10px",
                        padding: "10px 20px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        width: "25%",
                    }}
                >
                    + Add Menu Group
                </button>
            </div>

            <button
                onClick={handleSaveRedeemItem}
                style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                }}
            >
                Save
            </button>
        </div>
    );
};

export default EditRedemption;
