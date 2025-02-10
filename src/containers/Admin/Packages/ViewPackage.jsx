import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './ViewPackage.css';   
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

import PlainInput from '../../../components/Input/PlainInput';
import SingleSelect from '../../../components/Input/SingleSelect';

const ViewPackage = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [packages, setPackage] = useState("");
    const [loading, setLoading] = useState(true);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
            setToastInfo({ visible: true, message, type });
            setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchSinglePackage = async () => { 
            setLoading(true);
    
            try {
                const { data: packageData, error: packageDataError } = await supabase
                    .from("packages")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (packageDataError) throw packageDataError;
    
                setPackage(packageData);
    
            } catch (err) {
                showToast("Failed to fetch package details.", "error");
            } finally {
                setLoading(false);
            }
        };
    
        fetchSinglePackage();
    }, [id]);
    
    if (loading) return <p>Loading package...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/packages" />    
            <h2>Package Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form className="outsider">
                <div className="insider">

                    <PlainInput
                            label="Package Name:"
                            value={packages.package_name}
                            type="text"
                            readOnly
                    />
                    <PlainInput
                            label="Price:"
                            value={packages.price}
                            type="text"
                            readOnly
                    />
                    <PlainInput
                            label="Billing Cycle:"
                            value={packages.billing_cycle}
                            type="text"
                            readOnly
                    />
                    <PlainInput
                            label="Annual Billing:"
                            value={packages.annual_billing}
                            type="text"
                            readOnly
                    />
                    <SingleSelect
                            label="Status:"
                            options={[
                                { value: "enabled", label: "Enabled" },
                                { value: "disabled", label: "Disabled" },
                            ]}
                            selectedValue={packages.status}
                            readOnly
                    />

                </div>
            </form>
        </div>
        
    );
};

export default ViewPackage;
