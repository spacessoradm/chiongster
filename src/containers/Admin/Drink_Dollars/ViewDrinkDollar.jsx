import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from "../../../config/supabaseClient";
import BackButton from "../../../components/Button/BackButton";

const ViewDrinkDollar = () => {
  const { id } = useParams(); // user_id from URL
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [drinkdollar, setDrinkDollar] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {

        const { data: drinkdollarData, error: drinkdollarError } = await supabase
          .from("drink_dollars")
          .select("*")
          .eq("id", id)
          .single();

          if (drinkdollarError) throw drinkdollarError;

        console.log(drinkdollarData.user_id);

        setDrinkDollar(drinkdollarData);

        // Fetch user details
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", drinkdollarData.user_id)
          .single();
        if (userError) throw userError;

        setUser(userData);

        // Fetch transactions for the user
        const { data: transactionData, error: transactionError } = await supabase
          .from("trans_drink_dollar")   
          .select("*")
          .eq("user_id", userData.id);
        if (transactionError) throw transactionError;

        setTransactions(transactionData);
      } catch (err) {
        setError("Failed to fetch data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Back Button */}
      <BackButton />

      <div className="edit-user-container">
        <div className="admin-content">
          <h2>Drink Dollar Details</h2>
          <form>
            <div className="form-group">
              <label>Username:</label>
              <input type="text" value={user.username} disabled />
            </div>

            <div className="form-group">
              <label>Available Drink Dollars:</label>
              <input type="text" value={drinkdollar.coins || ""} disabled />
            </div>
          </form>

          <h3>All Transactions</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Transaction Title</th>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Description</th>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Coins</th>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                      {transaction.trans_title}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                      {transaction.trans_description}
                    </td>
                    <td
                      style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        textAlign: "center",
                      }}
                    >
                      {transaction.coins}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                      {new Date(transaction.created_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      border: "1px solid #ccc",
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewDrinkDollar;
