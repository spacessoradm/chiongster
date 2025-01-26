import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";
import './EditAppUser.css';

const EditAppUser = () => {
    const { id } = useParams();
    const [unqID, setUnqID] = useState("");
    const [userName, setUserName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [roleName, setRoleName] = useState("");
    const [picture, setPicture] = useState(null);
    const [currentPicturePath, setCurrentPicturePath] = useState("");
    const [roles, setRoles] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: user, error: userError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (userError) throw userError;

                setUnqID(user.user);
                setUserName(user.username);
                setFirstName(user.first_name);
                setLastName(user.last_name);
                setPhone(user.phone);
                setEmail(user.email);
                setCurrentPicturePath(user.pic_path);

                const { data: userRole, error: userRoleError } = await supabase
                    .from("user_roles")
                    .select("role_id")
                    .eq("user_id", user.user)
                    .single();

                if (userRoleError) throw userRoleError;

                const { data: roleData, error: roleError } = await supabase
                    .from("roles")
                    .select("id, role_name")
                    .eq("id", userRole.role_id)
                    .single();

                if (roleError) throw roleError;

                setSelectedRoleId(roleData.id);
                setRoleName(roleData.role_name);

                const { data: rolesData, error: rolesError } = await supabase
                    .from("roles")
                    .select("id, role_name");

                if (rolesError) {
                    console.error("Error fetching roles data:", rolesError);
                } else {
                    setRoles(rolesData || []);
                }

                const { data: notificationData, error: notificationError } = await supabase
                    .from("notification_day")
                    .select("id, day");

                if (notificationError) {
                    console.error("Error fetching notification days:", notificationError);
                } else {
                    setNotificationDay(notificationData || []);
                }
            } catch (error) {
                console.error("Error fetching user data:", error.message);
            }
        };

        fetchUserData();
    }, [id]);

    const handlePictureChange = (e) => {
        setPicture(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userName) {
            alert("Please fill all required fields.");
            return;
        }

        try {
            let picturePath = currentPicturePath;

            if (picture) {
                const { data: pictureUploadData, error: pictureError } = await supabase.storage
                    .from("profile_picture")
                    .upload(`pictures/${picture.name}`, picture, { upsert: true });

                if (pictureError) throw pictureError;

                picturePath = pictureUploadData.path;
            }

            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    username: userName,
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone,
                    email: email,
                    pic_path: picturePath,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            if (selectedRoleId) {
                const { error: userRoleError } = await supabase
                    .from("user_roles")
                    .update({ role_id: selectedRoleId })
                    .eq("user_id", unqID);

                if (userRoleError) throw userRoleError;
            }

            alert("User updated successfully!");
            navigate("/admin/appusers");
        } catch (error) {
            console.error("Error updating user:", error.message);
            alert("Failed to update user.");
        }
    };

    return (
        <div className="edit-user-container">
            <div className="admin-content">
                <h2>Edit App User</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>User Name:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>First Name:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Last Name:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone:</label>
                        <input
                        c   className="enhanced-input"
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Profile Picture:</label>
                        {currentPicturePath && (
                            <img
                                src={`${supabase.storage.from("profile_picture").getPublicUrl(currentPicturePath).publicURL}`}
                                alt="Current Picture"
                                className="current-picture"
                            />
                        )}
                        <label>New Picture (optional):</label>
                        <input type="file" accept="image/*" onChange={handlePictureChange} />
                    </div>

                    <button type="submit" className="submit-btn">Update User</button>
                </form>
            </div>
        </div>
    );
};

export default EditAppUser;
