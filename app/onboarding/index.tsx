import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../src/theme';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();
    const [step, setStep] = useState(0);

    const slides = [
        {
            title: 'Welcome to Krishi Mitra',
            description: 'Your AI-powered farming all-rounder. Empowering standard farmers with digital intelligence.',
        },
        {
            title: 'Scan & Cure Instantly',
            description: 'Find diseases in your crops using just your phone camera and get immediate solutions.',
        },
        {
            title: 'Direct Buyer Matches',
            description: 'Eliminate middlemen. Sell your harvest directly to restaurants and kitchens for higher profits.',
        }
    ];

    const handleNext = () => {
        if (step < slides.length - 1) {
            setStep(step + 1);
        } else {
            router.push('/auth' as any);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.imagePlaceholder}>
                <LinearGradient colors={['#A5D6A7', '#66BB6A']} style={styles.imageGradient}>
                    <Text style={styles.imageText}>🌾</Text>
                </LinearGradient>
            </View>

            <View style={styles.bottomSheet}>
                <View style={styles.pagination}>
                    {slides.map((_, i) => (
                        <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
                    ))}
                </View>

                <Text style={styles.title}>{slides[step].title}</Text>
                <Text style={styles.description}>{slides[step].description}</Text>

                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.buttonGradient}>
                        <Text style={styles.buttonText}>{step === slides.length - 1 ? "Get Started" : "Next"}</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {step < slides.length - 1 && (
                    <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/auth' as any)}>
                        <Text style={styles.skipText}>Skip Onboarding</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    imagePlaceholder: { flex: 1, width: '100%', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
    imageGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    imageText: { fontSize: 100 },
    bottomSheet: { padding: theme.spacing.xl, alignItems: 'center', paddingBottom: 60, minHeight: 320 },
    pagination: { flexDirection: 'row', marginBottom: theme.spacing.lg },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.border, marginHorizontal: 4 },
    dotActive: { width: 24, backgroundColor: theme.colors.primary },
    title: { fontSize: 24, fontWeight: '800', color: theme.colors.text, marginBottom: 12, textAlign: 'center' },
    description: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: theme.spacing.xl },
    button: { width: '100%', borderRadius: theme.borderRadius.full, overflow: 'hidden' },
    buttonGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: theme.colors.surface, fontSize: 16, fontWeight: '700' },
    skipButton: { marginTop: theme.spacing.lg, padding: 8 },
    skipText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '600' }
});
