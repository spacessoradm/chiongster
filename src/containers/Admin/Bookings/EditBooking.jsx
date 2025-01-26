import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import './EditBooking.css';

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

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        item_name: "",
        quantity: "",
        amount: "",
    });
    const [message, setMessage] = useState("");

    const toggleModal = () => {
      setShowModal(!showModal);
      setMessage(""); // Reset any messages when the modal is toggled
    };
  
    // Handle form input changes
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    };

    // Handle Redemption form submission
    const handleRedemptionSubmit = async (e) => {
        e.preventDefault();

        try {
        const { data, error } = await supabase
            .from("redemption")
            .insert([
            {
                booking_id: id,
                item_name: formData.item_name,
                quantity: parseInt(formData.quantity, 10),
                amount: parseFloat(formData.amount),
                created_at: new Date().toISOString(),
                modified_at: new Date().toISOString(),
            },
            ]);

        if (error) throw error;

        setMessage("Redemption details added successfully!");
        setFormData({ item_name: "", quantity: "", amount: "" }); // Reset form fields
        } catch (error) {
        setMessage(`Error: ${error.message}`);
        }
    };

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
        <div className="edit-booking-container" style={{ fontFamily: 'Courier New' }}>
            <div className="edit-booking-header">
                <h2>Edit Booking</h2>
                <button className="back-btn" onClick={() => navigate('/admin/bookings')}>
                    Back to Booking List
                </button>
                <button className="open-modal-btn" style={{ marginLeft: '10px' }} onClick={toggleModal}>
                    Redeem a drink
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="edit-booking-form" style={{ paddingTop: '20px' }}>

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

            {/* Modal */}
            {showModal && (
            <div className="modal-overlay">
            <div className="modal-content">
                <h2>Redemption Details</h2>
                {message && <p>{message}</p>}
                <form className="redemption-form" onSubmit={handleRedemptionSubmit}>
                <div className="form-group">
                    <label>Item Name:</label>
                    <input
                    type="text"
                    name="item_name"
                    value={formData.item_name}
                    onChange={handleInputChange}
                    required
                    />
                </div>

                <div className="form-group">
                    <label>Quantity:</label>
                    <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    />
                </div>

                <div className="form-group">
                    <label>Amount:</label>
                    <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Submit
                </button>
                </form>
                <button className="close-modal-btn" onClick={toggleModal}>
                Close
                </button>
            </div>
            </div>
        )}
        </div>
    );
};

export default EditBooking;
