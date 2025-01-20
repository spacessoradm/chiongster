import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

const CreateVenueCategory = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        categoryName: '',
        categoryDescription: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Insert new category into the 'venue_categories' table
            const { error: categoryError } = await supabase
                .from('venue_category')
                .insert([
                    {
                        category_name: formData.categoryName,
                        description: formData.categoryDescription,
                    },
                ]);

            if (categoryError) throw categoryError;

            // Navigate back to the venue categories list after successful creation
            navigate('/admin/venuecategory');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-venue-category-container">
            <div className="create-venue-category-header">
                <h2>Create New Venue Category</h2>
                <button className="back-btn" onClick={() => navigate('/admin/venuecategory')}>
                    Back to Venue Categories
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="create-venue-category-form">
                <div className="form-group">
                    <label htmlFor="categoryName">Category Name:</label>
                    <input
                        type="text"
                        id="categoryName"
                        name="categoryName"
                        value={formData.categoryName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="categoryDescription">Category Description:</label>
                    <textarea
                        id="categoryDescription"
                        name="categoryDescription"
                        value={formData.categoryDescription}
                        onChange={handleChange}
                        required
                        className="custom-textarea"
                    ></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Category'}
                </button>
            </form>
        </div>
    );
};

export default CreateVenueCategory;
