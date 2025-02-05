import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './EditAlcoholBalance.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import SingleSelect from '../../../components/Input/SingleSelect';
import FileUploader from '../../../components/Input/ImageUpload/FileUploader';

const EditAlcoholBalance = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        alcohol_name: '',
        quantity: 0,
        venue_id: '',
        user_id: '',
        expiry_date: '',
        reminder: '',
        image_paths: null,
    });
    const [venues, setVenues] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
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

                setVenues(venueRes.data.map(v => ({ value: v.id, label: v.venue_name })));
                setUsers(userRes.data.map(u => ({ value: u.id, label: u.username })));

                const alcoholData = alcoholRes.data;
                setFormData({
                    alcohol_name: alcoholData.alcohol_name,
                    quantity: alcoholData.quantity,
                    venue_id: alcoholData.venue_id,
                    user_id: alcoholData.user_id,
                    expiry_date: alcoholData.expiry_date,
                    reminder: alcoholData.reminder,
                    image_paths: alcoholData.image_paths || [],
                });
                setSelectedVenue(alcoholData.venue_id);
                setSelectedUser(alcoholData.user_id);
            } catch (err) {
                showToast(`Error fetching data: ${err.message}`, 'error');
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Delete old image if a new image is uploaded
            if (formData.image_paths && formData.image_paths.length > 0) {
                const { error: deleteError } = await supabase
                    .storage
                    .from('alcoholbalance')
                    .remove([formData.image_paths[0]]);

                if (deleteError) {
                    throw deleteError;
                }
            }

            const { error: itemError } = await supabase
                .from('alcohol_balance')
                .update({
                    alcohol_name: formData.alcohol_name,
                    quantity: formData.quantity,
                    venue_id: formData.venue_id,
                    user_id: formData.user_id,
                    expiry_date: formData.expiry_date,
                    reminder: formData.reminder,
                    image_paths: `{${formData.image_paths.join(",")}}`,
                    modified_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (itemError) throw itemError;

            showToast('Alcohol balance updated successfully.', 'success');
            navigate('/admin/alcoholbalance');
        } catch (error) {
            showToast(`Failed to update alcohol balance: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (url) => {
        setFormData((prev) => ({
            ...prev,
            image_paths: [url], // Ensure it's an array
        }));
    };

    return (
        <div className="edit-alcohol-balance-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/alcoholbalance" />
            <h2>Edit Alcohol Balance</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">

                    <PlainInput
                        label="Alcohol Name"
                        value={formData.alcohol_name}
                        onChange={(e) => setFormData({ ...formData, alcohol_name: e.target.value })}
                        required
                    />

                    <PlainInput
                        label="Quantity"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />

                    <div className="field-container">
                        <label>Venue:</label>
                        <select
                            value={formData.venue_id}
                            onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                            className="enhanced-input"
                        >
                            <option value="" className="enhanced-input">Select a venue</option>
                            {venues.map((venue) => (
                                <option key={venue.value} value={venue.value}>
                                    {venue.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="field-container">
                        <label>User:</label>
                        <select
                            value={formData.user_id}
                            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                            className="enhanced-input"
                        >
                            <option value="" className="enhanced-input">Select a user</option>
                            {users.map((user) => (
                                <option key={user.value} value={user.value}>
                                    {user.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <PlainInput
                        label="Expiry Date"
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                        required
                    />

                    <PlainInput
                        label="Reminder (Days)"
                        type="text"
                        value={formData.reminder}
                        onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
                        required
                    />

                    <FileUploader storageBucket="alcoholbalance" folder="alcoholbalance" onUpload={handleImageUpload} />

                    <button type="submit" className="edit-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditAlcoholBalance;
