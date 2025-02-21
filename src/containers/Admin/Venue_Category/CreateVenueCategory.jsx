import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';

const CreateVenueCategory = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        categoryName: '',
        categoryDescription: '',
        seqInMenu: '',
    });
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    const handleChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value
        }));
    };
    
    

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const uploadImage = async () => {
        if (!image) return null;

        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `categories/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('venue_main')
            .upload(filePath, image);

        if (uploadError) throw uploadError;

        return filePath;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Upload the image and get the file path
            const imagePath = await uploadImage();

            // Insert new category into the 'venue_category' table
            const { error: categoryError } = await supabase
                .from('venue_category')
                .insert([
                    {
                        category_name: formData.categoryName,
                        description: formData.categoryDescription,
                        seq_in_menu: formData.seqInMenu,
                        Image_Path: imagePath ? imagePath : null,
                    },
                ]);

            if (categoryError) throw categoryError;

            showToast('Venue category created successfully.', 'success');

            navigate('/admin/venuecategory');
        } catch (error) {
            showToast('Failed to create venue category.', 'error');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/venuecategory" />   
            <h2>Create New Venue Category</h2> 

            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <PlainInput 
                        label="Category Name"
                        value={formData.categoryName}
                        onChange={(e) => handleChange('categoryName', e.target.value)}
                        required
                    />

                    <TextArea 
                        label="Category Description"
                        value={formData.categoryDescription}
                        onChange={(e) => handleChange('categoryDescription', e.target.value)}
                    />

                    <PlainInput 
                        label="Seq in Menu"
                        value={formData.seqInMenu}
                        onChange={(e) => handleChange('seqInMenu', e.target.value)}
                    />

                    <label>Upload Image</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />

                    {previewUrl && (
                        <div>
                            <p>Preview:</p>
                            <img src={previewUrl} alt="Preview" style={{ width: '150px', height: '150px', objectFit: 'cover', marginTop: '10px' }} />
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateVenueCategory;
