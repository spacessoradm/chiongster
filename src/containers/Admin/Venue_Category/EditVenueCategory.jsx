import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import "./index.css";
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from "../../../components/Toast";
import PlainInput from "../../../components/Input/PlainInput";
import TextArea from "../../../components/Input/TextArea";

const BUCKET_NAME = "venue_category_images"; // Your Supabase storage bucket name

const EditVenueCategory = () => {
    const { id } = useParams();
    const [venueCategory, setVenueCategory] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [seqInMenu, setSeqInMenu] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(""); // Holds the preview of the new image
    const navigate = useNavigate();
    const [toastInfo, setToastInfo] = useState({ visible: false, message: "", type: "" });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: "", type: "" }), 3000);
    };

    useEffect(() => {
        const fetchVenueCategoryData = async () => {
            try {
                const { data, error } = await supabase
                    .from("venue_category")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;

                setVenueCategory(data);
                setName(data.category_name);
                setDescription(data.description);
                setSeqInMenu(data.seq_in_menu);
                setImageUrl(data.Image_Path);
            } catch (error) {
                console.error("Error fetching venue category:", error.message);
            }
        };

        fetchVenueCategoryData();
    }, [id]);

    const handleImageChange = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Generate a temporary preview URL
        }
    };

    const uploadImageAndUpdateUrl = async () => {
        if (!imageFile) return imageUrl; // No new image, return existing URL

        try {
            // Delete old image if exists
            if (imageUrl) {
                const oldFileName = imageUrl.split("/").pop(); // Extracts filename from URL
                const oldFilePath = `categories/${oldFileName}`; // Full path inside Supabase storage
                await supabase.storage.from("venue_main").remove([oldFilePath]);
            }

            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `categories/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('venue_main')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            //const newImageUrl = `${supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName).data.publicUrl}`;
            return filePath;
        } catch (error) {
            console.error("Image upload error:", error.message);
            showToast("Failed to upload image.", "error");
            return imageUrl; // Return old image URL if upload fails
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const newImageUrl = await uploadImageAndUpdateUrl();

            const { error } = await supabase
                .from("venue_category")
                .update({
                    category_name: name,
                    description: description,
                    seq_in_menu: seqInMenu,
                    Image_Path: newImageUrl,
                })
                .eq("id", id);

            if (error) throw error;

            showToast("Venue category updated successfully.", "success");
            navigate("/admin/venuecategory");
        } catch (error) {
            console.error("Error updating venue category:", error.message);
            showToast("Failed to update venue category.", "error");
        }
    };

    return (
        <div className="edit-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/venuecategory" />
            <h2>Edit Venue Category</h2>

            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <PlainInput label="Category Name" name="name" value={name} onChange={(e) => setName(e.target.value)} />

                    <TextArea label="Category Description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />

                    <PlainInput label="Seq in Menu" name="seqInMenu" value={seqInMenu} onChange={(e) => setSeqInMenu(e.target.value)} />

                    {/* Current Image Preview */}
                    {imageUrl && !previewUrl && (
                        <div>
                            <p>Current Image:</p>
                            <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/venue_main/${imageUrl}`} alt="Current Category" className="preview-image" style={{ width: "400px" }}/>
                        </div>
                    )}

                    {/* New Image Preview */}
                    {previewUrl && (
                        <div className="enhanced-input">
                            <p>New Image Preview:</p>
                            <img src={previewUrl} alt="New Category" className="preview-image" style={{ width: "400px" }} />
                        </div>
                    )}

                    {/* Image Upload */}
                    <label className="file-upload">
                        <span>Upload New Image</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="enhanced-input" />
                    </label>

                    <button type="submit" className="submit-btn">Submit</button>
                </div>
            </form>
        </div>
    );
};

export default EditVenueCategory;
