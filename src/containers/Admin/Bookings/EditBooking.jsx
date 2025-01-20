import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

const EditBooking = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get the booking ID from the route
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

    // Fetch venues, users, and existing booking data
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

        const fetchBookingData = async () => {
            const { data: bookingData, error: bookingError } = await supabase
                .from("booking")
                .select("*")
                .eq("id", id)
                .single();

            if (bookingError) {
                setError("Failed to load booking data");
                console.error(bookingError);
            } else if (bookingData) {
                const formatDate = (date) => {
                    const d = new Date(date);
                    return d.toISOString().split('T')[0]; // Converts to 'YYYY-MM-DD'
                };
                // Preload form fields with existing data
                setUserId(parseInt(bookingData.user_id));
                setVenueId(parseInt(bookingData.venue_id));
                setCheckinDate(formatDate(bookingData.preferred_date));
                setPax(bookingData.pax);
                setRoomNo(bookingData.room_no);
                setManager(bookingData.manager);
                setNotes(bookingData.notes);
            }
        };

        fetchDropdownData();
        fetchBookingData();
    }, [id]);

    const handleUserChange = (selectedUserId) => {
        setUserId(parseInt(selectedUserId,10));
    };

    const handleVenueChange = async (selectedVenueId) => {
        setVenueId(parseInt(selectedVenueId, 10));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: bookingError } = await supabase
                .from('booking')
                .update({
                    venue_id: venueId,
                    user_id: userId,
                    preferred_date: checkinDate,
                    pax: pax,
                    room_no: roomNo,
                    manager: manager,
                    notes: notes,
                    modified_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (bookingError) throw bookingError;

            // Navigate back to the bookings list after successful update
            navigate('/admin/bookings');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-booking-container">
            <div className="edit-booking-header">
                <h2>Edit Booking</h2>
                <button className="back-btn" onClick={() => navigate('/admin/bookings')}>
                    Back to Booking List
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="edit-booking-form">

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
                    <label>Check-in Date:</label>
                    <input
                        type="date"
                        value={checkinDate || ''}
                        onChange={(e) => {
                            console.log('Selected Date:', e.target.value);
                            setCheckinDate(e.target.value);
                        }}
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
                    {loading ? 'Updating...' : 'Update Booking'}
                </button>
            </form>
        </div>
    );
};

export default EditBooking;
