import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';

const CreateTier = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color_code: '',
        status: 'enabled',
    });
    const [loading, setLoading] = useState(false);

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    const handleStatusChange = async (newStatus) => {
        setFormData(prevState => ({
            ...prevState,
            status: newStatus
          }));
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('tiers')
                .insert([
                    {
                        name: formData.name,
                        description: formData.description,
                        color_code: formData.color_code,
                        status: formData.status,
                    },
                ]);

            if (error) {
                showToast('Failed to create tier.', 'error')
                throw error;
            } 

            navigate('/admin/tiers');
        } catch (error) {
            showToast('Failed to create tier.', 'error')
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/tiers" />   
            <h2>Create New Tier</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">

                    <PlainInput
                        label="Name:"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />   

                    <PlainInput
                        label="Description:"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    /> 

                    <PlainInput
                        label="Color Code:"
                        value={formData.color_code}
                        onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                        required
                    />     

                    <div className="field-container">
                        <label>Status:</label>
                        <div>
                            <button
                            type="button"
                            onClick={() => handleStatusChange('enabled')}
                            style={{
                                backgroundColor: formData.status === 'enabled' ? 'green' : 'gray',
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
                                backgroundColor: formData.status === 'disabled' ? 'red' : 'gray',
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

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTier;
