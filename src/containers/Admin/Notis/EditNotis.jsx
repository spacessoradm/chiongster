import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import './EditNotis.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';
import SingleSelect from '../../../components/Input/SingleSelect';

const EditNotis = () => {
    const { id } = useParams();
    const [notisName, setNotisName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const navigate = useNavigate();
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchNotisData = async () => {
            try {
                const { data: notisData, error: notisError } = await supabase
                    .from("notis")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (notisError) throw notisError;

                console.log(notisData.status);

                setNotisName(notisData.notis_name);
                setDescription(notisData.notis_description);
                setStatus(notisData.status);
            } catch (error) {
                showToast("Error fetching notis data", "error");
            }
        };

        fetchNotisData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { error: updateError } = await supabase
                .from("notis")
                .update({
                    notis_name: notisName,
                    notis_description: description,
                    status: status,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            showToast("Notis updated successfully.", "success");
            navigate("/admin/notis");
        } catch (error) {
            showToast("Failed to update notis.", "error");
        }
    };
 
    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/notis" /> 
            <h2>Edit Notis</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">

                    <PlainInput
                        label="Notis Name:"
                        value={notisName}
                        type="text"
                        onChange={(e) => setNotisName(e.target.value)}
                        required
                    />
                    <TextArea
                        label="Description:"
                        value={description}
                        rows={20}
                        onChange={(e) => setDescription(e.target.value)}
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

export default EditNotis;
