import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './CreateDDTransaction.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const CreateDDTransaction = () => {
    const { id } = useParams(); // user_id from URL
    const navigate = useNavigate(); // Default to 'add'
    const [formData, setFormData] = useState({
        trans_title: '',
        trans_description: '',
        transactionType: '',
        user_id: '',
        coins: '',
    });
    const [loading, setLoading] = useState(false);

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

        try {
            const { data: ddRecord, error: ddRecordError } = await supabase
                .from('drink_dollars')
                .select('*')
                .eq('user_id', id)
                .single();

            const currentCoins = ddRecord?.coins || 0; // Default to 0 if null
            const transactionAmount = parseInt(formData.coins, 10); // Ensure it's a number

            // Calculate updated coin balance
            const updatedCoins = formData.transactionType === 'add' 
            ? currentCoins + transactionAmount
            : currentCoins - transactionAmount;

            const { error: transactionError } = await supabase
                .from('trans_drink_dollar')
                .insert([
                {
                        trans_title: formData.trans_title,
                        trans_description: formData.trans_description,
                        user_id: id,
                        coins: transactionAmount,
                        created_at: new Date().toISOString(),
                        modified_at:new Date().toISOString(),
                    },
            ]);

            if (transactionError) throw transactionError;
            

            // Update drink_dollars table
            const { error: updateError } = await supabase
            .from('drink_dollars')
            .update({ coins: updatedCoins })
            .eq('user_id', id);

            if (updateError) {
            console.error("Error updating coins:", updateError);
            } else {
            console.log("Drink Dollars updated successfully!");
            }

            showToast('Drink Dollar transaction created successfully.', 'success')
            navigate('/admin/drinkdollars');
        } catch (error) {
            showToast('Failed to create drink dollar transaction.', 'error')
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/drinkdollars/" />   
            <h2>Drink Dollar Adjustment</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Title:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="trans_title"
                            name="trans_title"
                            value={formData.trans_title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Description:</label>
                        <textarea
                            id="trans_description"
                            name="trans_description"
                            value={formData.trans_description}
                            onChange={handleChange}
                            required
                            className="enhanced-input"
                        ></textarea>
                    </div>

                    <div className="field-container">
                        <label>Transaction Type:</label>
                        <select
                        className="enhanced-input"
                        value={formData.transactionType}
                        onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                        >
                        <option value="">Select transaction type</option>
                        <option value="add">Add</option>
                        <option value="deduct">Deduct</option>
                        </select>
                    </div>

                    <div className="field-container">
                        <label>Amount:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="coins"
                            name="coins"
                            value={formData.coins}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateDDTransaction;
