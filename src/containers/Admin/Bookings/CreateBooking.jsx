import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import './CreateBooking.css';

import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from "../../../components/Input/PlainInput";
import TextArea from "../../../components/Input/TextArea";
import SingleSelect from "../../../components/Input/SingleSelect";


const CreateBooking = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState("");
    const [venueId, setVenueId] = useState(null);
    const [checkinDate, setCheckinDate] = useState("");
    const [pax, setPax] = useState("");
    const [notes, setNotes] = useState("");
    const [venues, setVenues] = useState([]);
    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [roomSpec, setRoomSpec] = useState("");
    const [managerName, setManagerName] = useState("");
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    const [formData, setFormData] = useState({item: [{ item_id: "", quantity: "", amount: "" }],});
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [amount, setAmount] = useState(0);

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

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

    useEffect(() => {
        if (!venueId) return
    
        const fetchRoomSpecs = async () => {
            try{
                const { data: venueMI, error: venueMIError } = await supabase
                    .from("venues")
                    .select("id, manager_id")
                    .eq("id", venueId);


                const { data: roomList, error: roomListError } = await supabase
                    .from("venue_damage")
                    .select("id, title")
                    .eq("venue_id", venueId);

                const { data: managerList, error: managerListError } = await supabase
                    .from("manager_profiles")
                    .select("id, username")
                    .in("id", JSON.parse(venueMI[0].manager_id));

                const { data: venueItemList, error: venueItemListError } = await supabase
                    .from("venue_redeemitem")
                    .select("id, item_id, amount")
                    .eq("venue_id", venueId);
            
    
                const { data: itemName, error: itemNameError } = await supabase
                    .from("redeem_items")
                    .select("id, item_name");
    
                const mergedList = venueItemList.map(vItem => ({
                    value: vItem.item_id, 
                    label: itemName.find(i => i.id === vItem.item_id)?.item_name || "Unknown"
                }));
    
                if (roomListError || managerListError || venueItemListError || itemNameError) {
                    console.error("Error fetching drop down data:", roomListError || managerListError || venueItemListError || itemNameError);
                    throw new Error("Error fetching drop down data");
                }
    
                setRooms(roomList);
                setManagers(managerList);
                setItems(mergedList || []);
            } catch (error) {
               showToast(error.message, "error");
            } 
        };

        fetchRoomSpecs();
      }, [venueId]);

    useEffect(() => {
        if (!selectedItem) return
    
        const fetchAmount = async () => {
            try{
                const { data: venueItemList, error: venueItemListError } = await supabase
                    .from("venue_redeemitem")
                    .select("item_id, amount")
                    .eq("item_id", selectedItem);
    
                if (venueItemListError) {
                    console.error("Error fetching drop down data:", venueItemListError);
                    throw new Error("Error fetching drop down data");
                }
    
                setAmount(venueItemList[0].amount);
            } catch (error) {
               showToast(error.message, "error");
            } 
        };

        fetchAmount();
      }, [selectedItem]); 

    const handleUserChange = (selectedUserId) => {
        setUserId(selectedUserId);
    };

    const handleVenueChange = async (selectedVenueId) => {
        setVenueId(selectedVenueId);
        console.log("Venue ID Changed: " + selectedVenueId);
    };

    const handleRoomSpecChange = (selectedRoomSpec) => {
        setRoomSpec(selectedRoomSpec);
        console.log("Room Spec Changed: " + selectedRoomSpec);
    };

    const handleManagerChange = (selectedManager) => {
        setManagerName(selectedManager);
        console.log("Manager Changed: " + selectedManager);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRedeemItemChange = (index, field, value) => {   
        setFormData((prev) => {
            const updatedItems = [...prev.item];
    
            // Update the field dynamically
            updatedItems[index][field] = value;
    
            // If quantity changes, update the amount field too
            if (field === "quantity") {
                const total = value * amount;
                updatedItems[index]["amount"] = total;
            } else if (field === "item_id") {
                setSelectedItem(value);
            }
            console.log("Updated formData before saving:", prev);
            return { ...prev, item: updatedItems };
        });
    };
    

    const addRedeemItemGroup = () => {
        setFormData((prev) => ({
          ...prev,
          item: [
            ...prev.item,
            {
              item_name: "",
              amount: "",
            },
          ],
        }));
      };
    
    const removeRedeemItemGroup = (index) => {
        setFormData((prev) => ({
          ...prev,
          item: prev.item.filter((_, i) => i !== index),
        }));
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

        console.log("Booking Unique Code: " + bookingUniqueCode);

        try {
            const { data: bookingData, error: bookingError } = await supabase
                .from('booking')
                .insert(
                    {
                        venue_id: venueId,
                        user_id: userId,
                        preferred_date: checkinDate,
                        pax: pax,
                        room_no: roomSpec,
                        manager: managerName,
                        notes: notes,
                        booking_unique_code: bookingUniqueCode,
                        created_at: new Date().toISOString(),
                        modified_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

            console.log("Booking Data: ", bookingData.id);

            if (bookingError) throw bookingError;

            const bookingID = bookingData.id;
    
            await Promise.all([
                handleSaveRedemptionItem(bookingID, formData.item)
            ]);

            // Navigate back to the venue categories list after successful creation
            navigate('/admin/bookings');
        } catch (error) {
            setError(error.message);
            console.error("Error creating booking:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRedemptionItem = async (bookingId, item) => {
        try {
            console.log("formdata item: " + JSON.stringify(item));
          if (item.length > 0) {
            const venueRedeemItem = item.map((i) => ({
              booking_id: bookingId,
              item_name: i.item_id,
              quantity: i.quantity,
              amount: i.amount,
              created_at: new Date().toISOString(),
              modified_at: new Date().toISOString(),  
            }));
    
            const { error } = await supabase.from("redemption").insert(venueRedeemItem);
            if (error){
                console.log(error);
                throw error;
            } 
          }
        } catch (error) {
            showToast('Error saving venue redeem Item', 'error');
        }
      };

    return (
        <div className="create-venue-category-container">
            <BackButton to="/admin/bookings" />   
            <h2>Create New Booking</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                <SingleSelect
                    label="User"
                    value={userId}
                    onChange={handleUserChange}
                    options={users.map((user) => ({ label: user.username, value: user.id }))}
                    required
                />

                <SingleSelect
                    label="Venue"
                    value={venueId}
                    onChange={handleVenueChange}
                    options={venues.map((venue) => ({ label: venue.venue_name, value: venue.id }))}
                    required
                />

                <PlainInput
                    label="Check in Date"
                    type="date"
                    value={checkinDate}
                    onChange={(e) => setCheckinDate(e.target.value)}
                    required
                />

                <PlainInput
                    label="No. of Pax"
                    type="text"
                    value={pax}
                    onChange={(e) => setPax(e.target.value)}
                    required
                />

                <SingleSelect
                    label="Room Size."
                    value={roomSpec}
                    onChange={handleRoomSpecChange}
                    options={rooms.map((room) => ({ label: room.title, value: room.title }))}
                    required
                />

                <SingleSelect
                    label="Manager"
                    value={managerName}
                    onChange={handleManagerChange}
                    options={managers.map((manager) => ({ label: manager.username, value: manager.username }))}
                    required
                />

                <TextArea
                    label="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                /> 

                {/* Tabs Navigation */}
                <div style={{ display: "flex", marginBottom: "20px" }}>
                    {["Redemption"].map((tab, index) => (
                    <div
                        key={index}
                        onClick={() => handleTabChange(index)}
                        style={{
                        backgroundColor: activeTab === index ? "#4CAF50" : "#f0f0f0",
                        color: activeTab === index ? "white" : "black",
                        }}
                        className="tab-navigation"
                    >
                        {tab}
                    </div>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 0 && (
                <div style={{ marginTop: "20px" }}>
                    <h2>Redeem Items</h2>
                    {formData.item.map((groupRedeem, index) => (
                        <div key={index} className="enhanced-input">

                            <SingleSelect 
                                label="Item Name" 
                                options={items} 
                                selectedValue={groupRedeem.item_id} 
                                onChange={(value) => 
                                    handleRedeemItemChange(index, "item_id", value) // Directly pass value
                                }
                                placeholder="Choose an item"
                            />
                            <PlainInput
                                label="Quantity"
                                type="text"
                                value={groupRedeem.quantity}
                                onChange={(e) =>
                                handleRedeemItemChange(index, "quantity", e.target.value)
                                }
                                className="enhanced-input"
                            />

                            <PlainInput
                                label="Amount"
                                type="text"
                                value={groupRedeem.amount}
                                onChange={(e) =>
                                handleRedeemItemChange(index, "amount", e.target.value)
                                }
                                className="enhanced-input"
                                readOnly
                            />
                            <FaMinusCircle
                                size={50}  
                                onClick={() => removeRedeemItemGroup(index)}
                                style={{
                                cursor: "pointer",
                                color: "#f44336",
                                margin: "15px",
                                }}
                            />
                            </div>
                        ))}
                            <FaPlusCircle
                            size={50}  
                            onClick={addRedeemItemGroup}
                            style={{
                                cursor: "pointer",
                                color: "#4CAF50",
                                margin: "15px",
                                }}
                            />
                </div>
            )}

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Creating...' : 'Create'}
                </button>
                </div>
            </form>
        </div>
    );
};

export default CreateBooking;
