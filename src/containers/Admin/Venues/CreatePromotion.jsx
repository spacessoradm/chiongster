import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const AddPromotion = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [promotionsURL, setPromotionsURL] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
    const [updatedImages, setUpdatedImages] = useState({});
    const [newImages, setNewImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const { data, error } = await supabase
                    .from("images_path")
                    .select("image_path")
                    .eq("venue_id", id)
                    .eq("type", "Promotion")
                    .single();

                if (error) throw error;

                const parsedImages = data?.image_path ? JSON.parse(data.image_path) : [];
                setPromotionsURL(parsedImages);
            } catch (error) {
                console.error("Error fetching promotion images:", error.message);
            }
        };

        fetchPromotions();
    }, [id]);

    const handleDeleteImage = (index) => {
        const imageToDelete = promotionsURL[index];
        setDeletedImages((prev) => [...prev, imageToDelete]);

        const updatedPromotions = promotionsURL.filter((_, i) => i !== index);
        setPromotionsURL(updatedPromotions);
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
            // 1. Delete Images from Storage
            if (deletedImages.length > 0) {
                for (const imagePath of deletedImages) {
                    await supabase.storage.from("promotions").remove([imagePath]);
                }
            }

            // 2. Upload New Images
            const uploadedNewImages = [];
            for (const image of newImages) {
                const { data, error } = await supabase.storage
                    .from("promotions")
                    .upload(`${Date.now()}-${image.name}`, image);

                if (error) throw error;
                uploadedNewImages.push(data.path);
            }

            // 3. Replace Updated Images
            const updatedPromotions = [...promotionsURL];
            for (const index in updatedImages) {
                const image = updatedImages[index].file;
                const { data, error } = await supabase.storage
                    .from("promotions")
                    .upload(`${Date.now()}-${image.name}`, image);

                if (error) throw error;
                updatedPromotions[index] = data.path;
            }

            // 4. Save Final Image Paths
            const finalImagePaths = [...updatedPromotions, ...uploadedNewImages];

            const { error } = await supabase
                .from("images_path")
                .update({ image_path: finalImagePaths })
                .eq("venue_id", id)
                .eq("type", "Promotion");

            if (error) throw error;

            showToast("Promotion updated successfully.", "success");
            navigate("/admin/venues");
        } catch (error) {
            showToast("Failed to update promotion.", "error");
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-venue-category-container">
            <BackButton to="/admin/venues" />
            <h2>Edit Promotion</h2>

            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Existing Promotion</label>
                        <div className="flex flex-wrap gap-4 mt-4 w-full max-w-[500px] border p-2">
                            {promotionsURL.map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={
                                            updatedImages[index]
                                                ? updatedImages[index].preview
                                                : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/promotions/${image}`
                                        }
                                        alt={`Promotion ${index + 1}`}
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

                    <div className="field-container">
                        <label>Add New Images:</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleNewImages}
                            className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-lg file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />

                        <div className="flex flex-wrap gap-4 mt-4 w-full max-w-[500px] border p-2">
                            {newImages.map((image, index) => (
                                <img
                                    key={index}
                                    src={URL.createObjectURL(image)}
                                    alt={`Preview ${index + 1}`}
                                    className="rounded-lg object-cover"
                                    style={{ width: "150px", height: "150px" }}
                                />
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

export default AddPromotion;

