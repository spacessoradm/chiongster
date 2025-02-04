import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './CreateNotis.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';

const CreateNotis = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        notis_name: '',
        notis_description: '',
        notis_status: 'enabled',
    });
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
          ...prevState,
          [name]: value
        }));
      };

    const handleStatusChange = async (newStatus) => {
        setFormData(prevState => ({
            ...prevState,
            notis_status: newStatus
          }));
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error: notisError } = await supabase
                .from('notis')
                .insert([
                    {
                        notis_name: formData.notis_name,
                        notis_description: formData.notis_description,
                        status: formData.notis_status,
                    },
                ]);

            if (notisError) throw notisError;

            showToast('Notis created successfully.', 'success')

            navigate('/admin/notis');
        } catch (error) {
            showToast('Failed to create notis.', 'error')
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/notis" />   
            <h2>Create New Notis</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">

                    <PlainInput
                        label="Notis Name:"
                        value={formData.notis_name}
                        onChange={(e) => setFormData({ ...formData, notis_name: e.target.value })}
                        required
                    />      

                    
                    <TextArea
                        label="Notis Description:"
                        value={formData.notis_description}
                        onChange={(e) => setFormData({ ...formData, notis_description: e.target.value })}
                        rows={20} 
                        required
                    />

                    <div className="field-container">
                        <label htmlFor="languageStatus">Status:</label>
                        <div id="language-status-toggle">
                            <button
                            type="button"
                            onClick={() => handleStatusChange('enabled')}
                            style={{
                                backgroundColor: formData.notis_status === 'enabled' ? 'green' : 'gray',
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
                                backgroundColor: formData.notis_status === 'disabled' ? 'red' : 'gray',
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
                        {loading ? 'Creating...' : 'Create Language'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateNotis;
