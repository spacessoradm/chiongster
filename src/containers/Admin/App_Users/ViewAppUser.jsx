import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './ViewAppUser.css';

import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';

const ViewAppUser = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [user, setUser] = useState(null);
    const [planName, setPlanName] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

    useEffect(() => {
        const fetchUserDetails = async () => {
            setLoading(true);
            setError(null);
    
            try {
                // Step 1: Fetch user details
                const { data: userData, error: userError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (userError) throw userError;
    
                setUser(userData);
    
                // Step 2: Fetch related roles
                const { data: rolesData, error: rolesError } = await supabase
                    .from("roles")
                    .select("*");
                if (rolesError) {
                    console.error("Error fetching roles:", rolesError.message);
                    setRoles([]);
                } else {
                    setRoles(rolesData || []);
                }

                const { data: planData, error: planDataError } = await supabase
                    .from("packages")
                    .select("package_name")
                    .eq("id", userData.plan_id)
                    .single(); 

                setPlanName(planData.package_name);

            } catch (err) {
                setError("Failed to fetch user details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchUserDetails();
    }, [id]);

    const deleteUser = async (id, picturePath) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
        if (!confirmDelete) return;

        try {
            setLoading(true);

            // Delete picture from Supabase Storage
            const { error: storageError } = await supabase.storage
                .from("profile-picture") // Adjust the bucket name if needed
                .remove([picturePath]);

            if (storageError) {
                console.error("Failed to delete picture:", storageError);
                setError("Failed to delete user's profile picture.");
                return;
            }

            // Delete user from the database
            const { error: userError } = await supabase
                .from("profiles")
                .delete()
                .eq("id", id);

            if (userError) throw userError;

            alert("User and profile picture deleted successfully.");
            navigate("/admin/appusers"); // Redirect after deletion
        } catch (err) {
            setError("Failed to delete user.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <p>Loading user...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "courier new" }}>
            <BackButton to="/admin/appusers" />    
            <h2>Drink Dollar Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            <div className="edit-user-container">
            
            <div className="admin-content">
                <form className="outsider">
                    <div className="insider">
                        <PlainInput
                            label="Username"
                            value={user.username}
                            readOnly
                        />
                        <PlainInput
                            label="Email"
                            value={user.email}
                            readOnly
                        />

                        <PlainInput
                            label="First Name"
                            value={user.first_name}
                            readOnly
                        />
                        <PlainInput
                            label="Last Name"
                            value={user.last_name}
                            readOnly
                        />
                        <PlainInput
                            label="Phone"
                            value={user.phone}
                            readOnly
                        />
                        <PlainInput
                            label="Plan Name"
                            value={planName}
                            readOnly 
                        />
                        <PlainInput
                            label="Plan Expired Date"
                            value={new Date(user.plan_expired_date).toLocaleString()}
                            readOnly
                        />

                        <div className="form-group">
                            <label>Profile Picture:</label>
                            {user.picture_path && (
                                <img
                                    src={`${supabase.storage.from("profile-picture").getPublicUrl(user.picture_path).publicURL}`}
                                    alt="Current Picture"
                                    className="current-picture"
                                />
                            )}
                        </div>
                    </div>

                </form>
            </div>
        </div>
        </div>
        
    );
};

export default ViewAppUser;
