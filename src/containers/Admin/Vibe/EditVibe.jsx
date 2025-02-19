import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import './index.css';
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';

const EditVibe = () => {
    const { id } = useParams();
    const [vibe, setVibe] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [seqInMenu, setSeqInMenu] = useState("");
    const navigate = useNavigate();
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchVibeData = async () => {
            try {
                // Fetch vibe data from the database
                const { data: vibeData, error: vibeError } = await supabase
                    .from("vibe")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (vibeError) throw vibeError;

                setVibe(vibeData);
                setName(vibeData.vibe_name);
                setDescription(vibeData.description);
                setSeqInMenu(vibeData.seq_in_menu);
            } catch (error) {
                console.error("Error fetching vibe data:", error.message);
            }
        };

        fetchVibeData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Update venue category data in the database
            const { error: updateError } = await supabase
                .from("vibe")
                .update({
                    vibe_name: name,
                    description: description,
                    seq_in_menu: seqInMenu,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            showToast("Vibe updated successfully.", "success");
            navigate("/admin/vibe");
        } catch (error) {
            console.error("Error updating vibe:", error.message);
            showToast("Failed to update vibe.", "error");
        }
    };
 
    return (
        <div className="edit-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/vibe" /> 
            <h2>Edit Vibe</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">

                    <PlainInput 
                        label="Vibe Name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <TextArea 
                        label="Vibe Description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <PlainInput 
                        label="Seq in Menu"
                        name="seqInMenu"
                        value={seqInMenu}
                        onChange={(e) => setSeqInMenu(e.target.value)}
                    />

                    <button type="submit" className="submit-btn">Submit</button>
                
                </div>
            </form>
        </div>
    );
};

export default EditVibe;
