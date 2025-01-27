import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './CreateVenueCategory.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const CreateVenueCategory = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        categoryName: '',
        categoryDescription: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

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

            showToast('Venue category created successfully.', 'success')

            // Navigate back to the venue categories list after successful creation
            navigate('/admin/venuecategory');
        } catch (error) {
            showToast('Failed to create venue category.', 'error')
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/venuecategory" />   
            <h2>Create New Venue Category</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label htmlFor="categoryName">Category Name:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="categoryName"
                            name="categoryName"
                            value={formData.categoryName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field-container">
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
                </div>
            </form>
        </div>
    );
};

export default CreateVenueCategory;
