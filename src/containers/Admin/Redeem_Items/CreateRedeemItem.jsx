import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './CreateRedeemItem.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const CreateRedeemItem = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        itemName: '',
        itemDescription: '',
        itemAmount: '',
        venueId: '',
    });
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('venues')
                    .select('id, venue_name');
                if (fetchError) throw fetchError;
                setVenues(data);
            } catch (err) {
                showToast(`Error fetching venues: ${err.message}`, 'error')
            }
        };

        fetchVenues();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: itemError } = await supabase
                .from('redeem_items')
                .insert([
                    {
                        item_name: formData.itemName,
                        item_description: formData.itemDescription,
                        amount: formData.itemAmount,
                        venue_id: formData.venueId, 
                        created_at: new Date().toISOString(),
                        modified_at: new Date().toISOString(),
                    },
                ]);

            if (itemError) throw itemError;

            showToast('Redeem item created successfully.', 'success')
            navigate('/admin/redeemitems');
        } catch (error) {
            showToast(`Failed to create redeem item: ${error.message}`, 'error')
            //setError();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/redeemitems" />   
            <h2>Create New Redeem Item</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label htmlFor="itemName">Item Name:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="itemName"
                            name="itemName"
                            value={formData.itemName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label htmlFor="categoryDescription">Item Description:</label>
                        <textarea
                            id="itemDescription"
                            name="itemDescription"
                            value={formData.itemDescription}
                            onChange={handleChange}
                            required
                            className="custom-textarea"
                        ></textarea>
                    </div>

                    <div className="field-container">
                        <label htmlFor="categoryName">Amount:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="itemAmount"
                            name="itemAmount"
                            value={formData.itemAmount}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label htmlFor="venueId">Venue:</label>
                        <select
                            id="venueId"
                            name="venueId"
                            value={formData.venueId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a Venue</option>
                            {venues.map((venue) => (
                                <option key={venue.id} value={venue.id}>
                                    {venue.venue_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="create-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRedeemItem;
