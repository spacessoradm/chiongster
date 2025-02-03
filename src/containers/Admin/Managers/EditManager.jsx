import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './EditManager.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const EditManager = () => {
    const navigate = useNavigate();
    const { id } = useParams();  // Get the manager ID from the URL
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        status: 'approved',
        pic_path: '',
        role_id: 3,
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    // Fetch manager data on component load
    useEffect(() => {
        const fetchManagerData = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('manager_profiles')
                    .select('*')
                    .eq('id', id)
                    .single(); // Fetch the manager by ID

                    console.log(data);

                if (error) {
                    throw error;
                }

                console.log("Im here");

                if (data) {
                    setFormData({
                        username: data.username,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email: data.email,
                        phone: data.phone,
                        status: data.status,
                        pic_path: data.pic_path || '',
                        password: '',  // Don't pre-fill password (security concern)
                    });
                    console.log("Im here");
                }
            } catch (error) {
                console.error('Error fetching manager data:', error);
                showToast('Failed to load manager data.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchManagerData();
    }, [id]);

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
            status: newStatus
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Step 1: Update the manager's data in manager_profiles
            const { error: managerError } = await supabase
                .from('manager_profiles')
                .update({
                    username: formData.username,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone: formData.phone,
                    status: formData.status,
                    pic_path: formData.pic_path,
                    role_id: 3,
                })
                .eq('id', id);  // Ensure we update the correct manager by their ID

            if (managerError) throw managerError;

            showToast('Manager Profile updated successfully.', 'success');
            navigate('/admin/managers');
        } catch (error) {
            console.error('Error updating manager profile:', error);
            showToast('Failed to update manager profile.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/managers" />
            <h2>Edit Manager Profile</h2>

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
                            type="email"
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
                        />
                    </div>

                    <div className="field-container">
                        <label>Status:</label>
                        <select
                            className="enhanced-input"
                            value={formData.status}  
                            onChange={(e) => setStatus(e.target.value)} 
                        >
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditManager;
