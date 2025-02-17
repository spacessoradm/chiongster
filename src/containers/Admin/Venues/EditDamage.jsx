import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import "./index.css";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const EditDamage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        damage: [],
    });
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    // Fetch data from venue_damage table
    useEffect(() => {
        const fetchDamageData = async () => {
            try {
                const { data: damageData, error } = await supabase
                    .from("venue_damage")
                    .select("*")
                    .eq("venue_id", id);

                if (error) throw error;
                setFormData({ damage: damageData });
            } catch (error) {
                showToast("Error fetching damage data", "error");
                console.error("Error fetching damage data:", error.message);
            }
        };

        fetchDamageData();
    }, [id]);

    const handleSaveVenueDamage = async () => {
        try {
            // Start a transaction to delete old data and insert new data
            const deleteOldData = await supabase
                .from("venue_damage")
                .delete()
                .eq("venue_id", id);
    
            if (deleteOldData.error) throw deleteOldData.error;
    
            // Prepare the new data for insertion
            if (formData.damage.length > 0) {
                const venueDamages = formData.damage.map((group) => ({
                    venue_id: id,
                    title: group.title,
                    pax: group.pax,
                    min_spend: group.min_spend,
                    amenities: group.amenities,
                    happy_hours: group.happy_hours,
                    night_hours: group.night_hours,
                    morning_hours: group.morning_hours,
                    created_at: group.created_at || new Date().toISOString(),
                    modified_at: new Date().toISOString(),
                }));
    
                const { error } = await supabase.from("venue_damage").insert(venueDamages);
                if (error) throw error;
            }
    
            showToast("Damage data saved successfully", "success");
            navigate(`/admin/venues/Edit/${id}`);
        } catch (error) {
            showToast("Error saving venue damage", "error");
            console.error("Error saving venue damage:", error.message);
        }
    };
    

    const handleDamageChange = (index, field, value) => {
        setFormData((prev) => {
            const updatedDamage = [...prev.damage];
            updatedDamage[index][field] = value;
            return { ...prev, damage: updatedDamage };
        });
    };

    const addDamageGroup = () => {
        setFormData((prev) => ({
            ...prev,
            damage: [
                ...prev.damage,
                {
                    title: "",
                    pax: "",
                    min_spend: "",
                    amenities: "",
                    happy_hours: "",
                    night_hours: "",
                    morning_hours: "",
                },
            ],
        }));
    };

    const removeDamageGroup = (index) => {
        setFormData((prev) => ({
            ...prev,
            damage: prev.damage.filter((_, i) => i !== index),
        }));
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to={`/admin/venues/Edit/${id}`} />
            <h2>Edit Venue Damage</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <div>
                <h2>Damage Details</h2>
                {formData.damage.map((group, index) => (
                    <div key={index} className="enhanced-input">
                        <label>Title:</label>
                        <input
                            type="text"
                            value={group.title}
                            onChange={(e) =>
                                handleDamageChange(index, "title", e.target.value)
                            }
                            className="enhanced-input"
                        />

                        <label>Number of Pax:</label>
                        <input
                            type="text"
                            value={group.pax}
                            onChange={(e) =>
                                handleDamageChange(index, "pax", e.target.value)
                            }
                            className="enhanced-input"
                        />

                        <label>Min Spend:</label>
                        <input
                            type="text"
                            value={group.min_spend}
                            onChange={(e) =>
                                handleDamageChange(index, "min_spend", e.target.value)
                            }
                            className="enhanced-input"
                        />

                        <label>Amenities:</label>
                        <textarea
                            value={group.amenities}
                            onChange={(e) =>
                                handleDamageChange(index, "amenities", e.target.value)
                            }
                            className="enhanced-input"
                        />

                        <label>Happy Hours:</label>
                        <input
                            type="text"
                            value={group.happy_hours}
                            onChange={(e) =>
                                handleDamageChange(index, "happy_hours", e.target.value)
                            }
                            className="enhanced-input"
                        />

                        <label>Night Hours:</label>
                        <input
                            type="text"
                            value={group.night_hours}
                            onChange={(e) =>
                                handleDamageChange(index, "night_hours", e.target.value)
                            }
                            className="enhanced-input"
                        />

                        <label>Morning Hours:</label>
                        <input
                            type="text"
                            value={group.morning_hours}
                            onChange={(e) =>
                                handleDamageChange(index, "morning_hours", e.target.value)
                            }
                            className="enhanced-input"
                        />

                        <FaMinusCircle
                            size={50}  
                            onClick={() => removeDamageGroup(index)}
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
                    onClick={addDamageGroup}
                    style={{
                        cursor: "pointer",
                        color: "#4CAF50",
                        margin: "15px",
                        }}
                />
            </div>

            <button
                onClick={handleSaveVenueDamage}
                className="save-button"
            >
                Save
            </button>
        </div>
    );
};

export default EditDamage;
