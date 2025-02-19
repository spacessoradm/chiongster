import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';

const CreateVibe = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        vibeName: '',
        Description: '',
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
            const { error: vibeError } = await supabase
                .from('vibe')
                .insert([
                    {
                        vibe_name: formData.vibeName,
                        description: formData.Description,
                        seq_in_menu: formData.seqInMenu,
                    },
                ]);

            if (vibeError) throw vibeError;

            showToast('Vibe created successfully.', 'success')

            // Navigate back to the venue categories list after successful creation
            navigate('/admin/vibe');
        } catch (error) {
            showToast('Failed to create vibe.', 'error')
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/vibe" />   
            <h2>Create New Vibe</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">

                    <PlainInput 
                        label="Name"
                        name="vibeName"
                        value={formData.vibeName}
                        onChange={(e) => setFormData({ ...formData, vibeName: e.target.value })}
                        required
                    />

                    <TextArea 
                        label="Description"
                        name="Description"
                        value={formData.Description}
                        onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
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

export default CreateVibe;
