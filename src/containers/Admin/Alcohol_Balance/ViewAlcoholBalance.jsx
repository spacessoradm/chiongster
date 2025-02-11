import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './ViewAlcoholBalance.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const ViewAlcoholBalance = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        alcohol_name: '',
        quantity: 0,
        venue_name: '',
        username: '',
        expiry_date: '',
        reminder: '',
        image_paths: [],
    });
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [venueRes, userRes, alcoholRes] = await Promise.all([
                    supabase.from("venues").select("id, venue_name"),
                    supabase.from("profiles").select("id, username"),
                    supabase.from("alcohol_balance").select("*").eq("id", id).single()
                ]);

                if (venueRes.error || userRes.error || alcoholRes.error) {
                    throw new Error("Error fetching initial data");
                }

                const venues = venueRes.data;
                const users = userRes.data;
                const alcohols = alcoholRes.data;

                // Merge alcohol data with venue name and username
                const mergedData = {
                    ...alcohols,
                    venue_name: venues.find((venue) => venue.id === alcohols.venue_id)?.venue_name || "Unknown Venue",
                    username: users.find((user) => user.id === alcohols.user_id)?.username || "Unknown User"
                };

                setFormData({
                    alcohol_name: mergedData.alcohol_name,
                    quantity: mergedData.quantity,
                    venue_name: mergedData.venue_name,
                    username: mergedData.username,
                    expiry_date: mergedData.expiry_date,
                    reminder: mergedData.reminder,
                    image_paths: mergedData.image_paths || [],
                });
            } catch (err) {
                showToast(`Error fetching data: ${err.message}`, 'error');
            }
        };

        fetchData();
    }, [id]);

    return (
        <div className="view-alcohol-balance-container" style={{ fontFamily: 'Courier New' }}>
            <BackButton to="/admin/alcoholbalance" />
            <h2>View Alcohol Balance</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Alcohol Name:</label>
                        <input
                            type="text"
                            value={formData.alcohol_name}
                            readOnly
                            className="enhanced-input"
                        />
                    </div>

                    <div className="field-container">
                        <label>Quantity:</label>
                        <input
                            type="number"
                            value={formData.quantity}
                            readOnly
                            className="enhanced-input"
                        />
                    </div>

                    <div className="field-container">
                        <label>Venue:</label>
                        <input
                            type="text"
                            value={formData.venue_name}
                            readOnly
                            className="enhanced-input"
                        />
                    </div>

                    <div className="field-container">
                        <label>User:</label>
                        <input
                            type="text"
                            value={formData.username}
                            readOnly
                            className="enhanced-input"
                        />
                    </div>

                    <div className="field-container">
                        <label>Expiry Date:</label>
                        <input
                            type="date"
                            value={formData.expiry_date}
                            readOnly
                            className="enhanced-input"
                        />
                    </div>

                    <div className="field-container">
                        <label>Reminder (Days):</label>
                        <input
                            type="text"
                            value={formData.reminder}
                            readOnly
                            className="enhanced-input"
                        />
                    </div>

                    {formData.image_paths.length > 0 && (
                        <div className="field-container">
                            <label>Current Image:</label>
                            <img
                                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/alcoholbalance/${formData.image_paths[0]}`}
                                alt="Alcohol"
                                className="enhanced-input"
                            />
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ViewAlcoholBalance;
