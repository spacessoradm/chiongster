import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './CreatePackage.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';

const CreatePackage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        package_name: '',
        price: '',
        billing_cycle: '',
        annual_billing: '',
        status: 'enabled',
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
            status: newStatus
          }));
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error: packageError } = await supabase
                .from('packages')
                .insert([
                    {
                        package_name: formData.package_name,
                        price: formData.price,
                        billing_cycle: formData.billing_cycle,
                        annual_billing: formData.annual_billing,
                        status: formData.status,
                    },
                ]);

            if (packageError) throw packageError;

            showToast('Package created successfully.', 'success')

            navigate('/admin/packages');
        } catch (error) {
            showToast('Failed to create package.', 'error')
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/packages" />   
            <h2>Create New Package</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">

                    <PlainInput
                        label="Package Name:"
                        value={formData.package_name}
                        onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                        required
                    />   

                    <PlainInput
                        label="Price:"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                    /> 

                    <PlainInput
                        label="Billing Cycle:"
                        value={formData.billing_cycle}
                        onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                        
                    />         

                    <PlainInput
                        label="Annual Billing:"
                        value={formData.annual_billing}
                        onChange={(e) => setFormData({ ...formData, annual_billing: e.target.value })}
                        
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

export default CreatePackage;
