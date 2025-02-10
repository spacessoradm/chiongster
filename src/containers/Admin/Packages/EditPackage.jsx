import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import './EditPackage.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';
import SingleSelect from '../../../components/Input/SingleSelect';

const EditPackage = () => {
    const { id } = useParams();
    const [packageName, setPackageName] = useState("");
    const [price, setPrice] = useState("");
    const [billingCycle, setBillingCycle] = useState("");
    const [annualBilling, setAnnualBilling] = useState("");
    const [status, setStatus] = useState("");
    const navigate = useNavigate();
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchSinglePackage = async () => {
            try {
                const { data: packageData, error: packageError } = await supabase
                    .from("packages")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (packageError) throw packageError;

                setPackageName(packageData.package_name);
                setPrice(packageData.price);
                setBillingCycle(packageData.billing_cycle);
                setAnnualBilling(packageData.annual_billing);
                setStatus(packageData.status);
            } catch (error) {
                showToast("Error fetching package data", "error");
            }
        };

        fetchSinglePackage();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { error: updateError } = await supabase
                .from("packages")
                .update({
                    package_name: packageName,
                    price: price,
                    billing_cycle: billingCycle,
                    annual_billing: annualBilling,
                    status: status,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            showToast("Package updated successfully.", "success");
            navigate("/admin/packages");
        } catch (error) {
            showToast("Failed to update package.", "error");
        }
    };
 
    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/packages" /> 
            <h2>Edit Package</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">

                    <PlainInput
                        label="Package Name:"
                        value={packageName}
                        type="text"
                        onChange={(e) => setPackageName(e.target.value)}
                        required
                    />
                    
                    <PlainInput
                        label="Price:"
                        value={price}
                        type="text"
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />

                    <PlainInput
                        label="Billing Cycle:"
                        value={billingCycle}
                        type="text"
                        onChange={(e) => setBillingCycle(e.target.value)}
                        
                    />

                    <PlainInput
                        label="Annual Billing:"
                        value={annualBilling}
                        type="text"
                        onChange={(e) => setAnnualBilling(e.target.value)}
                        
                    />
                    
                    <SingleSelect
                        label="Billing Cycle:"
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

export default EditPackage;
