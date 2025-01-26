import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";
import "./EditDrinkDollar.css";

const EditDrinkDollar = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState("");
    const [drinkDollar, setDrinkDollar] = useState(0);
    const [transTitle, setTransTitle] = useState("");
    const [transDescription, setTransDescription] = useState("");
    const [action, setAction] = useState("Credit");
    const [amount, setAmount] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {

                // Fetch coins from drink_dollars table
                const { data: drinkDollarData, error: drinkDollarError } = await supabase
                    .from("drink_dollars")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (drinkDollarError) throw drinkDollarError;
                setDrinkDollar(drinkDollarData);

                // Fetch username from profiles table
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", drinkDollarData.user_id)
                    .single();

                if (profileError) throw profileError;
                setProfile(profileData);

            } catch (error) {
                console.error("Error fetching user data:", error.message);
            }
        };

        fetchUserData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!transTitle || !transDescription || !amount) {
            alert("Please fill all required fields.");
            return;
        }

        const transactionAmount = parseFloat(amount);
        if (isNaN(transactionAmount) || transactionAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        try {
            // Calculate the updated coins based on the action
            const updatedCoins =
                action === "Credit" ? drinkDollar.coins + transactionAmount : drinkDollar.coins - transactionAmount;

            if (updatedCoins < 0) {
                alert("Insufficient coins for this transaction.");
                return;
            }

            console.log(updatedCoins);

            // Insert transaction into trans_drink_dollar table
            const { error: insertError } = await supabase
                .from("trans_drink_dollar")
                .insert({
                    user_id: profile.id,
                    trans_title: transTitle,
                    trans_description: transDescription,
                    coins: transactionAmount,
                });

            if (insertError) throw insertError;

            // Update coins in drink_dollars table
            const { error: updateError } = await supabase
                .from("drink_dollars")
                .update({ coins: updatedCoins })
                .eq("id", id);

            if (updateError) throw updateError;

            alert("Transaction successful!");
            navigate("/admin/drinkdollars");
        } catch (error) {
            console.error("Error processing transaction:", error.message);
            alert("Failed to process transaction.");
        }
    };

    return (
        <div className="edit-drink-dollar-container">
            <div className="admin-content">
                <h2>Edit Drink Dollar</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username:</label>
                        <input type="text" value={profile.username} disabled />
                    </div>

                    <div className="form-group">
                        <label>Coins:</label>
                        <input type="text" value={drinkDollar.coins} disabled />
                    </div>

                    <div className="form-group">
                        <label>Transaction Title:</label>
                        <input
                            type="text"
                            value={transTitle}
                            onChange={(e) => setTransTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Transaction Description:</label>
                        <textarea
                            className="custom-textarea"
                            value={transDescription}
                            onChange={(e) => setTransDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Action:</label>
                        <select value={action} onChange={(e) => setAction(e.target.value)}>
                            <option value="Credit">Credit</option>
                            <option value="Debit">Debit</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Amount:</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default EditDrinkDollar;
