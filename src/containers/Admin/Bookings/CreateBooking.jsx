import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import './CreateBooking.css';

const CreateBooking = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState("");
    const [venueId, setVenueId] = useState(null);
    const [checkinDate, setCheckinDate] = useState("");
    const [pax, setPax] = useState("");
    const [roomNo, setRoomNo] = useState("");
    const [manager, setManager] = useState("");
    const [notes, setNotes] = useState("");
    const [venues, setVenues] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDropdownData = async () => {
            const { data: venueData, error: venueError } = await supabase
                .from("venues")
                .select("id, venue_name");

            const { data: userData, error: userError } = await supabase
                .from("profiles")
                .select("id, username");

            if (venueError || userError) {
                console.error("Error fetching dropdown data:", venueError || userError);
            } else {
                setVenues(venueData || []);
                setUsers(userData || []);
            }
        };

        fetchDropdownData();
    }, []);

    const handleUserChange = (selectedUserId) => {
        setUserId(selectedUserId);
    };

    const handleVenueChange = async (selectedVenueId) => {
        setVenueId(selectedVenueId);
        console.log(selectedVenueId);
    };

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

        const generateBookingCode = () => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 8; i++) { // Generate an 8-character code
                code += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return code;
        };
        
        // Inserting into Supabase
        const bookingUniqueCode = generateBookingCode();

        try {
            const { error: bookingError } = await supabase
                .from('booking')
                .insert([
                    {
                        venue_id: venueId,
                        user_id: userId,
                        preferred_date: checkinDate,
                        pax: pax,
                        room_no: roomNo,
                        manager: manager,
                        notes: notes,
                        booking_unique_code: bookingUniqueCode,
                        created_at: new Date().toISOString(),
                        modified_at: new Date().toISOString(),
                    },
                ]);

            if (bookingError) throw bookingError;

            // Navigate back to the venue categories list after successful creation
            navigate('/admin/bookings');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-venue-category-container">
            <div className="create-venue-category-header">
                <h2>Create Booking</h2>
                <button className="back-btn" onClick={() => navigate('/admin/venuecategory')}>
                    Back to Nooking List
                </button>
                <button className="back-btn" onClick={toggleModal}>
                    Redeem Item
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="create-venue-category-form">

                <div className="form-group">
                    <label>User:</label>
                    <select
                        value={userId}
                        onChange={(e) => handleUserChange(e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select a user
                        </option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Venue:</label>
                    <select
                        value={venueId}
                        onChange={(e) => handleVenueChange(e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select a venue
                        </option>
                        {venues.map((venue) => (
                            <option key={venue.id} value={venue.id}>
                                {venue.venue_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Check in Date:</label>
                    <input
                        type="date"
                        value={checkinDate}
                        onChange={(e) => setCheckinDate(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>No. of Pax:</label>
                    <input
                        type="text"
                        value={pax}
                        onChange={(e) => setPax(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Room No.:</label>
                    <input
                        type="text"
                        value={roomNo}
                        onChange={(e) => setRoomNo(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Manager:</label>
                    <input
                        type="text"
                        value={manager}
                        onChange={(e) => setManager(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Notes:</label>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Category'}
                </button>
            </form>
        </div>
    );
};

export default CreateBooking;
