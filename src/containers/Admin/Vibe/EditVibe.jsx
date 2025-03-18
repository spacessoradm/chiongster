import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import "./index.css";
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from "../../../components/Toast";
import PlainInput from "../../../components/Input/PlainInput";
import TextArea from "../../../components/Input/TextArea";

const BUCKET_NAME = "your-bucket-name"; // Change this to your Supabase bucket

const EditVibe = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [seqInMenu, setSeqInMenu] = useState("");
    const [imagePath, setImagePath] = useState(""); // Stores the existing image URL
    const [imageFile, setImageFile] = useState(null); // Stores the new image file
    const [toastInfo, setToastInfo] = useState({ visible: false, message: "", type: "" });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: "", type: "" }), 3000);
    };

    useEffect(() => {
        const fetchVibeData = async () => {
            try {
                const { data: vibeData, error: vibeError } = await supabase
                    .from("vibe")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (vibeError) throw vibeError;

                setName(vibeData.vibe_name);
                setDescription(vibeData.description);
                setSeqInMenu(vibeData.seq_in_menu);
                setImagePath(vibeData.image_path || ""); // Set existing image if available
            } catch (error) {
                console.error("Error fetching vibe data:", error.message);
            }
        };

        fetchVibeData();
    }, [id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePath(URL.createObjectURL(file)); // Show preview before upload
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        const fileName = `vibes/${id}-${Date.now()}.${imageFile.name.split('.').pop()}`;
        const { data, error } = await supabase.storage
            .from('vibes')
            .upload(fileName, imageFile, { cacheControl: "3600", upsert: true });

        if (error) {
            console.error("Error uploading image:", error.message);
            showToast("Failed to upload image.", "error");
            return null;
        }

        return fileName; // Return the new uploaded image path
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newImagePath = imagePath;

        if (imageFile) {
            const uploadedImagePath = await uploadImage();
            if (uploadedImagePath) {
                newImagePath = uploadedImagePath;
            }
        }

        try {
            const { error: updateError } = await supabase
                .from("vibe")
                .update({
                    vibe_name: name,
                    description: description,
                    seq_in_menu: seqInMenu,
                    Image_Path: newImagePath, // Save new image path
                })
                .eq("id", id);

            if (updateError) throw updateError;

            showToast("Vibe updated successfully.", "success");
            navigate("/admin/vibe");
        } catch (error) {
            console.error("Error updating vibe:", error.message);
            showToast("Failed to update vibe.", "error");
        }
    };

    return (
        <div className="edit-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/vibe" />
            <h2>Edit Vibe</h2>

            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <PlainInput
                        label="Vibe Name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <TextArea
                        label="Vibe Description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <PlainInput
                        label="Seq in Menu"
                        name="seqInMenu"
                        value={seqInMenu}
                        onChange={(e) => setSeqInMenu(e.target.value)}
                    />

                    {/* Image Upload Field */}
                    <label>Upload Image:</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />

                    {/* Image Preview */}
                    {imagePath && (
                        <div>
                            <p>Image Preview:</p>
                            <img
                                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${imagePath}`}
                                alt="Preview"
                                style={{ width: "200px", height: "auto", marginTop: "10px", borderRadius: "5px" }}
                            />
                        </div>
                    )}

                    <button type="submit" className="submit-btn">Submit</button>
                </div>
            </form>
        </div>
    );
};

export default EditVibe;
