import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const CreateRecommendedTag = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tag_name: '',
        tag_status: 'enabled',
        sequence_in_homepage: '',
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
          ...prevState,
          [name]: value
        }));
    };

    const handleStatusChange = (newStatus) => {
        setFormData(prevState => ({
            ...prevState,
            tag_status: newStatus
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let imageUrl = null;
            if (image) {

                const fileExt = image.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `recommended_tags/${fileName}`;

                const { data, error: uploadError } = await supabase.storage
                    .from('icons')
                    .upload(filePath, image, { upsert: true });

                if (uploadError) throw uploadError;

                imageUrl = filePath
            }

            const { error: recommendedTagError } = await supabase
                .from('recommended_tags')
                .insert([
                    {
                        tag_name: formData.tag_name,
                        status: formData.tag_status,
                        seq_in_homepage: Number(formData.sequence_in_homepage),
                        icon_url: imageUrl, // Storing the image URL
                    },
                ]);

            if (recommendedTagError) throw recommendedTagError;

            showToast('Recommended tag created successfully.', 'success');
            navigate('/admin/recommendedtags');
        } catch (error) {
            showToast('Failed to create recommended tag.', 'error');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/recommendedtags" />   
            <h2>Create New Recommended Tag</h2> 

            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label htmlFor="tag_name">Tag Name:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="tag_name"
                            name="tag_name"
                            value={formData.tag_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label htmlFor="sequence_in_homepage">Sequence on Homepage:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="sequence_in_homepage"
                            name="sequence_in_homepage"
                            value={formData.sequence_in_homepage}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Status:</label>
                        <div id="language-status-toggle">
                            <button
                                type="button"
                                onClick={() => handleStatusChange('enabled')}
                                style={{
                                    backgroundColor: formData.tag_status === 'enabled' ? 'green' : 'gray',
                                    color: 'white',
                                    padding: '10px 20px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    width: '45%',
                                }}
                            >
                                Enabled
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStatusChange('disabled')}
                                style={{
                                    backgroundColor: formData.tag_status === 'disabled' ? 'red' : 'gray',
                                    color: 'white',
                                    padding: '10px 20px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    width: '45%',
                                }}
                            >
                                Disabled
                            </button>
                        </div>
                    </div>

                    <div className="field-container">
                        <label>Upload Icon (Image):</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className='enhanced-input'
                            required
                        />
                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Preview" style={{ width: '300px', maxWidth: '100%' }} />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRecommendedTag;
