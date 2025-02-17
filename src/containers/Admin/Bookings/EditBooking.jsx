import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import './EditBooking.css';
import { FaEdit, } from "react-icons/fa";

import Toast from '../../../components/Toast';
import BackButton from '../../../components/Button/BackArrowButton';
import ReceiptUploader from '../../../components/Input/ImageUpload/ReceiptUploader';
import PlainInput from '../../../components/Input/PlainInput';

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
    const [uploaded, setUploaded] = useState("");
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
                setUploaded(bookingData.uploaded);
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
                    uploaded: uploaded,
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

    const handleReceiptImageUpload = (url) => {
        //setFormData((prev) => ({ ...prev, uploaded: url }));
        setUploaded(url);
    };

    return (
        <div className="edit-booking-container" style={{ fontFamily: 'Courier New' }}>
            <BackButton to="/admin/bookings" />
            <h2>Edit Booking</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="outsider">

                <div className="insider">
                    <div className="field-container">
                        <label>User:</label>
                        <select
                            value={userId}
                            onChange={(e) => handleUserChange(e.target.value)}
                            className='enhanced-input'
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

                    <div className="field-container">
                        <label>Venue:</label>
                        <select
                            value={venueId}
                            onChange={(e) => handleVenueChange(e.target.value)}
                            className='enhanced-input'
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

                    <div className="field-container">
                        <label>Check-in Date:</label>
                        <input
                            type="date"
                            value={checkinDate || ''}
                            onChange={(e) => {
                                console.log('Selected Date:', e.target.value);
                                setCheckinDate(e.target.value);
                            }}
                            className='enhanced-input'
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>No. of Pax:</label>
                        <input
                            type="text"
                            value={pax}
                            onChange={(e) => setPax(e.target.value)}
                            className='enhanced-input'
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Room No.:</label>
                        <input
                            type="text"
                            value={roomNo}
                            onChange={(e) => setRoomNo(e.target.value)}
                            className='enhanced-input'
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Manager:</label>
                        <input
                            type="text"
                            value={manager}
                            onChange={(e) => setManager(e.target.value)}
                            className='enhanced-input'
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Notes:</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className='enhanced-input'
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Receipt:</label>
                        {uploaded && (
                            <img src={`${uploaded}`} alt="Current Receipt" style={{ maxWidth: "200px" }} />
                        )}
                        <ReceiptUploader onUpload={handleReceiptImageUpload} />
                    </div>

                    <div className="field-container">
                        <label>Edit Redeem Item:</label>
                        <FaEdit 
                            onClick={() => navigate(`/admin/bookings/editredemption/${id}`)}
                            title='Edit'
                            className='edit-button'
                        />
                    </div>

                    <div className="field-container">
                        <label>Credit Drink Dollar:</label>
                        <FaEdit 
                            onClick={() => navigate(`/admin/drinkdollars/createtransaction/${userId}`)}
                            title='Edit'
                            className='edit-button'
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Booking'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default EditBooking;
