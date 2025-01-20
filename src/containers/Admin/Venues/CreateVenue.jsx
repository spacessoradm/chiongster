import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../config/supabaseClient";
import SortableIngredientList from "../../../components/SortableDragAndDrop/Ingredient_List";

const CreateVenue = () => {
    const navigate = useNavigate();
    const [venueCategories, setVenueCategories] = useState([]);

    const [activeTab, setActiveTab] = useState(0);
    const [stepsData, setStepsData] = useState({
        tab1: { name: "" },
        tab2: { option: "", description: "" },
        tab3: { images: [] },
    });


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
        category_ids: [], // Now an array
        tag_ids: [],
        equipment_ids: [],
        damage: [{ title: "", pax: "", min_spend: "", amenities: "", happy_hours: "", night_hours: "", morning_hours: "" }],
        menu: [{ item_name: "", item_description: "", original_price: "", discounted_price: "" }],
        gallery: [{ title: "", type: "", path: null }],
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
          const imageFile = formData.image; // Assuming `formData.image` contains the file
          let imagePath = null;
      
          if (imageFile) {
            imagePath = await handleImageUpload(imageFile, formData.name); // Pass the recipe name
          }
      
          // Save the venue, including the imagePath
          const { data: venueData, error } = await supabase
            .from('venues')
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
              pic_path: pic_path,
              created_at: new Date().toISOString(),
              modified_at: new Date().toISOString(), // Save the uploaded image path
            })
            .select()
            .single();
      
          if (error) throw error;

          const venueID = venueData.id;

          console.log('Venue id:', venueID);
          // Save related data
          await handleSaveVenueDamage(venueID, formData.damages);

      
          console.log('Venue saved successfully:', venueData);

          
          navigate("/admin/venues"); // Navigate back to the recipe list
        } catch (error) {
          console.error('Error saving recipe:', error.message);
        }
      };
        
    const handleSaveVenueDamage = async (venueId, damage) => {
        try {
            if (damage.length > 0) {
                const venueDamages = damage.map((damage, index) => ({
                    venue_id: venueId,
                    title: damage.title,
                    pax: damage.pax,
                    min_spend: damage.min_spend,
                    amenities: damage.amenities,
                    happy_hours: damage.happy_hours,
                    night_hours: damage.night_hours,
                    morning_hours: damage.morning_hours,
                    created_at: Date.now(),
                    updated_at: Date.now(),
                }));
    
                const { error } = await supabase.from("venue_damage").insert(venueDamages);
                if (error) throw error;
    
            }
        } catch (error) {
            console.error("Error saving venue damage:", error.message);
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

    /* Tab 1: Venue Damage */
    

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <h1>Create New Venue</h1>

            <div>
                <label>Venue Name:</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
                />

                <label>Address:</label>
                <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
                />

                <label>Happy Hours:</label>
                <input
                    type="text"
                    value={formData.happy_hours}
                    onChange={(e) => setFormData({ ...formData, happy_hours: e.target.value })}
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
                />

                <label>Night Hours:</label>
                <input
                    type="text"
                    value={formData.night_hours}
                    onChange={(e) => setFormData({ ...formData, night_hours: e.target.value })}
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
                />

                <label>Morning Hours:</label>
                <input
                    type="text"
                    value={formData.morning_hours}
                    onChange={(e) => setFormData({ ...formData, morning_hours: e.target.value })}
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
                />

                <label>Opening Hours:</label>
                <textarea
                    value={formData.opening_hours}
                    onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
                />

                <label>Price:</label>
                <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
                />

                <label>Drink Min Spend:</label>
                <input
                    type="text"
                    value={formData.drink_min_spend}
                    onChange={(e) => setFormData({ ...formData, drink_min_spend: e.target.value })}
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
                />

                <label>Image: (only file with &lt;1mb allowed)</label>
                <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, pic_path: e.target.files[0] })}
                />
            </div>

            {/* Tabs Navigation */}
            <div style={{ display: "flex", marginBottom: "20px" }}>
                {["General Info", "Steps", "Media"].map((tab, index) => (
                    <div
                        key={index}
                        onClick={() => setActiveTab(index)}
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

            {/* Tabs Content */}
            {activeTab === 0 && (
            <div>
                <h2>Damage Details</h2>
                {formData.damage.map((venue, index) => (
                <div
                    key={index}
                    style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "5px",
                    }}
                >
                    <label>Title:</label>
                    <input
                    type="text"
                    value={formData.damage.title}
                    onChange={(e) =>
                        handleDamageChange(index, "title", e.target.value)
                    }
                    required
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
                    />

                    <label>Number of Pax:</label>
                    <input
                    type="number"
                    value={formData.damage}
                    onChange={(e) => handleDamageChange(index, "pax", e.target.value)}
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
                    />

                    <label>Min Spend:</label>
                    <input
                    type="number"
                    value={formData.damage.minSpend}
                    onChange={(e) =>
                        handleDamageChange(index, "minSpend", e.target.value)
                    }
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
                    />

                    <label>Amenities:</label>
                    <textarea
                    value={formData.damage.amenities}
                    onChange={(e) =>
                        handleDamageChange(index, "amenities", e.target.value)
                    }
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
                    />

                    <label>Happy Hours:</label>
                    <input
                    type="text"
                    value={formData.damage.happyHours}
                    onChange={(e) =>
                        handleDamageChange(index, "happyHours", e.target.value)
                    }
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
                    />

                    <label>Night Hours:</label>
                    <input
                    type="text"
                    value={formData.damage.nightHours}
                    onChange={(e) =>
                        handleDamageChange(index, "nightHours", e.target.value)
                    }
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
                    />

                    <label>Morning Hours:</label>
                    <input
                    type="text"
                    value={formData.damage.morningHours}
                    onChange={(e) =>
                        handleDamageChange(index, "morningHours", e.target.value)
                    }
                    style={{ width: "100%", margin: "5px 0", padding: "10px" }}
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
                }}
                >
                + Add Damage
                </button>
            </div>
            )}


            {activeTab === 1 && (
                <div style={{ marginTop: "20px" }}>
                    <h2>Steps</h2>
                    {formData.steps.map((step, index) => (
                        <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                            <textarea
                                value={step.description}
                                onChange={(e) => handleStepChange(index, e.target.value)}
                                placeholder={`Step ${index + 1}`}
                                style={{
                                    width: "90%",
                                    padding: "10px",
                                    borderRadius: "5px",
                                    border: "1px solid #ccc",
                                    marginRight: "10px",
                                }}
                            />
                            <button
                                onClick={() => removeStep(index)}
                                style={{
                                    background: "#f44336",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "5px 10px",
                                    cursor: "pointer",
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addStep}
                        style={{
                            marginTop: "10px",
                            padding: "10px 20px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        + Add 
                    </button>
                </div>
            )}

            {activeTab === 2 && (
                <div>
                    <label>Image: (only file with &lt;1mb allowed)</label>
                    <input
                        type="file"
                        onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                        style={{ margin: "10px 0" }}
                    />
                    {formData.image && (
                        <div>
                            <p>Selected File: {formData.image.name}</p>
                        </div>
                    )}
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
                Save Recipe
            </button>
        </div>
    );
};

export default CreateVenue;
