import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaPlus } from 'react-icons/fa';
import supabase from "../../../config/supabaseClient";
import './ViewDrinkDollar.css';   
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const ViewDrinkDollar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [drinkdollar, setDrinkDollar] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages

  const limit = 5;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchDetails = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
  
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;
  
      const { data: drinkdollarData, error: drinkdollarError } = await supabase
        .from("drink_dollars")
        .select("*")
        .eq("id", id)
        .single();
  
      if (drinkdollarError) throw drinkdollarError;
      setDrinkDollar(drinkdollarData);
  
      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", drinkdollarData.user_id)
        .single();
        
      if (userError) throw userError;
      setUser(userData);
  
      // Fetch total count of transactions
      const { count, error: countError } = await supabase
        .from("trans_drink_dollar")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userData.id);
  
      if (countError) throw countError;
  
      // Fetch paginated transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from("trans_drink_dollar")   
        .select("*")
        .eq("user_id", userData.id)
        .range(start, end);
  
      if (transactionError) throw transactionError;
  
      setTransactions(transactionData);
      setTotalPages(Math.ceil(count / limit)); // Correct total pages calculation
  
    } catch (err) {
      showToast("Failed to fetch data.", "error");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchDetails(page);
  }, [id, page]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchDetails(newPage);
    }
  };

  const onCreate = () => navigate(`/admin/drinkdollars/createtransaction/${drinkdollar.user_id}`);

  if (loading) return <p>Loading data...</p>;
  

  return (
    <div style={{ padding: "20px", fontFamily: "courier new" }}>
      <BackButton to="/admin/drinkdollars" />    
      <h2>Drink Dollar Details</h2>

      {toastInfo.visible && (
          <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      <div className="edit-user-container">

        <div className="admin-content">
          <form className="outsider">
              <div className="insider">
                <div className="field-container">
                  <label>Username:</label>
                  <input 
                    className="enhanced-input"
                    type="text" 
                    value={user.username} 
                    disabled={isDisabled} />
                </div>

                <div className="field-container">
                  <label>Available Drink Dollars:</label>
                  <input 
                    className="enhanced-input"
                    type="text" 
                    value={drinkdollar.coins || ""} 
                    disabled={isDisabled} />
                </div>
              </div>
          </form>

          <h3 className="sub-title">All Transactions</h3>
          <FaPlus
            onClick={onCreate}
            title="Create"
            className="create-button"
          />
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4" }}>
                <th className="normal-header">Transaction Title</th>
                <th className="normal-header">Description</th>
                <th className="normal-header">Coins</th>
                <th className="normal-header">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className='normal-column'>{transaction.trans_title}</td>
                    <td className='normal-column'>{transaction.trans_description}</td>
                    <td className='normal-column'>{transaction.coins}</td>
                    <td className='normal-column'>
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
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewDrinkDollar;
