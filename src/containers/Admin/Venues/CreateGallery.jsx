import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const CreateGallery = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [galleriesURL, setGalleriesURL] = useState([]);
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
        const fetchGalleries = async () => {
            try {
                const { data, error } = await supabase
                    .from("images_path")
                    .select("image_path")
                    .eq("venue_id", id)
                    .eq("type", "Gallery")
                    .single();

                if (error) throw error;

                const parsedImages = data?.image_path ? JSON.parse(data.image_path) : [];
                setGalleriesURL(parsedImages);
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
            // 1. Delete Images from Storage
            if (deletedImages.length > 0) {
                for (const imagePath of deletedImages) {
                    await supabase.storage.from("galleries").remove([imagePath]);
                }
            }

            // 2. Upload New Images
            const uploadedNewImages = [];
            for (const image of newImages) {
                const { data, error } = await supabase.storage
                    .from("galleries")
                    .upload(`${Date.now()}-${image.name}`, image);

                if (error) throw error;
                uploadedNewImages.push(data.path);
            }

            // 3. Replace Updated Images
            const updatedGallery = [...galleriesURL];
            for (const index in updatedImages) {
                const image = updatedImages[index].file;
                const { data, error } = await supabase.storage
                    .from("galleries")
                    .upload(`${Date.now()}-${image.name}`, image);

                if (error) throw error;
                updatedGallery[index] = data.path;
            }

            // 4. Save Final Image Paths
            const finalImagePaths = [...updatedGallery, ...uploadedNewImages];

            const { error } = await supabase
                .from("images_path")
                .update({ image_path: finalImagePaths })
                .eq("venue_id", id)
                .eq("type", "Gallery");

            if (error) throw error;

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
            <h2>Edit Gallery</h2>

            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Existing Gallery</label>
                        <div className="flex flex-wrap gap-4 mt-4 w-full max-w-[500px] border p-2">
                            {galleriesURL.map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={
                                            updatedImages[index]
                                                ? updatedImages[index].preview
                                                : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/galleries/${image}`
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

export default CreateGallery;
