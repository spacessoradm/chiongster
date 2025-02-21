import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
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
        tags_id: [],
        image_path: '',
    });

    const [blogTags, setBlogTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };


    useEffect(() => {
        setFormData(prevState => ({
            ...prevState,
            content: prevState.content || '' // Ensure default state
        }));
    }, []);
    

    useEffect(() => {
        const fetchBlogTags = async () => {
            try {
                const { data, error } = await supabase
                    .from("blog_tags")
                    .select("*")
                    .eq("status", 'enabled');
                
                if (error) throw error;

                setBlogTags(data.map(tag => ({
                    value: tag.id,
                    label: tag.tag_name,
                })));
            } catch (err) {
                showToast(`Error fetching blog tags: ${err.message}`, 'error');
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

    const handleContentChange = (value) => {
        setFormData((prev) => ({ ...prev, content: value }));
    };
    
    

    const handleImageUpload = async () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `blogcontent/${fileName}`;

            let { error } = await supabase.storage.from('blogcontent').upload(filePath, file);

            if (error) {
                showToast(`Image upload failed: ${error.message}`, 'error');
                return;
            }

            const { data } = supabase.storage.from('blogcontent').getPublicUrl(filePath);
            if (data) {
                const url = data.publicUrl;
                const quill = document.querySelector('.ql-editor');
                const range = quill.getSelection();
                quill.insertEmbed(range.index, 'image', url);
            }
        };
    };

    const quillModules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],  // Image upload button
                ['clean']
            ],
            handlers: {
                image: handleImageUpload
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('blogs')
                .insert([
                    {
                        title: formData.title,
                        content: formData.content,  // Stored as HTML
                        tags_id: formData.tags_id,
                        image_path: formData.image_path,
                        created_at: new Date().toISOString(),
                        modified_at: new Date().toISOString(),
                    },
                ]);

            if (error) throw error;

            showToast('Blog created successfully.', 'success');
            navigate('/admin/blogs');
        } catch (error) {
            showToast(`Failed to create blog: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/blogs" />
            <h2>Create New Blog</h2>

            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Title:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Tag:</label>
                        <Select
                            options={blogTags}
                            isMulti
                            value={blogTags.filter(option => formData.tags_id.includes(option.value))}
                            onChange={(selectedOptions) =>
                                setFormData({
                                    ...formData,
                                    tags_id: selectedOptions.map(option => option.value),
                                })
                            }
                            placeholder="Choose at least one tag"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div className="field-container">
                        <label>Content:</label>
                        <ReactQuill
                            theme="snow"
                            value={formData.content}  // Controlled component
                            onChange={handleContentChange}
                            modules={{
                                toolbar: [
                                    [{ header: [1, 2, false] }],
                                    ["bold", "italic", "underline"],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["link", "image"],
                                ],
                            }}
                            formats={[
                                "header",
                                "bold",
                                "italic",
                                "underline",
                                "list",
                                "bullet",
                                "link",
                                "image",
                            ]}
                            className="enhanced-input"
                        />
                    </div>


                    <CreateBlogImage onUpload={(url) => setFormData({ ...formData, image_path: url })} />

                    <button type="submit" className="create-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateBlog;
