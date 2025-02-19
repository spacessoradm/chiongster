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
                        seq_in_menu: formData.seqInMenu,
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

                    <PlainInput 
                        label="Category Name"
                        name="categoryName"
                        value={formData.categoryName}
                        onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                        required
                    />

                    <TextArea 
                        label="Category Description"
                        name="categoryDescription"
                        value={formData.categoryDescription}
                        onChange={(e) => setFormData({ ...formData, categoryDescription: e.target.value })}
                        required
                    />

                    <PlainInput 
                        label="Seq in Menu"
                        name="seqInMenu"
                        value={formData.seqInMenu}
                        onChange={(e) => setFormData({ ...formData, seqInMenu: e.target.value })}
                    />


                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateVenueCategory;
