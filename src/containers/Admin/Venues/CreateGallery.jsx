import React, { useState } from 'react';
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewImages, setPreviewImages] = useState([]);

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

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

            const uploadedImagePaths = [];

            if (formData.images && formData.images.length > 0) {
                for (const image of formData.images) {
                    const { data, error: uploadError } = await supabase.storage
                        .from('galleries')
                        .upload(`${Date.now()}-${image.name}`, image);

                    if (uploadError) throw uploadError;

                    uploadedImagePaths.push(data.path); // Store uploaded image path
                }
            }

            setFormData({ ...formData, image_path: uploadedImagePaths });

        
            const { error: bannerError } = await supabase
                .from('images_path')
                .insert([
                    {
                        type: 'Gallery',
                        venue_id: id,
                        image_path: uploadedImagePaths,
                    },
                ]);


            if (bannerError) throw bannerError;

            showToast('Gallery image added successfully.', 'success')

            // Navigate back to the venue categories list after successful creation
            navigate('/admin/venues');
        } catch (error) {
            showToast('Failed to add gallery image.', 'error')
            console.error(error.message)
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
                        <div className="flex flex-wrap gap-4 mt-4">
                            {previewImages.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`Preview ${index + 1}`}
                                    className="h-24 w-24 rounded-lg object-cover"
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
