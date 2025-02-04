import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import './EditRedeemItem.css';
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

const EditRedeemItem = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get the redeem item ID from the route parameters

    const [formData, setFormData] = useState({
        itemName: '',
        itemDescription: '',
        itemAmount: '',
        venueId: '',
        pic_path: null
    });
    const [venues, setVenues] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    // Fetch venues when the component loads
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('venues')
                    .select('id, venue_name');
                if (fetchError) throw fetchError;
                setVenues(data);
            } catch (err) {
                console.error('Error fetching venues:', err);
            }
        };

        fetchVenues();
    }, []);

    // Fetch redeem item details when the component loads
    useEffect(() => {
        const fetchRedeemItem = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('redeem_items')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (fetchError) throw fetchError;

                setFormData({
                    itemName: data.item_name,
                    itemDescription: data.item_description,
                    itemAmount: data.amount,
                    venueId: data.venue_id,
                    pic_path: data.pic_path || null
                });
            } catch (err) {
                showToast(`Error fetching redeem item: ${err.message}`, 'error')
            }
        };

        fetchRedeemItem();
    }, [id]);

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
            let newImageUrl = formData.pic_path;

            // Upload new image if a new file is selected
            if (selectedImage) {
                const fileExt = selectedImage.name.split('.').pop();
                const fileName = `${id}_${Date.now()}.${fileExt}`;
                newImageUrl = `redemption/${fileName}`;
    
                // Delete old image if it exists
                if (formData.pic_path) {
                    const oldFileName = formData.pic_path.split('/').pop();
                    await supabase.storage.from('redemption').remove([`${oldFileName}`]);
                }
    
                // Upload the new image
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('redemption')
                    .upload(fileName, selectedImage);
    
                if (uploadError) throw uploadError;
            }

            const { error: updateError } = await supabase
                .from('redeem_items')
                .update({
                    item_name: formData.itemName,
                    item_description: formData.itemDescription,
                    amount: 0,
                    venue_id: null,
                    pic_path: newImageUrl,
                    modified_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            navigate('/admin/redeemitems');
        } catch (error) {
            showToast(`Error updating redeem item: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/redeemitems" /> 
            <h2>Edit Redeem Item</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label htmlFor="itemName">Item Name:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="itemName"
                            name="itemName"
                            value={formData.itemName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                <div className="field-container">
                    <label htmlFor="itemDescription">Item Description:</label>
                    <textarea
                        id="itemDescription"
                        name="itemDescription"
                        value={formData.itemDescription}
                        onChange={handleChange}
                        required
                        className="enhanced-input"
                    ></textarea>
                </div>

                <div className="field-container">
                    <label htmlFor="itemImage">Item Image:</label>
                    <input 
                        type="file" 
                        id="itemImage" 
                        name="itemImage" 
                        accept="image/*" 
                        onChange={(e) => setSelectedImage(e.target.files[0])} 
                        className="enhanced-input"
                    />
                </div>

                {formData.pic_path && (
                    <div className="field-container">
                        <label>Current Image:</label>
                        <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${formData.pic_path}`} alt="Current Item" className="preview-image" />
                    </div>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Redeem Item'}
                </button>

                </div>
            </form>
        </div>
    );
};

export default EditRedeemItem;
