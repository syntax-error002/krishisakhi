import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext<any>({});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false); // Can be tied to AsyncStorage

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (usr) => {
            setUser(usr);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, hasCompletedOnboarding, setHasCompletedOnboarding }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
