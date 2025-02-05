import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './CreateAlcoholBalance.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import SingleSelect from '../../../components/Input/SingleSelect';
import FileUploader from '../../../components/Input/ImageUpload/FileUploader';

const CreateAlcoholBalance = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        alcohol_name: '',
        quantity: 0,
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
        const fetchVenues = async () => {
            try {

                const [venueRes, userRes] = await Promise.all([
                    supabase.from("venues").select("id, venue_name"),
                    supabase.from("profiles").select("id, username")
                ]);
    
                if (venueRes.error || userRes.error) {
                    throw new Error("Error fetching initial data");
                }
    
                setVenues(venueRes.data.map(v => ({ value: v.id, label: v.venue_name })));
                setUsers(userRes.data.map(u => ({ value: u.id, label: u.username })));
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

        try {
            const { error: itemError } = await supabase
                .from('alcohol_balance')
                .insert([
                    {
                        alcohol_name: formData.alcohol_name,
                        quantity: formData.quantity,
                        venue_id: selectedVenue,
                        user_id: selectedUser,
                        expiry_date: formData.expiry_date,
                        reminder: formData.reminder,
                        image_paths: `{${formData.image_paths.join(",")}}`, 
                        created_at: new Date().toISOString(),
                        modified_at: new Date().toISOString(),
                    },
                ]);

            if (itemError) throw itemError;

            showToast('Alcohol balance created successfully.', 'success')
            navigate('/admin/alcoholbalance');
        } catch (error) {
            showToast(`Failed to create alcohol balance: ${error.message}`, 'error')
            //setError();
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (event) => {
        setSelectedVenue(event.target.value);
        console.log("Selected Venue:", event.target.value); // Debugging
    };

    const handleImageUpload = (url) => {
        setFormData((prev) => ({
            ...prev,
            image_paths: [url], // Ensure it's an array
        }));
    };

    return (
        <div className="create-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/alcoholbalances" />   
            <h2>Create New Alcohol Balance</h2> 

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

                    <SingleSelect
                        label="Venue"
                        options={venues}
                        value={selectedVenue}
                        onChange={setSelectedVenue}
                    />

                    <SingleSelect
                        label="User"
                        options={users}
                        value={selectedUser}
                        onChange={setSelectedUser}
                    />

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

                    <button type="submit" className="create-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateAlcoholBalance;
