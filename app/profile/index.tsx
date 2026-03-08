import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Save, User as UserIcon, MapPin, Maximize, Sprout } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, userProfile, updateProfile } = useAuth();

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [farmSize, setFarmSize] = useState('');
    const [mainCrops, setMainCrops] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Pre-fill form if profile already exists
    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '');
            setLocation(userProfile.location || '');
            setFarmSize(userProfile.farmSize || '');
            setMainCrops(userProfile.mainCrops || '');
        }
    }, [userProfile]);

    const handleSave = async () => {
        if (!name || !location || !farmSize) {
            Alert.alert("Missing Fields", "Please complete the required details to verify your profile.");
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile({
                name,
                location,
                farmSize,
                mainCrops
            });
            Alert.alert("Success", "Your farming profile has been updated!");
            router.back();
        } catch (error: any) {
            console.log("Save error:", error);
            Alert.alert("Error", error.message || "Could not save profile details.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.avatarSection}>
                    <LinearGradient colors={[theme.colors.primaryLight, theme.colors.primary]} style={styles.avatarCircle}>
                        <Text style={styles.avatarInitials}>{name ? name.substring(0, 2).toUpperCase() : '👤'}</Text>
                    </LinearGradient>
                    <Text style={styles.emailText}>{user?.email}</Text>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Personal Info</Text>

                    <View style={styles.inputContainer}>
                        <UserIcon color={theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={theme.colors.textSecondary} value={name} onChangeText={setName} />
                    </View>

                    <View style={styles.inputContainer}>
                        <MapPin color={theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="District, State (e.g. Pune, MH)" placeholderTextColor={theme.colors.textSecondary} value={location} onChangeText={setLocation} />
                    </View>

                    <Text style={styles.sectionTitle}>Farm Details</Text>

                    <View style={styles.inputContainer}>
                        <Maximize color={theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="Total Farm Size (in Acres)" keyboardType="numeric" placeholderTextColor={theme.colors.textSecondary} value={farmSize} onChangeText={setFarmSize} />
                    </View>

                    <View style={styles.inputContainer}>
                        <Sprout color={theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="Main Crops Currently Grown (e.g. Wheat, Soy)" placeholderTextColor={theme.colors.textSecondary} value={mainCrops} onChangeText={setMainCrops} />
                    </View>

                </View>

                <TouchableOpacity style={styles.actionButton} onPress={handleSave} disabled={isSaving}>
                    <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.buttonGradient}>
                        {isSaving ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <Save color={theme.colors.surface} size={20} style={{ marginRight: 8 }} />
                                <Text style={styles.buttonText}>Save Profile Data</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, paddingTop: 60, paddingBottom: theme.spacing.md, backgroundColor: theme.colors.surface, ...theme.shadows.sm },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
    content: { flex: 1, padding: theme.spacing.lg },
    avatarSection: { alignItems: 'center', marginBottom: theme.spacing.xl, marginTop: theme.spacing.md },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12, ...theme.shadows.md },
    avatarInitials: { fontSize: 32, fontWeight: 'bold', color: theme.colors.surface },
    emailText: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '500' },
    formSection: { marginBottom: theme.spacing.xl },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 12, marginTop: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, marginBottom: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, paddingVertical: 16, fontSize: 16, color: theme.colors.text },
    actionButton: { borderRadius: theme.borderRadius.full, overflow: 'hidden', ...theme.shadows.md },
    buttonGradient: { flexDirection: 'row', paddingVertical: 18, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: theme.colors.surface, fontSize: 16, fontWeight: '700' }
});
