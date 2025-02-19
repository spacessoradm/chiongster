import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import SingleSelect from '../../../components/Input/SingleSelect';

const EditTier = () => {
    const { id } = useParams();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [colorCode, setColorCode] = useState("");
    const [status, setStatus] = useState("");
    const navigate = useNavigate();
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchSingleTier = async () => {
            try {
                const { data: tierData, error: tierError } = await supabase
                    .from("tiers")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (tierError) throw tierError;

                setName(tierData.name);
                setDescription(tierData.description);
                setColorCode(tierData.color_code);
                setStatus(tierData.status);
            } catch (error) {
                showToast("Error fetching tier data", "error");
            }
        };

        fetchSingleTier();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { error: updateError } = await supabase
                .from("tiers")
                .update({
                    name: name,
                    description: description,
                    color_code: colorCode,
                    status: status,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            showToast("Tier updated successfully.", "success");
            navigate("/admin/tiers");
        } catch (error) {
            showToast("Failed to update tier.", "error");
        }
    };
 
    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/tiers" /> 
            <h2>Edit Tier</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">

                    <PlainInput
                        label="Name:"
                        value={name}
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    
                    <PlainInput
                        label="Description:"
                        value={description}
                        type="text"
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <PlainInput
                        label="Color Code:"
                        value={colorCode}
                        type="text"
                        onChange={(e) => setColorCode(e.target.value)}
                        required
                    />
                    
                    <SingleSelect
                        label="Status:"
                        options={[
                            { value: "enabled", label: "Enabled" },
                            { value: "disabled", label: "Disabled" },
                        ]}
                        selectedValue={status}
                        onChange={(value) => setStatus(value)}
                        required
                    />

                    <button type="submit" className="submit-btn">Submit</button>
                </div>
            </form>
        </div>
    );
};

export default EditTier;
