import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../config/supabaseClient";
import SortableIngredientList from "../../../components/SortableDragAndDrop/Ingredient_List";

const CreateVenue = () => {
    const navigate = useNavigate();
    const [venueCategories, setVenueCategories] = useState([]);

    const [activeTab, setActiveTab] = useState(0);

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
        language: "",
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
        gallery: [{ venue_id: "", type: "Gallery", image_path: "" }],
        pic_path: null,
    });

    // Fetch data for dropdowns
    useEffect(() => {
        const fetchData = async () => {
            const { data: venuecategories } = await supabase.from("venue_category").select("*");
            //const { data: tags } = await supabase.from("tags").select("*").order("name", { ascending: true });

            setVenueCategories(venuecategories);
        };

        fetchData();
    }, []);

    const handleSaveVenue = async () => {
        try {
          const imageFile = formData.pic_path; // Assuming `formData.pic_path` contains the file
          let imagePath = null;
    
          if (imageFile) {
            imagePath = await handleImageUpload(imageFile, formData.venue_name); // Upload the image and get the path
          }
    
          const { data: venueData, error } = await supabase
            .from("venues")
            .insert({
              venue_name: formData.venue_name,
              address: formData.address,
              opening_hours: formData.opening_hours,
              happy_hours: formData.happy_hours,
              night_hours: formData.night_hours,
              morning_hours: formData.morning_hours,
              price: formData.price,
              drink_min_spend: formData.drink_min_spend,
              language: formData.language,
              playability: formData.playability,
              minimum_tips: formData.minimum_tips,
              venue_category_id: formData.venue_category_id,
              pic_path: imagePath, // Save the uploaded image path
              created_at: new Date().toISOString(),
              modified_at: new Date().toISOString(),  
            })
            .select()
            .single();
    
          if (error) throw error;
    
          const venueID = venueData.id;
    
          // Save related data (damage, menu, etc.)
          await handleSaveVenueDamage(venueID, formData.damage);
          await handleSaveVenueMenu(venueID, formData.menu);
    
          navigate("/admin/venues"); // Navigate back to the venue list page
        } catch (error) {
          console.error('Error saving venue:', error.message);
        }
      };
    
      const handleSaveVenueDamage = async (venueId, damage) => {
        try {
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
          console.error("Error saving venue damage:", error.message);
        }
      };
    
      const handleSaveVenueMenu = async (venueId, menu) => {
        try {
          if (menu.length > 0) {
            const venueMenu = menu.map((item) => ({
              venue_id: venueId,
              item_name: item.item_name,
              item_description: item.item_description,
              original_price: item.original_price,
              created_at: new Date().toISOString(),
              modified_at: new Date().toISOString(),  
            }));
    
            const { error } = await supabase.from("venue_menu").insert(venueMenu);
            console.log("what is the error?", error);
            if (error) throw error;
          }
        } catch (error) {
          console.error("Error saving venue menu:", error.message);
        }
      };

    const handleStepChange = (index, value) => {
        setFormData((prev) => ({
            ...prev,
            steps: prev.steps.map((step, i) =>
                i === index ? { ...step, description: value } : step
            ),
        }));
    };

    const addStep = () => {
        setFormData((prev) => ({
            ...prev,
            steps: [...prev.steps, { description: "" }],
        }));
    };

    const removeStep = (index) => {
        setFormData((prev) => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index),
        }));
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

      const handleImageUpload = async (file, venueName) => {
        try {
            const fileName = `${venueName}_${new Date().toISOString().replace(/[:.]/g, "-")}`;

          const { data, error } = await supabase.storage
                .from('venue_main') // Name of your bucket
                .upload(fileName, file, {
                cacheControl: '3600', // Optional: Cache control
                upsert: false, // Avoid overwriting
                });
      
          if (error) throw error;
      
          const imagePath = `venue_main/${data.path}`;
          return imagePath;
        } catch (error) {
          console.error("Error uploading image:", error.message);
        }
      };

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <h1>Create New Venue</h1>

            <div>
                <label>Venue Name:</label>
                <input
                    className="enhanced-input"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                    required
                />

                <label>Address:</label>
                <textarea
                    className="enhanced-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />

                <label>Category:</label>
                <select
                    id="venue_category"
                    value={formData.venue_category_id}
                    onChange={(e) => setFormData({ ...formData, venue_category_id: e.target.value })}
                    className="mt-1 block w-full bg-black text-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="">Select a category</option>
                    {venueCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.category_name}
                        </option>
                    ))}
                </select>

                <label>Happy Hours:</label>
                <input
                    className="enhanced-input"
                    type="text"
                    value={formData.happy_hours}
                    onChange={(e) => setFormData({ ...formData, happy_hours: e.target.value })}
                />

                <label>Night Hours:</label>
                <input
                    className="enhanced-input"
                    type="text"
                    value={formData.night_hours}
                    onChange={(e) => setFormData({ ...formData, night_hours: e.target.value })}
                />

                <label>Morning Hours:</label>
                <input
                    className="enhanced-input"
                    type="text"
                    value={formData.morning_hours}
                    onChange={(e) => setFormData({ ...formData, morning_hours: e.target.value })}
                />

                <label>Opening Hours:</label>
                <textarea
                    className="enhanced-input"
                    value={formData.opening_hours}
                    onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                />

                <label>Price:</label>
                <input
                    className="enhanced-input"
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />

                <label>Drink Min Spend:</label>
                <input
                    className="enhanced-input"
                    type="text"
                    value={formData.drink_min_spend}
                    onChange={(e) => setFormData({ ...formData, drink_min_spend: e.target.value })}
                />

                <label>Image: (only file with &lt; 1mb allowed)</label>
                <input
                    className="enhanced-input"
                    type="file"
                    onChange={(e) => setFormData({ ...formData, pic_path: e.target.files[0] })}
                />
            </div>

            {/* Tabs Navigation */}
            <div style={{ display: "flex", marginBottom: "20px" }}>
                {["General Info", "Steps", "Media"].map((tab, index) => (
                <div
                    key={index}
                    onClick={() => handleTabChange(index)}
                    style={{
                    cursor: "pointer",
                    padding: "10px 20px",
                    backgroundColor: activeTab === index ? "#4CAF50" : "#f0f0f0",
                    color: activeTab === index ? "white" : "black",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginRight: "5px",
                    }}
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

                    <button
                        onClick={() => removeDamageGroup(index)}
                        style={{
                        background: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "5px 10px",
                        cursor: "pointer",
                        marginTop: "10px",
                        width: "15%",
                        }}
                    >
                        Remove Group
                    </button>
                    </div>
                ))}
                <button
                    onClick={addDamageGroup}
                    style={{
                    marginTop: "10px",
                    padding: "10px 20px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    width: "25%",
                    }}
                >
                    + Add Damage Group
                </button>
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
                            <button
                                onClick={() => removeMenuGroup(index)}
                                style={{
                                background: "#f44336",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "5px 10px",
                                cursor: "pointer",
                                marginTop: "10px",
                                width: "15%",
                                }}
                            >
                                Remove Menu Group
                            </button>
                            </div>
                        ))}
                        <button
                            onClick={addMenuGroup}
                            style={{
                            marginTop: "10px",
                            padding: "10px 20px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            width: "25%",
                            }}
                        >
                            + Add Menu Group
                        </button>
                </div>
            )}

            {activeTab === 2 && (
                <div style={{ marginTop: "20px" }}>
                    <h2>Image Upload</h2>

                    {/* Promotions Upload */}
                    <div style={{ marginBottom: "20px" }}>
                    </div>

                    {/* Gallery Upload */}
                    <div>
                        <label>Gallery: (only files &lt;1MB allowed)</label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => handleFileUpload(e, "gallery")}
                            style={{ margin: "10px 0" }}
                        />
                        {formData.gallery.length > 0 && (
                            <div>
                                <h4>Selected Gallery Files:</h4>
                                <ul>
                                    {formData.gallery.map((file, index) => (
                                        <li key={index}>
                                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                            <button
                                                onClick={() => removeFile("gallery", index)}
                                                style={{
                                                    marginLeft: "10px",
                                                    color: "white",
                                                    backgroundColor: "#f44336",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    padding: "5px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}


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
                Save
            </button>
        </div>
    );
};

export default CreateVenue;
