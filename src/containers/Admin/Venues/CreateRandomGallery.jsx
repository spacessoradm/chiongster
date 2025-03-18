import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const CreateRandomGallery = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    // States
    const [galleriesURL, setGalleriesURL] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
    const [updatedImages, setUpdatedImages] = useState({});
    const [newImages, setNewImages] = useState([]);
    const [randNumber, setRandNumber] = useState("");  // NEW STATE for rand_number
    const [loading, setLoading] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchGalleries = async () => {
            try {
                const { data, error } = await supabase
                    .from("images_path")
                    .select("image_path, no_of_display")  // Fetch rand_number
                    .eq("venue_id", id)
                    .eq("type", "RandomGallery")
                    .single();

                if (error) throw error;

                const parsedImages = data?.image_path ? JSON.parse(data.image_path) : [];
                setGalleriesURL(parsedImages);
                setRandNumber(data?.no_of_display || "");  // Store rand_number
            } catch (error) {
                console.error("Error fetching gallery:", error.message);
            }
        };

        fetchGalleries();
    }, [id]);

    const handleDeleteImage = (index) => {
        const imageToDelete = galleriesURL[index];
        setDeletedImages((prev) => [...prev, imageToDelete]);

        const updatedGallery = galleriesURL.filter((_, i) => i !== index);
        setGalleriesURL(updatedGallery);
    };

    const handleReplaceImage = (index, file) => {
        const objectURL = URL.createObjectURL(file);
        setUpdatedImages((prev) => ({ ...prev, [index]: { file, preview: objectURL } }));
    };

    const handleNewImages = (e) => {
        const files = Array.from(e.target.files);
        const previews = files.map((file) => URL.createObjectURL(file));
        setNewImages((prev) => [...prev, ...files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            // 1. Check if the record exists
            const { data: existingRecord, error: fetchError } = await supabase
                .from("images_path")
                .select("id")
                .eq("venue_id", id)
                .eq("type", "RandomGallery")
                .single();
    
            if (fetchError && fetchError.code !== "PGRST116") throw fetchError; 
    
            // 2. Delete Images from Storage
            if (deletedImages.length > 0) {
                for (const imagePath of deletedImages) {
                    await supabase.storage.from("random_galleries").remove([imagePath]);
                }
            }
    
            // 3. Upload New Images
            const uploadedNewImages = [];
            for (const image of newImages) {
                const { data, error } = await supabase.storage
                    .from("random_galleries")
                    .upload(`${Date.now()}-${image.name}`, image);
    
                if (error) throw error;
                uploadedNewImages.push(data.path);
            }
    
            // 4. Replace Updated Images
            const updatedGallery = [...galleriesURL];
            for (const index in updatedImages) {
                const image = updatedImages[index].file;
                const { data, error } = await supabase.storage
                    .from("random_galleries")
                    .upload(`${Date.now()}-${image.name}`, image);
    
                if (error) throw error;
                updatedGallery[index] = data.path;
            }
    
            // 5. Save Final Image Paths & rand_number
            const finalImagePaths = [...updatedGallery, ...uploadedNewImages];
    
            if (existingRecord) {
                // Update existing record
                const { error } = await supabase
                    .from("images_path")
                    .update({ image_path: finalImagePaths, no_of_display: randNumber })  // Store rand_number
                    .eq("venue_id", id)
                    .eq("type", "RandomGallery");
    
                if (error) throw error;
            } else {
                // Insert new record
                const { error } = await supabase
                    .from("images_path")
                    .insert([{ venue_id: id, type: "RandomGallery", image_path: finalImagePaths, no_of_display: randNumber }]);
    
                if (error) throw error;
            }
    
            showToast("Gallery updated successfully.", "success");
            navigate("/admin/venues");
        } catch (error) {
            showToast("Failed to update gallery.", "error");
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-venue-category-container">
            <BackButton to="/admin/venues" />
            <h2>Edit Random Gallery</h2>

            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        
                        <div className="flex flex-wrap gap-4 mt-4 w-full max-w-[500px] border p-2">
                            <div className="flex field-container" style={{ paddingTop: '12px', paddingBottom: '12px'}}>
                                <label>Number of Display</label>
                                <input
                                    type="text"
                                    value={randNumber}  // Show rand_number
                                    onChange={(e) => setRandNumber(e.target.value)}
                                    className="enhanced-input"
                                />
                            </div>

                            <label>Existing Gallery</label>
                            {galleriesURL.map((image, index) => (
                                <div key={index} className="relative">

                                    <img
                                        src={
                                            updatedImages[index]
                                                ? updatedImages[index].preview
                                                : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/random_galleries/${image}`
                                        }
                                        alt={`Gallery ${index + 1}`}
                                        className="rounded-lg object-cover"
                                        style={{ width: "150px", height: "150px" }}
                                    />

                                    <div className="flex items-center justify-between w-full">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleReplaceImage(index, e.target.files[0])}
                                            className="hidden enhanced-input"
                                            style={{ width: "50%" }}
                                            id={`replace-${index}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(index)}
                                            className="text-red-500 text-sm"
                                            style={{ width: "50px" }}
                                        >
                                            x
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRandomGallery;
