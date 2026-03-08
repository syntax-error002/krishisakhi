import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext<any>({});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (usr) => {
            setUser(usr);

            if (usr) {
                // Fetch user profile from Firestore
                try {
                    const userDocRef = doc(db, 'users', usr.uid);
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data());
                    } else {
                        // Create empty profile if none exists
                        const newProfile = { name: '', location: '', farmSize: '', mainCrops: '', role: 'farmer' };
                        await setDoc(userDocRef, newProfile);
                        setUserProfile(newProfile);
                    }
                } catch (e) {
                    console.error("Error fetching user profile", e);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const updateProfile = async (newData: any) => {
        if (!user) return;
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, newData, { merge: true });
            setUserProfile((prev: any) => ({ ...prev, ...newData }));
        } catch (e) {
            console.error("Error updating profile", e);
            throw e;
        }
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, updateProfile, loading, hasCompletedOnboarding, setHasCompletedOnboarding }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
