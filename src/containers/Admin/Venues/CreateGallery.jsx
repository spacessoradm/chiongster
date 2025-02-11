import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './CreateGallery.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const CreateGallery = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        image_path: null,
        venue_id: null,
    });
    const [galleriesURL, setGalleriesURL] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewImages, setPreviewImages] = useState([]);

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchGalleries = async () => {
            try {
                const { data: galleriesURL, error: galleriesURLError } = await supabase
                    .from("images_path")
                    .select("image_path")
                    .eq("venue_id", id)
                    .eq("type", "Gallery")
                    .single();

                if (galleriesURLError) throw galleriesURLError;

                const parsedImages = galleriesURL?.image_path ? JSON.parse(galleriesURL.image_path) : [];

                if (parsedImages.length > 0){
                    
                    setGalleriesURL(parsedImages);
                }
            } catch (error) {
                console.error("Error fetching gallery:", error.message);
            }
        };

        fetchGalleries();
    }, [id]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        // Update preview images
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(previews);

        // Update formData with file objects
        setFormData({ ...formData, images: files });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
            let shouldDelete = false;
    
            // Check if existing images are present
            if (galleriesURL.length > 0) {
                shouldDelete = window.confirm(
                    "Existing images will be replaced. Click 'OK' to delete existing images before adding new ones, or 'Cancel' to keep them."
                );
            }
    
            // If the user selects "Yes", delete existing images
            if (shouldDelete) {
                for (const imagePath of galleriesURL) {
                    const { error: deleteError } = await supabase.storage
                        .from("galleries")
                        .remove([imagePath]);
    
                    if (deleteError) throw deleteError;
                }
    
                // Clear existing images in the database
                const { error: deleteDBError } = await supabase
                    .from("images_path")
                    .delete()
                    .eq("venue_id", id)
                    .eq("type", "Gallery");
    
                if (deleteDBError) throw deleteDBError;
            }
    
            // Upload new images
            const uploadedImagePaths = [];
            if (formData.images && formData.images.length > 0) {
                for (const image of formData.images) {
                    const { data, error: uploadError } = await supabase.storage
                        .from("galleries")
                        .upload(`${Date.now()}-${image.name}`, image);
    
                    if (uploadError) throw uploadError;
    
                    uploadedImagePaths.push(data.path); // Store uploaded image path
                }
            }
    
            console.log(uploadedImagePaths);
    
            // If keeping old images, merge them
            const finalImagePaths = shouldDelete ? uploadedImagePaths : [...galleriesURL, ...uploadedImagePaths];
    
            console.log(finalImagePaths);
            if (galleriesURL.length > 0 && !shouldDelete) {
                const { error: updateError } = await supabase
                    .from("images_path")
                    .update({ image_path: finalImagePaths }) // Update image_path
                    .eq("venue_id", id)
                    .eq("type", "Gallery"); // Update specific record

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("images_path")
                    .insert([
                        {
                            type: "Gallery",
                            venue_id: id,
                            image_path: finalImagePaths,
                        },
                    ]);

                    if (insertError) throw insertError;
            }
    
            showToast("Gallery image added successfully.", "success");
    
            navigate("/admin/venues");
        } catch (error) {
            showToast("Failed to add gallery image.", "error");
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="create-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/venues" />   
            <h2>Add New Gallery Slide</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">

                <div className="field-container">
                    <label>Existing Gallery</label>
                    <div className="flex flex-wrap gap-4 mt-4 w-full max-w-[500px] border p-2">
                        {galleriesURL.map((image, index) => (
                            <img
                                key={index}
                                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/galleries/${image}`}
                                alt={`Gallery ${index + 1}`}
                                className="rounded-lg object-cover"
                                style={{ width: "150px", height: "150px" }}
                            />
                        ))}
                    </div>
                </div>

                    <div className="field-container">
                        <label>Upload Your Gallery Stuff here:</label>
                        <input
                            type="file"
                            id="images"
                            name="images"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            required
                        />

                        {/* Image Previews */}
                        <div className="flex flex-wrap gap-4 mt-4 w-full max-w-[500px] border p-2">
                            {previewImages.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`Preview ${index + 1}`}
                                    className="rounded-lg object-cover inline-block"
                                    style={{ width: "500px", height: "500px" }}
                                />
                            ))}
                        </div>

                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Add Gallery'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateGallery;
