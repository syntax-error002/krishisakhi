import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../src/theme';
import { auth } from '../../src/config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function AuthScreen() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            // Layout component handles routing based on auth state
        } catch (error: any) {
            Alert.alert("Authentication Failed", error.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.header}>
                <Text style={styles.title}>{isLogin ? "Welcome Back" : "Join Krishi Mitra"}</Text>
                <Text style={styles.subtitle}>{isLogin ? "Sign in to access your farm dashboard." : "Create an account to digitize your farming."}</Text>
            </View>

            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                {isLogin && (
                    <TouchableOpacity style={styles.forgotButton}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.mainButton} onPress={handleAuth} disabled={loading}>
                    <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.buttonGradient}>
                        <Text style={styles.buttonText}>{loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>{isLogin ? "New to Krishi Mitra? " : "Already have an account? "}</Text>
                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                        <Text style={styles.toggleAction}>{isLogin ? "Sign Up" : "Sign In"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center' },
    header: { paddingHorizontal: theme.spacing.xl, marginBottom: theme.spacing.xl },
    title: { fontSize: 32, fontWeight: '800', color: theme.colors.primary, marginBottom: 8 },
    subtitle: { fontSize: 16, color: theme.colors.textSecondary, lineHeight: 24 },
    formContainer: { paddingHorizontal: theme.spacing.xl },
    input: { backgroundColor: theme.colors.surface, paddingHorizontal: 20, paddingVertical: 18, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md, fontSize: 16, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
    forgotButton: { alignSelf: 'flex-end', marginBottom: theme.spacing.lg },
    forgotText: { color: theme.colors.primary, fontWeight: '600' },
    mainButton: { borderRadius: theme.borderRadius.full, overflow: 'hidden', marginBottom: theme.spacing.lg, ...theme.shadows.md },
    buttonGradient: { paddingVertical: 18, alignItems: 'center' },
    buttonText: { color: theme.colors.surface, fontSize: 16, fontWeight: '700' },
    toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.md },
    toggleText: { color: theme.colors.textSecondary, fontSize: 15 },
    toggleAction: { color: theme.colors.primary, fontWeight: '700', fontSize: 15 },
});
