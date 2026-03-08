import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image,
    ActivityIndicator, ScrollView, Animated, Easing,
    Dimensions, Platform
} from 'react-native';
import {
    Camera, ImagePlus, Leaf, AlertCircle, Scan,
    FlaskConical, CheckCircle2, ChevronRight,
    Thermometer, Droplets, Bug, Sprout, RotateCcw, X
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_W } = Dimensions.get('window');

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_SCAN_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_VISION_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;

const SYSTEM_PROMPT = `
You are an expert agricultural AI assistant named "Krishi Scan".
Your sole purpose is to analyze images of crop leaves, plants, or soil to detect diseases, pests, or deficiencies.

When an image is provided:
1. Identify the crop if possible.
2. Identify the disease, pest, or nutrient deficiency present.
3. Provide a clear, actionable remedy or treatment plan (organic preferred, chemical as backup).
4. Provide a confidence score (0-100%).
5. List 2-3 preventive measures for the future.
6. Estimate urgency: how soon the farmer should act.

Respond ONLY in the following strict JSON format, nothing else:
{
  "isCrop": boolean,
  "cropName": "Name of crop (or 'Unknown')",
  "issue": "Name of disease/pest/issue (or 'Healthy')",
  "issueType": "Disease" | "Pest" | "Deficiency" | "Healthy",
  "severity": "Low" | "Medium" | "High" | "None",
  "confidence": number (0-100),
  "remedy": "Detailed step-by-step treatment or prevention advice.",
  "prevention": ["tip 1", "tip 2", "tip 3"],
  "urgency": "Immediate" | "Within a week" | "Monitor" | "None",
  "affectedArea": "Estimated % of plant affected (e.g. 30%)"
}

If the image is NOT a plant, leaf, or agriculture-related, return:
{
  "isCrop": false,
  "cropName": "",
  "issue": "",
  "issueType": "Healthy",
  "severity": "None",
  "confidence": 0,
  "remedy": "Please upload a clear image of a crop leaf or plant.",
  "prevention": [],
  "urgency": "None",
  "affectedArea": "0%"
}
`;

// ── Severity config ────────────────────────────────
const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    High: { color: '#ef4444', bg: '#fef2f2', label: 'High Risk' },
    Medium: { color: '#f59e0b', bg: '#fffbeb', label: 'Medium Risk' },
    Low: { color: '#eab308', bg: '#fefce8', label: 'Low Risk' },
    None: { color: '#10b981', bg: '#f0fdf4', label: 'Healthy' },
};

const ISSUE_ICONS: Record<string, any> = {
    Disease: Thermometer,
    Pest: Bug,
    Deficiency: Droplets,
    Healthy: CheckCircle2,
};

// ── Scanning animation overlay ─────────────────────
function ScanOverlay() {
    const scanY = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanY, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(scanY, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const translateY = scanY.interpolate({ inputRange: [0, 1], outputRange: [0, 280] });

    return (
        <View style={StyleSheet.absoluteFillObject}>
            {/* Corner brackets */}
            {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h]) => (
                <View key={`${v}${h}`} style={[styles.corner, {
                    [v]: 16, [h]: 16,
                    borderTopWidth: v === 'top' ? 3 : 0,
                    borderBottomWidth: v === 'bottom' ? 3 : 0,
                    borderLeftWidth: h === 'left' ? 3 : 0,
                    borderRightWidth: h === 'right' ? 3 : 0,
                }]} />
            ))}
            {/* Scan line */}
            <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]}>
                <LinearGradient
                    colors={['transparent', 'rgba(74,222,128,0.9)', 'transparent']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ flex: 1, height: 2 }}
                />
            </Animated.View>
            {/* Centre pulse */}
            <View style={styles.scanCentre} pointerEvents="none">
                <Animated.View style={[styles.scanPulse, { transform: [{ scale: pulseAnim }], opacity: 0.25 }]} />
                <Animated.View style={[styles.scanPulseInner, { transform: [{ scale: pulseAnim }] }]} />
            </View>
        </View>
    );
}

// ── Result section header ──────────────────────────
function SectionLabel({ icon: Icon, label }: { icon: any; label: string }) {
    return (
        <View style={styles.sectionLabel}>
            <Icon size={14} color={theme.colors.primary} strokeWidth={2.5} />
            <Text style={styles.sectionLabelText}>{label}</Text>
        </View>
    );
}

// ── Urgency pill ───────────────────────────────────
function UrgencyPill({ urgency }: { urgency: string }) {
    const config: Record<string, { color: string; bg: string }> = {
        Immediate: { color: '#ef4444', bg: '#fef2f2' },
        'Within a week': { color: '#f59e0b', bg: '#fffbeb' },
        Monitor: { color: '#3b82f6', bg: '#eff6ff' },
        None: { color: '#10b981', bg: '#f0fdf4' },
    };
    const c = config[urgency] ?? config.None;
    return (
        <View style={[styles.urgencyPill, { backgroundColor: c.bg }]}>
            <View style={[styles.urgencyDot, { backgroundColor: c.color }]} />
            <Text style={[styles.urgencyText, { color: c.color }]}>{urgency === 'None' ? 'No action needed' : `Act: ${urgency}`}</Text>
        </View>
    );
}

// ── Main Screen ────────────────────────────────────
export default function AiScanScreen() {
    const insets = useSafeAreaInsets();
    const { userProfile } = useAuth();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'remedy' | 'prevention'>('remedy');

    // Animations
    const cardAnim = useRef(new Animated.Value(0)).current;
    const imageAnim = useRef(new Animated.Value(0)).current;
    const resultFade = useRef(new Animated.Value(0)).current;

    const animateImageIn = () => {
        Animated.spring(imageAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }).start();
    };

    const animateResultIn = () => {
        Animated.timing(resultFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    };

    // 1. Pick Image
    const pickImage = async (useCamera = false) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (useCamera) {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') { setErrorMsg('Camera access is required.'); return; }
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') { setErrorMsg('Gallery access is required.'); return; }
            }

            const options: ImagePicker.ImagePickerOptions = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true, aspect: [4, 3], quality: 0.6, base64: true,
            };

            const picked = useCamera
                ? await ImagePicker.launchCameraAsync(options)
                : await ImagePicker.launchImageLibraryAsync(options);

            if (!picked.canceled && picked.assets[0].base64) {
                imageAnim.setValue(0);
                resultFade.setValue(0);
                setImageUri(picked.assets[0].uri);
                setImageBase64(picked.assets[0].base64);
                setResult(null);
                setErrorMsg(null);
                animateImageIn();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch {
            setErrorMsg('Failed to open camera/gallery.');
        }
    };

    // 2. Analyze
    const analyzeImage = async () => {
        if (!imageBase64) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);
        setScanning(true);
        setErrorMsg(null);

        try {
            if (!GEMINI_API_KEY) throw new Error('Gemini API Key missing.');

            // Using the new URL provided by user
            const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

            const payload = {
                contents: [{
                    parts: [
                        { text: SYSTEM_PROMPT + `\n\nFarmer location: ${userProfile?.location || 'Unknown'}. Analyze this crop image.` },
                        { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } },
                    ],
                }],
                generationConfig: { temperature: 0.2, response_mime_type: 'application/json' },
            };

            // Simulate scan duration for UX
            await new Promise(r => setTimeout(r, 1500));

            console.log("SENDING REQUEST TO GEMINI...");

            const res = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_API_KEY // Passing API key via headers as requested
                },
                body: JSON.stringify(payload),
            });

            console.log("GEMINI RESPONDED WITH STATUS:", res.status);

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Gemini API Error details:", errorText);
                throw new Error(`API Request Failed: ${res.status}`);
            }

            const data = await res.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) throw new Error('No response from AI');

            const jsonResult = JSON.parse(rawText);
            setResult(jsonResult);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            animateResultIn();
        } catch (err: any) {
            console.error("Scan error explicitly caught:", err);
            setErrorMsg(err.message || 'Analysis failed. Please try again with a clearer image.');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
            setScanning(false);
        }
    };

    const reset = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setImageUri(null);
        setImageBase64(null);
        setResult(null);
        setErrorMsg(null);
        imageAnim.setValue(0);
        resultFade.setValue(0);
    };

    const sevConfig = result ? (SEVERITY_CONFIG[result.severity] ?? SEVERITY_CONFIG.None) : SEVERITY_CONFIG.None;
    const IssueIcon = result ? (ISSUE_ICONS[result.issueType] ?? Leaf) : Leaf;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ── Header ── */}
            <LinearGradient
                colors={['#f0fdf4', '#ffffff']}
                style={styles.header}
            >
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.headerEyebrow}>Powered by Gemini Vision</Text>
                        <Text style={styles.headerTitle}>AI Crop Scan</Text>
                    </View>
                    <View style={styles.headerBadge}>
                        <Leaf size={16} color="#166534" strokeWidth={2.5} />
                        <Text style={styles.headerBadgeText}>Live</Text>
                    </View>
                </View>
                <Text style={styles.headerSub}>Detect 100+ diseases, pests & deficiencies instantly</Text>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Upload Zone ── */}
                {!imageUri ? (
                    <View style={styles.uploadZone}>
                        <LinearGradient
                            colors={['#f0fdf4', '#dcfce7']}
                            style={styles.iconCircle}
                        >
                            <Sprout size={40} color="#16a34a" strokeWidth={1.5} />
                        </LinearGradient>

                        <Text style={styles.uploadTitle}>Scan a Leaf or Plant</Text>
                        <Text style={styles.uploadSub}>
                            Take a clear, well-lit photo of the affected leaf or plant.{'\n'}
                            Our AI will diagnose it in seconds.
                        </Text>

                        <View style={styles.tipsRow}>
                            {['Good lighting', 'Clear focus', 'Close-up'].map(t => (
                                <View key={t} style={styles.tipPill}>
                                    <CheckCircle2 size={11} color="#16a34a" />
                                    <Text style={styles.tipText}>{t}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.btnRow}>
                            <TouchableOpacity
                                style={styles.actionBtnPrimary}
                                onPress={() => pickImage(true)}
                                activeOpacity={0.85}
                            >
                                <Camera color="#fff" size={20} strokeWidth={2} />
                                <Text style={styles.btnTextPrimary}>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionBtnSecondary}
                                onPress={() => pickImage(false)}
                                activeOpacity={0.85}
                            >
                                <ImagePlus color="#16a34a" size={20} strokeWidth={2} />
                                <Text style={styles.btnTextSecondary}>Gallery</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <Animated.View style={[styles.previewContainer, {
                        opacity: imageAnim,
                        transform: [{ scale: imageAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }]
                    }]}>
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />

                        {/* Scan overlay when analyzing */}
                        {scanning && <ScanOverlay />}

                        {/* Image overlay gradient */}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.55)']}
                            style={StyleSheet.absoluteFillObject}
                            pointerEvents="none"
                        />

                        {/* Retake button top-right */}
                        {!loading && (
                            <TouchableOpacity style={styles.retakeFab} onPress={reset}>
                                <X size={16} color="#fff" />
                            </TouchableOpacity>
                        )}

                        {!result && !loading && (
                            <View style={styles.previewActions}>
                                <TouchableOpacity
                                    style={styles.analyzeBtn}
                                    onPress={analyzeImage}
                                    activeOpacity={0.9}
                                >
                                    <FlaskConical color="#fff" size={20} />
                                    <Text style={styles.analyzeText}>Analyze Now</Text>
                                    <ChevronRight color="#fff" size={18} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                )}

                {/* ── Loading ── */}
                {loading && (
                    <View style={styles.loadingCard}>
                        <View style={styles.loadingIconRow}>
                            <ActivityIndicator size="small" color="#16a34a" />
                            <Text style={styles.loadingLabel}>ANALYZING</Text>
                        </View>
                        <Text style={styles.loadingTitle}>Krishi AI is scanning your crop</Text>
                        {['Detecting crop type...', 'Scanning for diseases & pests...', 'Generating recommendations...'].map((step, i) => (
                            <View key={i} style={styles.loadingStep}>
                                <View style={[styles.loadingDot, { backgroundColor: '#bbf7d0' }]} />
                                <Text style={styles.loadingStepText}>{step}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Error ── */}
                {errorMsg && (
                    <View style={styles.errorCard}>
                        <AlertCircle color="#ef4444" size={20} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.errorTitle}>Analysis Failed</Text>
                            <Text style={styles.errorText}>{errorMsg}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setErrorMsg(null)}>
                            <X size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── Results ── */}
                {result && (
                    <Animated.View style={{ opacity: resultFade }}>
                        {!result.isCrop ? (
                            <View style={styles.notCropCard}>
                                <View style={styles.notCropIcon}>
                                    <AlertCircle size={32} color="#ef4444" />
                                </View>
                                <Text style={styles.notCropTitle}>Not a Crop Image</Text>
                                <Text style={styles.notCropDesc}>{result.remedy}</Text>
                                <TouchableOpacity style={styles.tryAgainBtn} onPress={reset}>
                                    <RotateCcw size={18} color="#fff" />
                                    <Text style={styles.tryAgainText}>Try Again</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                {/* ── Result Hero Card ── */}
                                <View style={[styles.resultHeroCard, { borderColor: sevConfig.color + '33' }]}>
                                    <LinearGradient
                                        colors={[sevConfig.bg, '#ffffff']}
                                        style={styles.resultHeroGrad}
                                    />
                                    <View style={styles.resultHeroTop}>
                                        <View style={[styles.resultIssueIcon, { backgroundColor: sevConfig.color + '18' }]}>
                                            <IssueIcon size={28} color={sevConfig.color} strokeWidth={1.8} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.resultCropLabel, { color: theme.colors.primary }]}>
                                                {result.cropName.toUpperCase()}
                                            </Text>
                                            <Text style={styles.resultIssueName}>{result.issue}</Text>
                                            <Text style={styles.resultIssueType}>{result.issueType}</Text>
                                        </View>
                                        <View style={[styles.severityBadge, { backgroundColor: sevConfig.color + '18', borderColor: sevConfig.color + '44' }]}>
                                            <Text style={[styles.severityBadgeText, { color: sevConfig.color }]}>{sevConfig.label}</Text>
                                        </View>
                                    </View>

                                    {/* Stats row */}
                                    <View style={styles.statsRow}>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{result.confidence}%</Text>
                                            <Text style={styles.statLabel}>Confidence</Text>
                                        </View>
                                        <View style={styles.statDivider} />
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{result.affectedArea ?? '—'}</Text>
                                            <Text style={styles.statLabel}>Affected</Text>
                                        </View>
                                        <View style={styles.statDivider} />
                                        <View style={styles.statItem}>
                                            <UrgencyPill urgency={result.urgency} />
                                        </View>
                                    </View>

                                    {/* Confidence bar */}
                                    {result.severity !== 'None' && (
                                        <View style={styles.confBarWrap}>
                                            <View style={styles.confBarBg}>
                                                <LinearGradient
                                                    colors={[sevConfig.color + 'aa', sevConfig.color]}
                                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                                    style={[styles.confBarFill, { width: `${result.confidence}%` }]}
                                                />
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* ── Tab: Remedy / Prevention ── */}
                                <View style={styles.tabRow}>
                                    {(['remedy', 'prevention'] as const).map(tab => (
                                        <TouchableOpacity
                                            key={tab}
                                            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                                            onPress={() => setActiveTab(tab)}
                                        >
                                            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                                                {tab === 'remedy' ? '💊 Treatment' : '🛡️ Prevention'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {activeTab === 'remedy' ? (
                                    <View style={styles.remedyCard}>
                                        <SectionLabel icon={FlaskConical} label="Expert Recommendation" />
                                        <Text style={styles.remedyText}>{result.remedy}</Text>
                                    </View>
                                ) : (
                                    <View style={styles.remedyCard}>
                                        <SectionLabel icon={Sprout} label="Preventive Measures" />
                                        {(result.prevention ?? []).map((tip: string, i: number) => (
                                            <View key={i} style={styles.preventionItem}>
                                                <View style={styles.preventionNum}>
                                                    <Text style={styles.preventionNumText}>{i + 1}</Text>
                                                </View>
                                                <Text style={styles.preventionTip}>{tip}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* ── Scan Another ── */}
                                <TouchableOpacity style={styles.scanAnotherBtn} onPress={reset} activeOpacity={0.85}>
                                    <Scan size={18} color="#16a34a" />
                                    <Text style={styles.scanAnotherText}>Scan Another Crop</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                )}
            </ScrollView>
        </View>
    );
}

// ── Styles ─────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafafa' },

    // Header
    header: { paddingHorizontal: 24, paddingBottom: 20, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    headerEyebrow: { fontSize: 11, fontWeight: '600', color: '#16a34a', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 },
    headerTitle: { fontSize: 30, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
    headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#dcfce7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#bbf7d0' },
    headerBadgeText: { fontSize: 12, fontWeight: '700', color: '#166534' },
    headerSub: { fontSize: 14, color: '#6b7280', marginTop: 4 },

    scrollContent: { padding: 20, gap: 16 },

    // Upload zone
    uploadZone: {
        backgroundColor: '#fff', borderRadius: 24, padding: 28,
        alignItems: 'center', borderWidth: 2, borderColor: '#d1fae5',
        borderStyle: 'dashed',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    },
    iconCircle: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    uploadTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
    uploadSub: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 16 },

    tipsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
    tipPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    tipText: { fontSize: 11, color: '#15803d', fontWeight: '600' },

    btnRow: { flexDirection: 'row', gap: 12, width: '100%' },
    actionBtnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 16, backgroundColor: '#16a34a', gap: 8, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    actionBtnSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 16, backgroundColor: '#f0fdf4', borderWidth: 1.5, borderColor: '#bbf7d0', gap: 8 },
    btnTextPrimary: { color: '#fff', fontWeight: '700', fontSize: 15 },
    btnTextSecondary: { color: '#16a34a', fontWeight: '700', fontSize: 15 },

    // Preview
    previewContainer: { borderRadius: 24, overflow: 'hidden', backgroundColor: '#000', minHeight: 320, position: 'relative' },
    previewImage: { width: '100%', height: 320, resizeMode: 'cover' },
    retakeFab: { position: 'absolute', top: 14, right: 14, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
    previewActions: { position: 'absolute', bottom: 20, left: 20, right: 20 },
    analyzeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#16a34a', paddingVertical: 16, borderRadius: 18, gap: 8, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
    analyzeText: { color: '#fff', fontWeight: '800', fontSize: 16, flex: 1, textAlign: 'center' },

    // Scan overlay
    corner: { position: 'absolute', width: 28, height: 28, borderColor: '#4ade80' },
    scanLine: { position: 'absolute', left: 0, right: 0, height: 2 },
    scanCentre: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    scanPulse: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#4ade80' },
    scanPulseInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#4ade80', opacity: 0.4 },

    // Loading
    loadingCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
    loadingIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    loadingLabel: { fontSize: 11, fontWeight: '800', color: '#16a34a', letterSpacing: 1.5 },
    loadingTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 16 },
    loadingStep: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    loadingDot: { width: 8, height: 8, borderRadius: 4 },
    loadingStepText: { fontSize: 14, color: '#6b7280' },

    // Error
    errorCard: { backgroundColor: '#fef2f2', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: '#fecaca' },
    errorTitle: { fontSize: 14, fontWeight: '700', color: '#b91c1c', marginBottom: 2 },
    errorText: { fontSize: 13, color: '#ef4444', lineHeight: 18 },

    // Result hero
    resultHeroCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, borderWidth: 1.5, overflow: 'hidden', marginBottom: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
    resultHeroGrad: { ...StyleSheet.absoluteFillObject },
    resultHeroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 20 },
    resultIssueIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    resultCropLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 2 },
    resultIssueName: { fontSize: 20, fontWeight: '800', color: '#111827', lineHeight: 24 },
    resultIssueType: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    severityBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
    severityBadgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

    statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#f3f4f6' },
    statItem: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
    statLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginTop: 2 },
    statDivider: { width: 1, height: 32, backgroundColor: '#e5e7eb' },

    confBarWrap: { marginTop: 4 },
    confBarBg: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
    confBarFill: { height: '100%', borderRadius: 3 },

    // Urgency pill
    urgencyPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    urgencyDot: { width: 6, height: 6, borderRadius: 3 },
    urgencyText: { fontSize: 11, fontWeight: '700' },

    // Tabs
    tabRow: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 14, padding: 4, marginBottom: 4 },
    tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    tabBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
    tabBtnText: { fontSize: 14, fontWeight: '600', color: '#9ca3af' },
    tabBtnTextActive: { color: '#111827', fontWeight: '700' },

    // Remedy / prevention
    remedyCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
    sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    sectionLabelText: { fontSize: 12, fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.8 },
    remedyText: { fontSize: 15, color: '#374151', lineHeight: 24 },

    preventionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
    preventionNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center', marginTop: 1 },
    preventionNumText: { fontSize: 12, fontWeight: '800', color: '#16a34a' },
    preventionTip: { flex: 1, fontSize: 15, color: '#374151', lineHeight: 22 },

    // Scan another
    scanAnotherBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16, backgroundColor: '#f0fdf4', borderWidth: 1.5, borderColor: '#bbf7d0', marginTop: 4 },
    scanAnotherText: { color: '#16a34a', fontWeight: '700', fontSize: 15 },

    // Not crop
    notCropCard: { backgroundColor: '#fff', borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#fecaca', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
    notCropIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    notCropTitle: { fontSize: 20, fontWeight: '800', color: '#b91c1c', marginBottom: 10 },
    notCropDesc: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    tryAgainBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#16a34a', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16 },
    tryAgainText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});