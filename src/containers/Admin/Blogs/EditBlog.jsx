import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from "react-select";
import supabase from '../../../config/supabaseClient';
import './EditBlog.css';
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

const EditBlog = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get the redeem item ID from the route parameters

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags_id: '',
        status: '',
        image_path: '',
    });
    const [tags, setTags] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    // Fetch blog when the component loads
    useEffect(() => {
        const fetchBlogTags = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('blog_tags')
                    .select('id, tag_name');
                if (fetchError) throw fetchError;
                // Convert Supabase data into a format compatible with react-select
                const formattedTags = data.map(tag => ({
                    value: tag.id, 
                    label: tag.tag_name 
                }));

                setTags(formattedTags);
            } catch (err) {
                console.error('Error fetching tags:', err);
            }
        };

        fetchBlogTags();
    }, []);

    // Fetch redeem item details when the component loads
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('blogs')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (fetchError) throw fetchError;

                setFormData({
                    title: data.title,
                    content: data.content,
                    tags_id: data.tags_id,
                    status: data.status,
                    image_path: data.image_path
                });
            } catch (err) {
                showToast(`Error fetching blog: ${err.message}`, 'error')
            }
        };

        fetchBlog();
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let newImageUrl = formData.image_path;

            // Upload new image if a new file is selected
            if (selectedImage) {
                const fileExt = selectedImage.name.split('.').pop();
                const fileName = `${id}_${Date.now()}.${fileExt}`;
                newImageUrl = `blog_image/${fileName}`;
    
                // Delete old image if it exists
                if (formData.image_path) {
                    const oldFileName = formData.image_path.split('/').pop();
                    await supabase.storage.from('blog_image').remove([`${oldFileName}`]);
                }
    
                // Upload the new image
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('blog_image')
                    .upload(fileName, selectedImage);
    
                if (uploadError) throw uploadError;
            }

            const { error: updateError } = await supabase
                .from('blogs')
                .update({
                    title: formData.title,
                    content: formData.content,
                    tags_id: formData.tags_id,
                    status: formData.status,
                    image_path: newImageUrl,
                    modified_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            navigate('/admin/blogs');
        } catch (error) {
            showToast(`Error updating blog: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/blogs" /> 
            <h2>Edit Blog</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Title:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                <div className="field-container">
                    <label>Content:</label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        className="enhanced-input"
                    ></textarea>
                </div>

                <div className="field-container">
                        <label>Tag:</label>
                        <Select
                            options={tags}
                            isMulti // Enable multi-select
                            value={tags.filter(option => formData.tags_id?.includes(option.value))}// Match selected values with formData
                            onChange={(selectedOptions) =>
                                setFormData({
                                ...formData,
                                tags_id: selectedOptions.map((option) => option.value), // Update formData with selected IDs
                                })
                            }
                            placeholder="Choose at least one recommended tag"
                            className="enhanced-input" // Optional styling customization
                        />
                </div>

                <div className="field-container">
                    <label htmlFor="itemImage">Blog Image:</label>
                    <input 
                        type="file" 
                        id="itemImage" 
                        name="itemImage" 
                        accept="image/*" 
                        onChange={(e) => setSelectedImage(e.target.files[0])} 
                        className="enhanced-input"
                    />
                </div>

                {formData.image_path && (
                    <div className="field-container">
                        <label>Current Image:</label>
                        <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${formData.image_path}`} alt="Current Item" className="preview-image" />
                    </div>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                </button>

                </div>
            </form>
        </div>
    );
};

export default EditBlog;
