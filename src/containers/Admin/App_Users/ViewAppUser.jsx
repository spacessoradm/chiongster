import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';

import BackButton from "../../../components/Button/BackButton";

const ViewAppUser = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);

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
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            {/* Back Button */}
            <BackButton />

            {/* Action Buttons */}
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            </div>
            <div className="edit-user-container">
            <div className="admin-content">
                <h2>User Details</h2>
                <form>
                    <div className="form-group">
                        <label>Username:</label>
                        <input
                            type="text"
                            value={user.username}
                            disabled={isDisabled}
                        />
                    </div>

                    <div className="form-group">
                        <label>First Name:</label>
                        <input
                            type="text"
                            value={user.first_name}
                            disabled={isDisabled}
                        />
                    </div>

                    <div className="form-group">
                        <label>Last Name:</label>
                        <input
                            type="text"
                            value={user.last_name}
                            disabled={isDisabled}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="text"
                            value={user.email}
                            disabled={isDisabled}
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone:</label>
                        <input
                            type="text"
                            value={user.phone}
                            disabled={isDisabled}
                        />
                    </div>


                    <div className="form-group">
                        <label>Phone:</label>
                        <input
                            type="text"
                            value={"Client"}
                            disabled={isDisabled}
                        />
                    </div>

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

                </form>
            </div>
        </div>
        </div>
        
    );
};

export default ViewAppUser;
