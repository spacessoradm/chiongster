import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from "../../../config/supabaseClient";
import BackButton from "../../../components/Button/BackButton";

const ViewBooking = () => {
  const { id } = useParams(); // user_id from URL
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState(null);
  const [booking, setBooking] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {

        const { data: bookingData, error: bookingError } = await supabase
          .from("booking")
          .select("*")
          .eq("id", id)
          .single();

          if (bookingError) throw bookingError;

        console.log(bookingData.user_id);

        setBooking(bookingData);

        // Fetch user details
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", bookingData.user_id)
          .single();
        if (userError) throw userError;

        setUser(userData);

        const { data: redemptionData, error: redemptionError } = await supabase
          .from("redemption")   
          .select("*")
          .eq("booking_id", bookingData.id);
        if (redemptionError) throw redemptionError;

        setRedemptions(redemptionData);

        const { data: venueData, error: venueError } = await supabase
          .from("venues")   
          .select("*")
          .eq("id", bookingData.venue_id);
        if (venueError) throw venueError;

        if (venueData && venueData.length > 0) {
            setVenues(venueData[0]); // Set the first venue if there is any
          }

      } catch (err) {
        setError("Failed to fetch data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Courier New" }}>
      {/* Back Button */}
      <BackButton />

      <div className="edit-user-container">
        <div className="admin-content">
          <h2>Booking Details</h2>
          <form>
            <div className="form-group">
              <label>Booking Code:</label>
              <input type="text" value={booking.booking_unique_code} disabled />
            </div>

            <div className="form-group">
              <label>Venue:</label>
              <input type="text" value={venues?.venue_name} disabled />
            </div>

            <div className="form-group">
              <label>Venue Address:</label>
              <input type="text" value={venues?.address} disabled />
            </div>

            <div className="form-group">
              <label>Check In Date:</label>
              <input type="text" value={booking.preferred_date || ""} disabled />
            </div>

            <div className="form-group">
              <label>No. of Pax:</label>
              <input type="text" value={booking.pax || ""} disabled />
            </div>

            <div className="form-group">
              <label>Room No.:</label>
              <input type="text" value={booking.room_no || ""} disabled />
            </div>

            <div className="form-group">
              <label>Manager:</label>
              <input type="text" value={booking.manager || ""} disabled />
            </div>

            <div className="form-group">
              <label>Notes:</label>
              <input type="text" value={booking.notes || ""} disabled />
            </div>

            <div className="form-group">
              <label>Booking Date:</label>
              <input type="text" value={booking.created_at || ""} disabled />
            </div>
          </form>

          <h3>Redemptions Under this Booking</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
              fontFamily: "Courier New",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Item</th>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Quantity</th>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Amount</th>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>created_at</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.length > 0 ? (
                redemptions.map((redemption) => (
                  <tr key={redemption.id}>
                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                      {redemption.item_name}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                      {redemption.quantity}
                    </td>
                    <td
                      style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        textAlign: "center",
                      }}
                    >
                      {redemption.amount}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                      {new Date(redemption.created_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      border: "1px solid #ccc",
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    No redemptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewBooking;
