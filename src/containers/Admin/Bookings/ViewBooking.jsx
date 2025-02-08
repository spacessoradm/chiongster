import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from "../../../config/supabaseClient";
import BackButton from '../../../components/Button/BackArrowButton';
import { FaEye, FaPlus} from "react-icons/fa";

import './ViewBooking.css';
import Toast from '../../../components/Toast';
import PlainInput from "../../../components/Input/PlainInput";
import TextArea from "../../../components/Input/TextArea";
import Pagination from '../../../components/pagination';

const ViewBooking = () => {
  const { id } = useParams(); // user_id from URL
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState(null);
  const [booking, setBooking] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages
  const limit = 5;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

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

        setBooking(bookingData);

        // Fetch user details
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", bookingData.user_id)
          .single();
        if (userError) throw userError;

        setUser(userData);

        console.log("booking id: " + bookingData.id);

        const { data: redemptionData, error: redemptionError } = await supabase
          .from("redemption")   
          .select("*")
          .eq("booking_id", bookingData.id);

        if (redemptionError)
        {
          console.error("Error fetching redemption data:", redemptionError);
          throw redemptionError;
        } 

        setRedemptions(redemptionData);

        console.log("Redemption data: " + JSON.stringify(redemptionData));

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
      <BackButton to="/admin/alcoholbalance" />
      <h2>View Alcohol Balance</h2>

      {toastInfo.visible && (
          <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      <div className="edit-user-container">
        <div className="admin-content">
          <form className="outsider">
            <div className="insider">
              <PlainInput 
                label="Booking Code:" 
                value={booking.booking_unique_code} 
                readOnly
              />

              <PlainInput 
                label="Venue:" 
                value={venues?.venue_name} 
                readOnly
              />

              <TextArea 
                label="Address:" 
                value={venues?.venue_address}
                rows={5} 
                readOnly
              />

              <PlainInput
                label="Check In Date:"
                value={new Date(booking.preferred_date).toLocaleDateString()}
                readOnly
              />

              <PlainInput
                label="Session:"
                value={booking.session}
                readOnly
              />

              <PlainInput
                label="No. of Pax:"
                value={booking.pax}
                readOnly
              />

              <PlainInput
                label="Room No.:"
                value={booking.room_no}
                readOnly  
              />

              <PlainInput
                label="Manager:"
                value={booking.manager}
                readOnly
              />

              <TextArea
                label="Notes:"
                value={booking.notes}
                rows={5} 
                readOnly
              />

              <PlainInput 
                label="Booking Date:"
                value={new Date(booking.created_at).toLocaleString()}
                readOnly
              />
            </div>
          </form>

          <h3>Redemptions Under this Booking</h3>
          <table className='table-container'>
            <thead>
              <tr>
                <th className="normal-header">Item</th>
                <th className="normal-header">Quantity</th>
                <th className="normal-header">Amount</th>
                <th className="normal-header">created_at</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.length > 0 ? (
                redemptions.map((redemption) => (
                  <tr key={redemption.id}>
                    <td className="normal-column">{redemption.item_name}</td>
                    <td className="normal-column">{redemption.quantity}</td>
                    <td className="normal-column">{redemption.amount}</td>
                    <td className="normal-column">
                      {new Date(redemption.created_at).toLocaleString()}
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
