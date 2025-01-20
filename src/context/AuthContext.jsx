import { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

    useEffect(() => {
        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event);
            
            if (event === 'SIGNED_OUT') {
                localStorage.removeItem('userRole');
                setUserRole(null);
            } else if (session) {
                // Fetch user role from Supabase
                const { data, error } = await supabase
                    .from('profile') // Change 'profiles' to your actual user table
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
    
                if (error) {
                    console.error('Error fetching role:', error);
                } else {
                    localStorage.setItem('userRole', data.role);
                    setUserRole(data.role);
                }
            }
        });
    
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    

    const updateUserRole = (role) => {
        if (role) {
            localStorage.setItem('userRole', role);
        } else {
            localStorage.removeItem('userRole');
        }
        setUserRole(role);
    };

    return (
        <AuthContext.Provider value={{ userRole, updateUserRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
