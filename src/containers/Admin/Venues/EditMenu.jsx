import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import "./index.css";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const EditMenu = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        menu: [{ item_name: "", item_description: "", original_price: "" }],
    });
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const { data: menuData, error } = await supabase
                    .from("venue_menu")
                    .select("*")
                    .eq("venue_id", id);

                if (error) throw error;

                if (menuData.length > 0) {
                    setFormData({
                        menu: menuData.map((item) => ({
                            item_name: item.item_name,
                            item_description: item.item_description,
                            original_price: item.original_price,
                        })),
                    });
                }
            } catch (error) {
                showToast("Error fetching menu data", "error");
                console.error("Error fetching menu data:", error.message);
            }
        };

        fetchMenuData();
    }, [id]);

    const handleMenuChange = (index, field, value) => {
        setFormData((prev) => {
            const updatedMenu = [...prev.menu];
            updatedMenu[index][field] = value;
            return { ...prev, menu: updatedMenu };
        });
    };

    const addMenuGroup = () => {
        setFormData((prev) => ({
            ...prev,
            menu: [
                ...prev.menu,
                { item_name: "", item_description: "", original_price: "" },
            ],
        }));
    };

    const removeMenuGroup = (index) => {
        setFormData((prev) => ({
            ...prev,
            menu: prev.menu.filter((_, i) => i !== index),
        }));
    };

    const handleSaveMenu = async () => {
        try {
            // Delete existing menu data
            const deleteOldData = await supabase
                .from("venue_menu")
                .delete()
                .eq("venue_id", id);

            if (deleteOldData.error) throw deleteOldData.error;

            // Insert new menu data
            if (formData.menu.length > 0) {
                const venueMenu = formData.menu.map((item) => ({
                    venue_id: id,
                    item_name: item.item_name,
                    item_description: item.item_description,
                    original_price: item.original_price ? Number(item.original_price) : null,
                    created_at: new Date().toISOString(),
                    modified_at: new Date().toISOString(),
                }));

                const { error } = await supabase.from("venue_menu").insert(venueMenu);
                if (error) throw error;
            }

            showToast("Menu saved successfully", "success");
            navigate(`/admin/venues/Edit/${id}`);
        } catch (error) {
            showToast("Error saving menu", "error");
            console.error("Error saving menu:", error.message);
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/venues" />
            <h2>Edit Venue Menu</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <div style={{ marginTop: "20px" }}>
                {formData.menu.map((groupMenu, index) => (
                    <div key={index} className="enhanced-input">
                        <label>Item Name:</label>
                        <input
                            type="text"
                            value={groupMenu.item_name}
                            onChange={(e) =>
                                handleMenuChange(index, "item_name", e.target.value)
                            }
                            className="enhanced-input"
                        />
                        <label>Item Description:</label>
                        <input
                            type="text"
                            value={groupMenu.item_description}
                            onChange={(e) =>
                                handleMenuChange(index, "item_description", e.target.value)
                            }
                            className="enhanced-input"
                        />
                        <label>Amount:</label>
                        <input
                            type="text"
                            value={groupMenu.original_price}
                            onChange={(e) =>
                                handleMenuChange(index, "original_price", e.target.value)
                            }
                            className="enhanced-input"
                        />
                        <FaMinusCircle
                            size={50}  
                            onClick={() => removeMenuGroup(index)}
                            style={{
                            cursor: "pointer",
                            color: "#f44336",
                            margin: "15px",
                            }}
                        />
                    </div>
                ))}
                <FaPlusCircle
                    size={50}  
                    onClick={addMenuGroup}
                    style={{
                        cursor: "pointer",
                        color: "#4CAF50",
                        margin: "15px",
                        }}
                />
            </div>

            <button
                onClick={handleSaveMenu}
                className="save-button"
            >
                Save
            </button>
        </div>
    );
};

export default EditMenu;
