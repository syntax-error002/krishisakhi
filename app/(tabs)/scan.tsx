import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Image as ImageIcon, ScanLine, AlertCircle, CheckCircle } from 'lucide-react-native';
import { theme } from '../../src/theme';

export default function ScanScreen() {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>AI Disease Scan</Text>
                <Text style={styles.subtitle}>Detect crop issues instantly with our AI model.</Text>
            </View>

            {/* Main Scanner Area Placeholder */}
            <View style={styles.scannerWrapper}>
                <LinearGradient
                    colors={['rgba(76,175,80,0.1)', 'rgba(27,94,32,0.05)']}
                    style={styles.scannerBox}
                >
                    <View style={styles.scannerFrame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />

                        <ScanLine color={theme.colors.primary} size={64} style={styles.scanIcon} />
                        <Text style={styles.instructionText}>Position crop leaf inside frame</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.primaryButton}>
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.primaryDark]}
                        style={styles.buttonGradient}
                    >
                        <Camera color={theme.colors.surface} size={24} />
                        <Text style={styles.buttonText}>Open Camera</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton}>
                    <ImageIcon color={theme.colors.primary} size={24} />
                    <Text style={styles.secondaryButtonText}>Upload Image</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Scans */}
            <Text style={styles.sectionTitle}>Recent Scans</Text>

            <View style={styles.historyCard}>
                <View style={styles.historyIconBg}>
                    <AlertCircle color={theme.colors.error} size={24} />
                </View>
                <View style={styles.historyTextContainer}>
                    <Text style={styles.historyTitle}>Tomato Leaf Blight</Text>
                    <Text style={styles.historyDate}>Today, 10:42 AM</Text>
                </View>
                <TouchableOpacity style={styles.historyAction}>
                    <Text style={styles.historyActionText}>View Fix</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.historyCard}>
                <View style={[styles.historyIconBg, { backgroundColor: '#E8F5E9' }]}>
                    <CheckCircle color={theme.colors.success} size={24} />
                </View>
                <View style={styles.historyTextContainer}>
                    <Text style={styles.historyTitle}>Wheat Crop (Healthy)</Text>
                    <Text style={styles.historyDate}>Yesterday, 4:15 PM</Text>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.lg,
    },
    header: {
        marginTop: 60,
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: theme.typography.h1.fontSize,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.textSecondary,
        lineHeight: 24,
    },
    scannerWrapper: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    scannerBox: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    scannerFrame: {
        width: '80%',
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: theme.colors.primary,
    },
    topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
    topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
    bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
    bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
    scanIcon: {
        marginBottom: theme.spacing.md,
        opacity: 0.8,
    },
    instructionText: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.bodySecondary.fontSize,
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl,
    },
    primaryButton: {
        flex: 1,
        marginRight: theme.spacing.sm,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        ...theme.shadows.sm,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    buttonText: {
        color: theme.colors.surface,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    secondaryButton: {
        flex: 1,
        marginLeft: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    secondaryButtonText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: theme.typography.h3.fontSize,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    historyIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFEBEE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    historyTextContainer: {
        flex: 1,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 4,
    },
    historyDate: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    historyAction: {
        backgroundColor: theme.colors.inputBackground,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
    },
    historyActionText: {
        color: theme.colors.primary,
        fontWeight: '600',
        fontSize: 12,
    },
});
