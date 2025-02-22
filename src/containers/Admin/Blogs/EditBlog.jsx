import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import supabase from "../../../config/supabaseClient";
import "./index.css";
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from "../../../components/Toast";

const EditBlog = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        tags_id: [],
        status: "",
        image_path: "",
    });

    const [tags, setTags] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: "", type: "" });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: "", type: "" }), 3000);
    };

    // Fetch Blog Tags
    useEffect(() => {
        const fetchBlogTags = async () => {
            try {
                const { data, error } = await supabase.from("blog_tags").select("id, tag_name");
                if (error) throw error;

                setTags(data.map(tag => ({ value: tag.id, label: tag.tag_name })));
            } catch (err) {
                console.error("Error fetching tags:", err);
            }
        };

        fetchBlogTags();
    }, []);

    // Fetch Blog Details
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const { data, error } = await supabase.from("blogs").select("*").eq("id", id).single();
                if (error) throw error;

                setFormData({
                    title: data.title,
                    content: data.content,
                    tags_id: data.tags_id || [],
                    status: data.status,
                    image_path: data.image_path,
                });
            } catch (err) {
                showToast(`Error fetching blog: ${err.message}`, "error");
            }
        };

        fetchBlog();
    }, [id]);

    // Handle Input Change
    const handleChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Handle Content Change
    const handleContentChange = value => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    // Handle Form Submission
    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        try {
            let newImageUrl = formData.image_path;

            if (selectedImage) {
                const fileExt = selectedImage.name.split(".").pop();
                const fileName = `${id}_${Date.now()}.${fileExt}`;
                newImageUrl = `blog_image/${fileName}`;

                if (formData.image_path) {
                    const oldFileName = formData.image_path.split("/").pop();
                    await supabase.storage.from("blog_image").remove([`${oldFileName}`]);
                }

                const { error: uploadError } = await supabase.storage.from("blog_image").upload(fileName, selectedImage);
                if (uploadError) throw uploadError;
            }

            const { error: updateError } = await supabase
                .from("blogs")
                .update({
                    title: formData.title,
                    content: formData.content,
                    tags_id: formData.tags_id,
                    status: formData.status,
                    image_path: newImageUrl,
                    modified_at: new Date().toISOString(),
                })
                .eq("id", id);

            if (updateError) throw updateError;

            navigate("/admin/blogs");
        } catch (error) {
            showToast(`Error updating blog: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/blogs" />
            <h2>Edit Blog</h2>

            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Title:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Use ReactQuill for Content Editing */}
                    <div className="field-container">
                        <label>Content:</label>
                        <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={handleContentChange}
                            modules={{
                                toolbar: [
                                    [{ header: [1, 2, false] }],
                                    ["bold", "italic", "underline"],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["link", "image"],
                                ],
                            }}
                            formats={["header", "bold", "italic", "underline", "list", "bullet", "link", "image"]}
                            className="enhanced-input"
                        />
                    </div>

                    {/* Tag Selection */}
                    <div className="field-container">
                        <label>Tag:</label>
                        <Select
                            options={tags}
                            isMulti
                            value={tags.filter(option => formData.tags_id.includes(option.value))}
                            onChange={selectedOptions =>
                                setFormData(prev => ({ ...prev, tags_id: selectedOptions.map(option => option.value) }))
                            }
                            placeholder="Choose at least one recommended tag"
                            className="enhanced-input"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="field-container">
                        <label>Blog Image:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setSelectedImage(e.target.files[0])}
                            className="enhanced-input"
                        />
                    </div>

                    {/* Display Current Image */}
                    {formData.image_path && (
                        <div className="field-container">
                            <label>Current Image:</label>
                            <img
                                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${formData.image_path}`}
                                alt="Current"
                                className="preview-image"
                            />
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? "Updating..." : "Update"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditBlog;
