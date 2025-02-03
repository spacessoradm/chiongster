import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './CreateManager.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const CreateManager = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        status: 'enabled',
        pic_path: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            pro_status: newStatus
          }));
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
            // Step 1: Create a new user in Supabase Auth
            /*const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email.trim(), // Trim spaces
                password: formData.password,
            });
    
            if (authError) {
                console.error('Auth Error:', authError);
                throw authError;
            }
    
            const user_id = authData.user?.id; // Get the generated user_id
    
            if (!user_id) throw new Error("User ID not generated");*/
    
            // Step 2: Insert data into manager_profiles
            const { error: managerError } = await supabase
                .from('manager_profiles')
                .insert([
                    {
                        username: formData.username,
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        email: formData.email,
                        phone: formData.phone,
                        //status: formData.status,
                        pic_path: null,
                        //password: formData.password,
                        role_id: 3,
                        unique_id: null, // Link the generated user ID
                    },
                ]);
    
            if (managerError) throw managerError;
    
            showToast('Manager Profile created successfully.', 'success');
    
            navigate('/admin/managers');
        } catch (error) {
            showToast('Failed to create manager profile.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/managers" />   
            <h2>Create Manager Profile</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Username:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>First Name:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            
                        />
                    </div>

                    <div className="field-container">
                        <label>Last Name:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            
                        />
                    </div>

                    <div className="field-container">
                        <label>Email:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Phone:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="field-container">
                        <label>Password:</label>
                        <input
                            className='enhanced-input'
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Status:</label>
                        <div id="language-status-toggle">
                            <button
                            type="button"
                            onClick={() => handleStatusChange('approved')}
                            style={{
                                backgroundColor: formData.pro_status === 'approved' ? 'green' : 'gray',
                                color: 'white',
                                padding: '10px 20px',
                                border: 'none',
                                cursor: 'pointer',
                                width: '45%',
                            }}
                            >
                            Approved
                            </button>
                            <button
                            type="button"
                            onClick={() => handleStatusChange('rejected')}
                            style={{
                                backgroundColor: formData.pro_status === 'rejected' ? 'red' : 'gray',
                                color: 'white',
                                padding: '10px 20px',
                                border: 'none',
                                cursor: 'pointer',
                                width: '45%',
                            }}
                            >
                            Rejected
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

export default CreateManager;
