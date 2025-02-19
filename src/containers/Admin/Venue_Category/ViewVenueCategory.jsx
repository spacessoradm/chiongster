import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './index.css';   
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';

const ViewVenueCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [venueCategory, setVenueCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
            setToastInfo({ visible: true, message, type });
            setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchVenueCategoryDetails = async () => { 
            setLoading(true);
            setError(null);
    
            try {
                const { data: venueCategoryData, error: venueCategoryDataError } = await supabase
                    .from("venue_category")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (venueCategoryDataError) throw venueCategoryDataError;
    
                setVenueCategory(venueCategoryData);
    
            } catch (err) {
                showToast("Failed to fetch category details.", "error");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchVenueCategoryDetails();
    }, [id]);

    const deleteVenueCategory = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this category?");
        if (!confirmDelete) return;

        try {
            setLoading(true);

            const { error: venueCategoryError } = await supabase
                .from("venue_category")
                .delete()
                .eq("id", id);

            if (venueCategoryError) throw venueCategoryError;

            navigate("/admin/venuecategory"); // Redirect after deletion
        } catch (err) {
            showToast("Failed to delete category.", "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <p>Loading category...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/venuecategory" />    
            <h2>Venue Category Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form className="outsider">
                <div className="insider">

                    <PlainInput label="Venue Name" value={venueCategory.category_name} readOnly />
                    <TextArea label="Venue Description" value={venueCategory.description} readOnly />
                    <PlainInput label="Sequence in Menu" value={venueCategory.seq_in_menu} readOnly />
                    <PlainInput label="Created At" value={venueCategory.created_at} readOnly />

                </div>
                </form>
        </div>
        
    );
};

export default ViewVenueCategory;
