import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../config/supabaseClient";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";

import "./index.css";
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import ImageUpload from '../../../components/Input/ImageUpload';
import CreateNewEvent from '../../../components/Input/ImageUpload/CreateNewEvent';
import CreateNewPromotion from '../../../components/Input/ImageUpload/CreateNewPromotion';
import OptionRange from '../../../components/Input/OptionRange';
import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';
import SingleSelect from '../../../components/Input/SingleSelect';
import MultiSelect from '../../../components/Input/MultiSelect';
import Select from "react-select";

const CreateVenue = () => {
    const navigate = useNavigate();
    const [venues, setVenues] = useState([]);
    const [venueCategories, setVenueCategories] = useState([]);
    const [recommendedTags, setRecommendedTags] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [managers, setManagers] = useState([]);
    const [items, setItems] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState({
        venue_name: "",
        address: "",
        latitude: "",
        longitude: "",
        cat_id: "",
        opening_hours: "",
        happy_hours: "",
        night_hours: "",
        morning_hours: "",
        price: 0,
        drink_min_spend: "",
        recommended_tags_id: "",
        language_id: "",
        manager_id: "",
        similar_place_id: "",
        playability: "",
        minimum_tips: "",
        venue_category_id: "",
        damage: [
            {
                title: "",
                pax: "",
                min_spend: "",
                amenities: "",
                happy_hours: "",
                night_hours: "",
                morning_hours: "",
            },
        ],
        menu: [{ item_name: "", item_description: "", original_price: "", discounted_price: "" }],
        item: [{ item_id: "", venue_id: "", amount: "" }],
        pic_path: null,
        event_pic_path: null,
        promotion_pic_path: null,
    });
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });


    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    // Fetch data for dropdowns
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [venueRes, venueCatRes, tagRes, langRes, managerRes, itemRes] = await Promise.all([
                    supabase.from("venues").select("id, venue_name"),
                    supabase.from("venue_category").select("*"),
                    supabase.from("recommended_tags").select("*").eq("status", 'enabled'),
                    supabase.from("languages").select("*").eq("status", 'enabled'),
                    supabase.from("manager_profiles").select("*").eq("status", 'approved'),
                    supabase.from("redeem_items").select("*")
                ]);
    
                if (venueRes.error || venueCatRes.error || tagRes.error || langRes.error || managerRes.error || itemRes.error) {
                    throw new Error("Error fetching initial data");
                }
    
                setVenues(venueRes.data.map(v => ({ value: v.id, label: v.venue_name })));
                setVenueCategories(venueCatRes.data.map(vec => ({ value: vec.id, label: vec.category_name })));
                setRecommendedTags(tagRes.data.map(tag => ({ value: tag.id, label: tag.tag_name })));
                setLanguages(langRes.data.map(lang => ({ value: lang.id, label: lang.language_name })));
                setManagers(managerRes.data.map(mang => ({ value: mang.id, label: mang.username })));
                setItems(itemRes.data.map(item => ({ value: item.id, label: item.item_name })));

            } catch (error) {
                showToast("Error populate the dropdowns values", "error");
            }
        };

        fetchData();
    }, []);
    
    const handleSaveVenue = async () => {
        try {
          console.log(formData);
          formData.venue_category_id =  Number(formData.cat_id[0]);
          const { data: venueData, error } = await supabase
            .from("venues")
            .insert({
              venue_name: formData.venue_name,
              address: formData.address,
              latitude: formData.latitude,
              longitude: formData.longitude,
              cat_id: formData.cat_id || null,
              opening_hours: formData.opening_hours,
              happy_hours: formData.happy_hours,
              night_hours: formData.night_hours,
              morning_hours: formData.morning_hours,
              price: formData.price,
              drink_min_spend: formData.drink_min_spend,
              recommended: formData.recommended_tags_id || null,
              language: formData.language_id || null,
              manager_id: formData.manager_id || null,
              similar_place_id: formData.similar_place_id || null,
              playability: formData.playability,
              minimum_tips: formData.minimum_tips,
              venue_category_id: formData.venue_category_id,
              pic_path: formData.pic_path,
              event_pic_path: formData.event_pic_path,
              promotion_pic_path: formData.promotion_pic_path,
              created_at: new Date().toISOString(),
              modified_at: new Date().toISOString(),  
            })
            .select()
            .single();
    
          if (error) throw error;
    
          const venueID = venueData.id;
    
          await Promise.all([
            handleSaveVenueDamage(venueID, formData.damage),
            handleSaveVenueMenu(venueID, formData.menu),
            handleSaveVenueRedeemItem(venueID, formData.item)
          ]);
    
          showToast("Venue created successfully", "success");
          navigate("/admin/venues"); // Navigate back to the venue list page
        } catch (error) {          
          showToast("Failed to create venue: " + error.message, "error");
        }
      };
    
    const handleSaveVenueDamage = async (venueId, damage) => {
        try {
            console.log(damage);
          if (damage.length > 0) {
            const venueDamages = damage.map((group) => ({
              venue_id: venueId,
              title: group.title,
              pax: group.pax,
              min_spend: group.min_spend,
              amenities: group.amenities,
              happy_hours: group.happy_hours,
              night_hours: group.night_hours,
              morning_hours: group.morning_hours,
              created_at: new Date().toISOString(),
              modified_at: new Date().toISOString(),  
            }));
    
            const { error } = await supabase.from("venue_damage").insert(venueDamages);
            if (error) throw error;
          }
        } catch (error) {
            showToast('Error saving venue damage', 'error');
        }
      };
    
    const handleSaveVenueMenu = async (venueId, menu) => {
        try {
            console.log(menu);
          if (menu.length > 0) {
            const venueMenu = menu.map((item) => ({
              venue_id: venueId,
              item_name: item.item_name,
              item_description: item.item_description,
              original_price: item.original_price ? Number(item.original_price) : null,
              created_at: new Date().toISOString(),
              modified_at: new Date().toISOString(),  
            }));
    
            const { error } = await supabase.from("venue_menu").insert(venueMenu);
            if (error) throw error;
          }
        } catch (error) {
            showToast('Error saving venue menu', 'error');
        }
      };

    const handleSaveVenueRedeemItem = async (venueId, item) => {
        try {
            console.log(item);
          if (item.length > 0) {
            const venueRedeemItem = item.map((item) => ({
              venue_id: venueId,
              item_id: selectedItem,
              amount: item.amount,
              created_at: new Date().toISOString(),
              modified_at: new Date().toISOString(),  
            }));
    
            const { error } = await supabase.from("venue_redeemitem").insert(venueRedeemItem);
            if (error) throw error;
          }
        } catch (error) {
            showToast('Error saving venue redeem Item', 'error');
        }
      };

  
      const getCoordinates = async (address) => {
        const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY; // Secure API key in .env
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;
    
        try {
          const response = await fetch(url);
          const data = await response.json();
          console.log(data);
          
          if (data.results.length > 0) {
            const lat = data.results[0].geometry.lat;
            const lng = data.results[0].geometry.lng;
            console.log(lat, lng);  
            return { latitude: lat, longitude: lng };
          } else {
            console.error("No results found for the address.");
            return null;
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          return null;
        }
      };

    const handleAddressChange = async (e) => {
          const address = e.target.value;
          setFormData((prev) => ({ ...prev, address }));
  
          if (address.trim() !== "") {
            const coordinates = await getCoordinates(address);
            if (coordinates) {
                setFormData((prev) => ({
                    ...prev,
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                }));
            }
          }
      };

    const handlePriceChange = (price) => {
        setFormData({ ...formData, price });
      };

    const handleImageUpload = (url) => {
        setFormData((prev) => ({ ...prev, pic_path: url }));
      };

    const handleEventImageUpload = (url) => {
        setFormData((prev) => ({ ...prev, event_pic_path: url }));
      };

    const handlePromotionImageUpload = (url) => {
        setFormData((prev) => ({ ...prev, promotion_pic_path: url }));
      };

    const handleTabChange = (index) => setActiveTab(index);

    /* Tab 0: Venue Damage */
    const handleDamageChange = (index, field, value) => {
        setFormData((prev) => {
          const updatedDamage = [...prev.damage];
          updatedDamage[index][field] = value;
          return { ...prev, damage: updatedDamage };
        });
      };
    
    const addDamageGroup = () => {
        setFormData((prev) => ({
          ...prev,
          damage: [
            ...prev.damage,
            {
              title: "",
              pax: "",
              min_spend: "",
              amenities: "",
              happy_hours: "",
              night_hours: "",
              morning_hours: "",
            },
          ],
        }));
      };
    
    const removeDamageGroup = (index) => {
        setFormData((prev) => ({
          ...prev,
          damage: prev.damage.filter((_, i) => i !== index),
        }));
      };
    
    const handleMenuChange = (index, field, value) => {
        setFormData((prev) => {
          const updatedMenu = [...prev.menu];
          updatedMenu[index][field] = value;
          return { ...prev, menu: updatedMenu };
        });
      };

    const addMenuGroup = () => {
        setFormData((prev) => ({
          ...prev,
          menu: [
            ...prev.menu,
            {
              item_name: "",
              item_description: "",
              original_price: "",
            },
          ],
        }));
      };
    
    const removeMenuGroup = (index) => {
        setFormData((prev) => ({
          ...prev,
          menu: prev.menu.filter((_, i) => i !== index),
        }));
      };

    const handleRedeemItemChange = (index, field, value) => {
        setFormData((prev) => {
          const updatedItem = [...prev.item];
          updatedItem[index][field] = value;
          return { ...prev, item: updatedItem };
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


    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/venues" />   
            <h2>Create New Venue</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <div className="outsider">
                <div className="insider">

                    <PlainInput
                        label="Venue Name:"
                        value={formData.venue_name}
                        onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                        required
                    />

                    <TextArea
                        label="Address:"
                        value={formData.address}
                        onChange={handleAddressChange}
                        rows={5} 
                        required
                    />

                    <PlainInput
                        label="Latitude:"
                        value={formData.latitude}
                        readOnly
                        hidden
                    />

                    <PlainInput
                        label="Longitude:"
                        value={formData.longitude}
                        readOnly
                        hidden
                    />

                    <div className="field-container">
                        <label>Category:</label>
                        <Select
                            options={venueCategories}
                            isMulti
                            value={venueCategories.filter((option) =>
                                (formData.cat_id || []).includes(option.value)
                            )}
                            onChange={(selectedOptions) =>
                                setFormData({
                                    ...formData,
                                    cat_id: selectedOptions.map((option) => option.value),
                                })
                            }
                            placeholder="Choose at least one category"
                            className="enhanced-input"
                        />
                    </div>

                    <PlainInput
                        label="Happy Hours:"
                        value={formData.happy_hours}
                        onChange={(e) => setFormData({ ...formData, happy_hours: e.target.value })}
                    />

                    <PlainInput
                        label="Night Hours:"
                        value={formData.night_hours}
                        onChange={(e) => setFormData({ ...formData, night_hours: e.target.value })}
                    />

                    <PlainInput
                        label="Morning Hours:"
                        value={formData.morning_hours}
                        onChange={(e) => setFormData({ ...formData, morning_hours: e.target.value })}
                    />

                    <TextArea
                        label="Opening Hours:"
                        value={formData.opening_hours}
                        onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                        rows={5} 
                        required
                    />

                    <OptionRange
                        value={formData.price}
                        max={5}
                        type="price"
                        onChange={handlePriceChange}
                    />

                    <PlainInput
                        label="Drink Min Spend:"
                        value={formData.drink_min_spend}
                        onChange={(e) => setFormData({ ...formData, drink_min_spend: e.target.value })}
                    />

                    <MultiSelect
                        label="Recommended Tags:"
                        options={recommendedTags}
                        selectedValues={formData.recommended_tags_id}
                        onChange={(selected) => setFormData({ ...formData, recommended_tags_id: selected })}
                        placeholder="Choose one or more recommended tag"
                    />

                    <MultiSelect
                        label="Languages:"
                        options={languages}
                        selectedValues={formData.language_id}
                        onChange={(selected) => setFormData({ ...formData, language_id: selected })}
                        placeholder="Choose one or more language"
                    />

                    <MultiSelect
                        label="Managers:"
                        options={managers}
                        selectedValues={formData.manager_id}
                        onChange={(selected) => setFormData({ ...formData, manager_id: selected })}
                        placeholder="Choose one or more manager"
                    />

                    <MultiSelect
                        label="Similar Place:"
                        options={venues}
                        selectedValues={formData.similar_place_id}
                        onChange={(selected) => setFormData({ ...formData, similar_place_id: selected })}
                        placeholder="Choose one or more similar place"
                    />

                    <PlainInput
                        label="Playability:"
                        value={formData.playability}
                        onChange={(e) => setFormData({ ...formData, playability: e.target.value })}
                    />

                    <ImageUpload onUpload={handleImageUpload} />

                    <CreateNewPromotion onUpload={handlePromotionImageUpload} />

                    <CreateNewEvent onUpload={handleEventImageUpload} />
                </div>
            </div>

            {/* Tabs Navigation */}
            <div style={{ display: "flex", marginBottom: "20px" }}>
                {["General Info", "Menu", "Redeem Items"].map((tab, index) => (
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
                <div>
                <h2>Damage Details</h2>
                {formData.damage.map((group, index) => (
                <div
                    key={index}
                    className="enhanced-input"
                    >
                    <label>Title:</label>
                    <input
                        type="text"
                        value={group.title}
                        onChange={(e) =>
                        handleDamageChange(index, "title", e.target.value)
                        }
                        className="enhanced-input"
                    />

                    <label>Number of Pax:</label>
                    <input
                        type="text"
                        value={group.pax}
                        onChange={(e) =>
                        handleDamageChange(index, "pax", e.target.value)
                        }
                        className="enhanced-input"
                    />

                    <label>Min Spend:</label>
                    <input
                        type="text"
                        value={group.min_spend}
                        onChange={(e) =>
                        handleDamageChange(index, "min_spend", e.target.value)
                        }
                        className="enhanced-input"
                    />

                    <label>Amenities:</label>
                    <textarea
                        value={group.amenities}
                        onChange={(e) =>
                        handleDamageChange(index, "amenities", e.target.value)
                        }
                        className="enhanced-input"
                    />

                    <label>Happy Hours:</label>
                    <input
                        type="text"
                        value={group.happy_hours}
                        onChange={(e) =>
                        handleDamageChange(index, "happy_hours", e.target.value)
                        }
                        className="enhanced-input"
                    />

                    <label>Night Hours:</label>
                    <input
                        type="text"
                        value={group.night_hours}
                        onChange={(e) =>
                        handleDamageChange(index, "night_hours", e.target.value)
                        }
                        className="enhanced-input"
                    />

                    <label>Morning Hours:</label>
                    <input
                        type="text"
                        value={group.morning_hours}
                        onChange={(e) =>
                        handleDamageChange(index, "morning_hours", e.target.value)
                        }
                        className="enhanced-input"
                    />

                    <FaMinusCircle
                        size={50}  
                        onClick={() => removeDamageGroup(index)}
                        style={{
                        cursor: "pointer",
                        color: "#f44336",
                        margin: "15px",
                        }}
                    />
                </div>
                    ))
                }
                    <FaPlusCircle
                    size={50}  
                    onClick={addDamageGroup}
                    style={{
                        cursor: "pointer",
                        color: "#4CAF50",
                        margin: "15px",
                        }}
                    />
                </div>
            )}

            {activeTab === 1 && (
                <div style={{ marginTop: "20px" }}>
                    <h2>Menu</h2>
                    {formData.menu.map((groupMenu, index) => (
                        <div key={index} className="enhanced-input">

                            <label>Item Name:</label>
                            <input
                                type="text"
                                value={groupMenu.item_name}
                                onChange={(e) =>
                                handleMenuChange(index, "item_name", e.target.value)
                                }
                                className="enhanced-input"
                            />
                            <label>Item Description:</label>
                            <input
                                type="text"
                                value={groupMenu.item_description}
                                onChange={(e) =>
                                handleMenuChange(index, "item_description", e.target.value)
                                }
                                className="enhanced-input"
                            />
                            <label>Amount:</label>
                            <input
                                type="text"
                                value={groupMenu.original_price}
                                onChange={(e) =>
                                handleMenuChange(index, "original_price", e.target.value)
                                }
                                className="enhanced-input"
                            />
                            <FaMinusCircle
                                size={50}  
                                onClick={() => removeMenuGroup(index)}
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
                            onClick={addMenuGroup}
                            style={{
                                cursor: "pointer",
                                color: "#4CAF50",
                                margin: "15px",
                                }}
                            />
                </div>
            )}

            {activeTab === 2 && (
                <div style={{ marginTop: "20px" }}>
                    <h2>Redeem Items</h2>
                    {formData.item.map((groupRedeem, index) => (
                        <div key={index} className="enhanced-input">

                            <SingleSelect 
                                label="Item Name" 
                                options={items} 
                                selectedValue={selectedItem} 
                                onChange={setSelectedItem} 
                                placeholder="Choose an item"
                            />
                            <PlainInput
                                label="Amount"
                                type="text"
                                value={groupRedeem.amount}
                                onChange={(e) =>
                                handleRedeemItemChange(index, "amount", e.target.value)
                                }
                                className="enhanced-input"
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

            <button
                onClick={handleSaveVenue}
                className="save-button"
            >
                Save
            </button>
        </div>
    );
};

export default CreateVenue;
