import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import supabase from "../../../config/supabaseClient";
import { FaEdit, } from "react-icons/fa";

import "./EditVenue.css";
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import ImageUpload from '../../../components/Input/ImageUpload';
import CreateNewEvent from '../../../components/Input/ImageUpload/CreateNewEvent';
import CreateNewPromotion from '../../../components/Input/ImageUpload/CreateNewPromotion';
import OptionRange from '../../../components/Input/OptionRange';
import TextArea from "antd/es/input/TextArea";

const EditVenue = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [venueCategories, setVenueCategories] = useState([]);
    const [recommendedTags, setRecommendedTags] = useState([]);
    const [venues, setVenues] = useState([]);
    const [managers, setManagers] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [formData, setFormData] = useState({
        venue_name: "",
        address: "",
        opening_hours: "",
        happy_hours: "",
        night_hours: "",
        morning_hours: "",
        recommended: "",
        price: "",
        drink_min_spend: "",
        recommended_tags_id: [],
        language_id: [],
        manager_id: [],
        similar_place_id: [],
        playability: "",
        minimum_tips: "",
        saturdayOH: "",
        sundayOH: "",
        mondayOH: "",
        tuesdayOH: "",
        wednesdayOH: "",
        thursdayOH: "",
        fridayOH: "",
        venue_category_id: "",
        cat_id: "",
        pic_path: null,
        event_pic_path: null,
        promotion_pic_path: null,
    });
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    // Fetch venue data and dropdown data
    useEffect(() => {
        const fetchVenueData = async () => {
            try {
                const { data: venue, error } = await supabase
                    .from("venues")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;

                setFormData({
                    venue_name: venue.venue_name,
                    address: venue.address,
                    opening_hours: venue.opening_hours,
                    happy_hours: venue.happy_hours,
                    night_hours: venue.night_hours,
                    morning_hours: venue.morning_hours,
                    price: venue.price,
                    drink_min_spend: venue.drink_min_spend,
                    recommended_tags_id: venue.recommended || [],
                    language_id: venue.language || [],
                    manager_id: venue.manager_id || [],
                    cat_id: venue.cat_id || [],
                    similar_place_id: venue.similar_place_id || [],
                    playability: venue.playability,
                    minimum_tips: venue.minimum_tips,
                    saturdayOH: venue.saturdayOH,
                    sundayOH: venue.sundayOH,
                    mondayOH: venue.mondayOH,
                    tuesdayOH: venue.tuesdayOH,
                    wednesdayOH: venue.wednesdayOH,
                    thursdayOH: venue.thursdayOH,
                    fridayOH: venue.fridayOH,
                    venue_category_id: venue.venue_category_id,
                    pic_path: venue.pic_path,
                    event_pic_path: venue.event_pic_path,
                    promotion_pic_path: venue.promotion_pic_path,
                });
            } catch (error) {
                console.error("Error fetching venue data:", error.message);
            }
        };

        const fetchDropdownData = async () => {

            const { data: venueList, error: venueListError } = 
                await supabase.from("venues").select("id, venue_name");
            if (venueListError) throw venueListError;
            setVenues(
                venueList.map((venue) => ({
                    value: venue.id,
                    label: venue.venue_name,
                }))
            );

            const { data: venuecategories } = await supabase.from("venue_category").select("*");
            setVenueCategories(venuecategories.map((category) => ({
                value: category.id,
                label: category.category_name,
            })));

            const { data: recommendedTags, error: recommendedTagsError } =
                await supabase.from("recommended_tags").select("*").eq("status", 'enabled');
            if (recommendedTagsError) throw recommendedTagsError;
            setRecommendedTags(
                recommendedTags.map((tag) => ({
                    value: tag.id,
                    label: tag.tag_name,
                }))
            );

            const { data: language, error: languageError } =
                await supabase.from("languages").select("*").eq("status", 'enabled');
            if (languageError) throw languageError;
            setLanguages(
                language.map((lang) => ({
                    value: lang.id,
                    label: lang.language_name,
                }))
            );

            const { data: manager, error: managerError } = 
                await supabase.from("manager_profiles").select("*").eq("status", 'approved');
            if (managerError) throw managerError;
            setManagers(
                manager.map((mang) => ({
                    value: mang.id,
                    label: mang.username,
                }))
            );
        };

        fetchVenueData();
        fetchDropdownData();
    }, [id]);

    const handleSaveVenue = async () => {
        try {
            formData.venue_category_id =  Number(formData.cat_id[0]);
            const { error } = await supabase
                .from("venues")
                .update({
                    venue_name: formData.venue_name,
                    address: formData.address,
                    opening_hours: formData.opening_hours,
                    happy_hours: formData.happy_hours,
                    night_hours: formData.night_hours,
                    morning_hours: formData.morning_hours,
                    price: formData.price,
                    drink_min_spend: formData.drink_min_spend,
                    recommended: formData.recommended_tags_id,
                    language: formData.language_id,
                    manager_id: formData.manager_id,
                    cat_id: formData.cat_id,
                    similar_place_id: formData.similar_place_id,
                    playability: formData.playability,
                    minimum_tips: formData.minimum_tips,
                    saturdayOH: formData.saturdayOH,
                    sundayOH: formData.sundayOH,
                    mondayOH: formData.mondayOH,
                    tuesdayOH: formData.tuesdayOH,
                    wednesdayOH: formData.wednesdayOH,
                    thursdayOH: formData.thursdayOH,
                    fridayOH: formData.fridayOH,
                    venue_category_id: formData.venue_category_id,
                    pic_path: formData.pic_path,
                    event_pic_path: formData.event_pic_path,
                    promotion_pic_path: formData.promotion_pic_path,
                    modified_at: new Date().toISOString(),
                })
                .eq("id", id);

            if (error) throw error;

            showToast("Venue updated successfully!", "success");
            navigate("/admin/venues");
        } catch (error) {
            showToast("Failed to update venue: " + error.message, "error");
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

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/venues" />
            <h2>Edit Venue</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <div className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Venue Name:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={formData.venue_name}
                            onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Address:</label>
                        <textarea
                            className="enhanced-input"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

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

                    <div className="field-container">
                        <label>Happy Hours:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={formData.happy_hours}
                            onChange={(e) => setFormData({ ...formData, happy_hours: e.target.value })}
                        />
                    </div>

                    <div className="field-container">
                        <label>Night Hours:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={formData.night_hours}
                            onChange={(e) => setFormData({ ...formData, night_hours: e.target.value })}
                        />
                    </div>

                    <div className="field-container">
                        <label>Morning Hours:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={formData.morning_hours}
                            onChange={(e) => setFormData({ ...formData, morning_hours: e.target.value })}
                        />
                    </div>

                    <div className="field-container">
                        <label>Opening Hours:</label>
                        <textarea
                            className="enhanced-input"
                            value={formData.opening_hours}
                            onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                        />
                    </div>

                    <div className="field-container">
                        <OptionRange
                            value={formData.price}
                            max={5}
                            type="price"
                            onChange={handlePriceChange}
                        />
                        <p>Selected Price Level: {formData.price}</p>
                    </div>

                    <div className="field-container">
                        <label>Drink Min Spend:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={formData.drink_min_spend}
                            onChange={(e) => setFormData({ ...formData, drink_min_spend: e.target.value })}
                        />
                    </div>

                    <div className="field-container">
                        <label>Recommended Tags:</label>
                        <Select
                            options={recommendedTags}
                            isMulti
                            value={recommendedTags.filter((option) =>
                                (formData.recommended_tags_id || []).includes(option.value)
                            )}
                            onChange={(selectedOptions) =>
                                setFormData({
                                    ...formData,
                                    recommended_tags_id: selectedOptions.map((option) => option.value),
                                })
                            }
                            placeholder="Choose at least one recommended tag"
                            className="enhanced-input"
                        />
                    </div>

                    <div className="field-container">
                        <label>Languages:</label>
                        <Select
                            options={languages}
                            isMulti
                            value={languages.filter((option) =>
                                (formData.language_id || []).includes(option.value)
                            )}
                            onChange={(selectedOptions) =>
                                setFormData({
                                    ...formData,
                                    language_id: selectedOptions.map((option) => option.value),
                                })
                            }
                            placeholder="Choose at least one language"
                            className="enhanced-input"
                        />
                    </div>

                    <div className="field-container">
                        <label>Managers:</label>
                        <Select
                            options={managers}
                            isMulti
                            value={managers.filter((option) =>
                                (formData.manager_id || []).includes(option.value)
                            )}
                            onChange={(selectedOptions) =>
                                setFormData({
                                    ...formData,
                                    manager_id: selectedOptions.map((option) => option.value),
                                })
                            }
                            placeholder="Choose at least one manager"
                            className="enhanced-input"
                        />
                    </div>

                    <div className="field-container">
                        <label>Similar Places:</label>
                        <Select
                            options={venues}
                            isMulti
                            value={venues.filter((option) =>
                                (formData.similar_place_id || []).includes(option.value)
                            )}
                            onChange={(selectedOptions) =>
                                setFormData({
                                    ...formData,
                                    similar_place_id: selectedOptions.map((option) => option.value),
                                })
                            }
                            placeholder="Choose similar place"
                            className="enhanced-input"
                        />
                    </div>

                    <div className="field-container">
                        <label>Playability:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={formData.playability}
                            onChange={(e) => setFormData({ ...formData, playability: e.target.value })}
                        />
                    </div>

                    <div className="field-container">
                        <label>Minimum Tips:</label>
                        <TextArea
                            className="enhanced-input"
                            type="text"
                            value={formData.minimum_tips}
                            onChange={(e) => setFormData({ ...formData, minimum_tips: e.target.value })}
                        />
                    </div>

                    <div className="field-container">
                        <label>Opening Hours:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            placeholder="Monday"
                            value={formData.mondayOH}
                            onChange={(e) => setFormData({ ...formData, mondayOH: e.target.value })}
                        />
                        <input
                            className="enhanced-input"
                            type="text"
                            placeholder="Tuesday"
                            value={formData.tuesdayOH}
                            onChange={(e) => setFormData({ ...formData, tuesdayOH: e.target.value })}
                        />
                        <input
                            className="enhanced-input"
                            type="text"
                            placeholder="Wednesday"
                            value={formData.wednesdayOH}
                            onChange={(e) => setFormData({ ...formData, wednesdayOH: e.target.value })}
                        />
                        <input
                            className="enhanced-input"
                            type="text"
                            placeholder="Thursday"
                            value={formData.thursdayOH}
                            onChange={(e) => setFormData({ ...formData, thursdayOH: e.target.value })}
                        />
                        <input
                            className="enhanced-input"
                            type="text"
                            placeholder="Friday"
                            value={formData.fridayOH}
                            onChange={(e) => setFormData({ ...formData, fridayOH: e.target.value })}
                        />
                        <input
                            className="enhanced-input"
                            type="text"
                            placeholder="Saturday"
                            value={formData.saturdayOH}
                            onChange={(e) => setFormData({ ...formData, saturdayOH: e.target.value })}
                        />
                        <input
                            className="enhanced-input"
                            type="text"
                            placeholder="Sunday"
                            value={formData.sundayOH}
                            onChange={(e) => setFormData({ ...formData, sundayOH: e.target.value })}
                        />
                    </div>

                    <div className="field-container">
                        <label>Current Image:</label>
                        {formData.pic_path && (
                            <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${formData.pic_path}`} alt="Current Venue" style={{ maxWidth: "200px" }} />
                        )}
                        <ImageUpload onUpload={handleImageUpload} />
                    </div>

                    <div className="field-container">
                        <label>Current Promotion Image:</label>
                        {formData.promotion_pic_path && (
                            <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${formData.promotion_pic_path}`} alt="Current Promotion" style={{ maxWidth: "200px" }} />
                        )}
                        <CreateNewPromotion onUpload={handlePromotionImageUpload} />
                    </div>

                    <div className="field-container">
                        <label>Current Event Image:</label>
                        {formData.event_pic_path && (
                            <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${formData.event_pic_path}`} alt="Current Event" style={{ maxWidth: "200px" }} />
                        )}
                        <CreateNewEvent onUpload={handleEventImageUpload} />
                    </div>

                    <div className="field-container">
                        <label>Edit Venue Damage:</label>
                        <FaEdit 
                            onClick={() => navigate(`/admin/venues/editdamage/${id}`)}
                            title='Edit'
                            className='edit-button'
                        />
                    </div>
                    <div className="field-container">
                        <label>Edit Venue Menu:</label>
                        <FaEdit 
                            onClick={() => navigate(`/admin/venues/editmenu/${id}`)}
                            title='Edit'
                            className='edit-button'
                        />
                    </div>
                    <div className="field-container">
                        <label>Edit Venue Redeem Item:</label>
                        <FaEdit 
                            onClick={() => navigate(`/admin/venues/editredeemitem/${id}`)}
                            title='Edit'
                            className='edit-button'
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={handleSaveVenue}
                style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                }}
            >
                Save Changes
            </button>
        </div>
    );
};

export default EditVenue;
