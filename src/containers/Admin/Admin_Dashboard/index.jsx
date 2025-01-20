import { useEffect, useState } from "react";
import supabase from "../../../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import "./index.css";

const AdminDashboard = () => {
    const [adminUser, setAdminUser] = useState(null);
    const [userCount, setUserCount] = useState(0);
    const [ingredientCount, setIngredientCount] = useState(0);
    const [inventoryCount, setInventoryCount] = useState(0);
    const navigate = useNavigate();

    // Fetch admin user and dropdown data
    useEffect(() => {
        const fetchAdminUser = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error fetching admin user:", error.message);
                navigate("/login");
            } else {
                const user = data?.session?.user || null;
                const userRole = "admin"; // Replace with dynamic role fetching
                if (userRole !== "admin") {
                    console.warn("Access denied: User is not an admin.");
                    navigate("/");
                } else {
                    setAdminUser(user);
                    fetchCounts();
                }
            }
        };

        fetchAdminUser();
    }, [navigate]);

    // Fetch total counts for users, ingredients, and inventory
    const fetchCounts = async () => {
        try {
            // Fetch total users
        } catch (error) {
            console.error("Error fetching counts:", error.message);
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-content">
                <h1>Admin Dashboard</h1>
                {adminUser && <p>Welcome, Admin {adminUser.email}</p>}
                <button
                    className="sign-out-btn"
                    onClick={async () => {
                        await supabase.auth.signOut();
                        navigate("/login");
                    }}
                >
                    Sign Out
                </button>
            </div>

            {/* Statistics Boxes */}
            <div className="stats-container">
                <div className="stats-box">
                </div>
                <div className="stats-box">
                </div>
                <div className="stats-box">
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
