import './index.css'; // Import the CSS file
import { useState } from 'react';
import supabase from '../../../config/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { updateUserRole } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                // Handle specific Supabase auth errors
                if (error.status === 400) {
                    alert('Invalid credentials. Please try again.');
                } else if (error.status === 404) {
                    alert('Invalid accounts. Please contact IT support.');
                } else {
                    alert(`Login failed: ${error.message}`);
                }
                throw error;
            }

            alert('Login successful!');

            // Fetch user_id from admin_profile
            const { data: adminProfileData, error: adminProfileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('unique_id', data.user.id)
                .single();

            if (adminProfileError) {
                console.error('Error fetching admin profile:', adminProfileError);
                throw adminProfileError;
            }

            // Fetch role_id from user_roles
            const { data: userRoleData, error: roleError } = await supabase
                .from('user_roles')
                .select('role_id')
                .eq('user_id', adminProfileData.id)
                .single();

            if (roleError) {
                console.error('Error fetching user_role:', roleError);
                throw roleError;
            }

            // Fetch role_name from roles table using role_id
            const { data: roleData, error: roleNameError } = await supabase
                .from('roles')
                .select('role_name')
                .eq('id', userRoleData.role_id)
                .single();

            if (roleNameError) {
                console.error('Error fetching role_name:', roleNameError);
                throw roleNameError;
            }

            const roleName = roleData.role_name.trim().toLowerCase();

            // Update role in context
            updateUserRole(roleName);

            // Check the user's profile for a username (only for clients)
            if (roleName === 'admin') {
                /*const { data: adminProfileData, error: adminProfileError } = await supabase
                    .from('admin_profile') // Assuming user profile information is stored here
                    .select('username')
                    .eq('unique_user_id', data.user.id)
                    .single();

                if (adminProfileError) {
                    console.error('Error fetching admin profile:', adminProfileError);
                    throw adminProfileError;
                }*/

                navigate('/admin/dashboard');
            } else {
                throw new Error(`Unknown role: ${roleName}`);
            }

        } catch (error) {
            console.error('Error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>
            <div className="floating-shape shape-4"></div>

            <h1 className="header">Login</h1>
            <form onSubmit={handleEmailLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {/* Forgot Password Link */}
                <p className="forgot-password-link">
                    <button 
                        type="button" 
                        className="forgot-password-button" 
                        onClick={() => navigate('/forgetpassword')}
                    >
                        Forgot Password?
                    </button>
                </p>
                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="footer">
                Don't have an account?{' '}
                <button className="signup-link" onClick={() => navigate('/signup')}>
                    Sign Up
                </button>
            </p>
        </div>
    );
};

export default Login;