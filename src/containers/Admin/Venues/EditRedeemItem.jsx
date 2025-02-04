import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import "./EditRedeemItem.css";
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const EditRedeemItem = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        redeemItem: [{ item_id: "", amount: "" }],
    });
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchRedeemItemData = async () => {
            try {
                const { data: redeemItemData, error } = await supabase
                    .from("venue_redeemitem")
                    .select("*")
                    .eq("venue_id", id);

                if (error) throw error;

                if (redeemItemData.length > 0) {
                    setFormData({
                        redeemItem: redeemItemData.map((item) => ({
                            item_id: item.item_id,
                            amount: item.amount,
                        })),
                    });
                }

                const { data: itemData, error: itemError } = await supabase
                    .from("redeem_items")
                    .select("*");
    
                if (itemError) throw itemError;

                console.log(itemData);
    
                setItems(itemData.map(item => ({ value: item.id, label: item.item_name })));

                console.log(items);
    
            } catch (error) {
                showToast("Error fetching redeem item data", "error");
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
                .from("venue_redeemitem")
                .delete()
                .eq("venue_id", id);

            if (deleteOldData.error) throw deleteOldData.error;

            // Insert new menu data
            if (formData.redeemItem.length > 0) {
                const venueRedeemItem = formData.redeemItem.map((item) => ({
                    venue_id: id,
                    item_id: item.item_id,
                    amount: item.amount,
                    created_at: new Date().toISOString(),
                    modified_at: new Date().toISOString(),
                }));

                const { error } = await supabase.from("venue_redeemitem").insert(venueRedeemItem);
                if (error) throw error;
            }

            showToast("Redeem Item saved successfully", "success");
            navigate(`/admin/venues/Edit/${id}`);
        } catch (error) {
            showToast("Error saving redeem item", "error");
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/venues" />
            <h2>Edit Venue Redeem Item</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <div style={{ marginTop: "20px" }}>
                {formData.redeemItem.map((groupRedeemItem, index) => (
                    <div key={index} className="enhanced-input">
                        <label>Item Name:</label>
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
                        <label>Amount:</label>
                        <input
                            type="text"
                            value={groupRedeemItem.amount}
                            onChange={(e) =>
                                handleRedeemItemChange(index, "amount", e.target.value)
                            }
                            className="enhanced-input"
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

export default EditRedeemItem;
