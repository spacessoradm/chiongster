import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from "react-select";
import supabase from '../../../config/supabaseClient';

import './CreateBlog.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import CreateBlogImage from '../../../components/Input/ImageUpload/CreateBlogImage';

const CreateBlog = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags_id: '',
        status: '',
        image_path: '',
    });
    const [blogTags, setBlogTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchBlogTags = async () => {
            try {

                const { data: blogTagsData, error: blogTagsDataError } = 
                    await supabase.from("blog_tags").select("*").eq("status", 'enabled');
                if (blogTagsDataError) throw blogTagsDataError;
                setBlogTags(
                    blogTagsData.map((tag) => ({
                        value: tag.id,
                        label: tag.tag_name,
                    }))
                );
            } catch (err) {
                showToast(`Error fetching blog tags: ${err.message}`, 'error')
            }
        };

        fetchBlogTags();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log(formData.image_path);

        try {
            const { error: blogError } = await supabase
                .from('blogs')
                .insert([
                    {
                        title: formData.title,
                        content: formData.content,
                        tags_id: formData.tags_id,
                        publisher_id: 0, 
                        image_path: formData.image_path,
                        created_at: new Date().toISOString(),
                        modified_at: new Date().toISOString(),
                    },
                ]);

            if (blogError) throw blogError;

            showToast('Blog created successfully.', 'success')
            navigate('/admin/blogs');
        } catch (error) {
            showToast(`Failed to create blog: ${error.message}`, 'error')
            //setError();
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (url) => {
        setFormData((prev) => ({ ...prev, image_path: url }));
      };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/blogs" />   
            <h2>Create New Blog</h2> 

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
                        <label htmlFor="categoryDescription">Content:</label>
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
                            options={blogTags} // Pass the fetched languages
                            isMulti // Enable multi-select
                            value={blogTags.filter((option) =>
                                (formData.tags_id || []).includes(option.value)
                            )} // Match selected values with formData
                            onChange={(selectedOptions) =>
                                setFormData({
                                ...formData,
                                tags_id: selectedOptions.map((option) => option.value), // Update formData with selected IDs
                                })
                            }
                            placeholder="Choose at least one recommended tag"
                            className="mt-1 block w-full text-black"
                            classNamePrefix="react-select" // Optional styling customization
                        />
                    </div>

                    <CreateBlogImage onUpload={handleImageUpload} />


                    <button type="submit" className="create-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateBlog;
