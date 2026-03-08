import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Award, PhoneCall, Calendar, PlayCircle } from 'lucide-react-native';
import { theme } from '../../src/theme';

export default function MentorshipScreen() {
    const router = useRouter();

    const mentors = [
        { name: 'Suresh Patil', distance: '4 km', yield: 'Top 5% in District', crop: 'Soybean & Cotton' },
        { name: 'Anand Rao', distance: '12 km', yield: 'Organic Farming Expert', crop: 'Tomatoes & Onion' },
        { name: 'Meena Devi', distance: '18 km', yield: 'Highest Yield 2024', crop: 'Wheat & Rice' },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mentorship Network</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.heroSection}>
                <Text style={styles.heroTitle}>Learn from the Best</Text>
                <Text style={styles.heroDesc}>Algorithmically matched with local top performers.</Text>
            </View>

            <Text style={styles.sectionTitle}>Your Recommended Mentors</Text>

            {mentors.map((mentor, index) => (
                <View key={index} style={styles.mentorCard}>
                    <View style={styles.mentorHeader}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{mentor.name.charAt(0)}</Text>
                        </View>
                        <View style={styles.mentorInfo}>
                            <Text style={styles.mentorName}>{mentor.name}</Text>
                            <View style={styles.locationRow}>
                                <MapPin size={12} color={theme.colors.textSecondary} />
                                <Text style={styles.locationText}> {mentor.distance} away</Text>
                            </View>
                        </View>
                        <View style={styles.badgeLine}>
                            <Award size={16} color="#F57C00" />
                        </View>
                    </View>

                    <View style={styles.mentorStats}>
                        <Text style={styles.statText}><Text style={{ fontWeight: '700' }}>Expertise: </Text>{mentor.crop}</Text>
                        <Text style={styles.statText}><Text style={{ fontWeight: '700' }}>Record: </Text>{mentor.yield}</Text>
                    </View>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionButton}>
                            <PhoneCall size={18} color={theme.colors.primary} />
                            <Text style={styles.actionText}> Call Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Calendar size={18} color={theme.colors.primary} />
                            <Text style={styles.actionText}> Sched. Visit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}

            <View style={styles.communityCard}>
                <View style={styles.communityIcon}>
                    <PlayCircle color={theme.colors.surface} size={32} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.communityTitle}>Live Workshop: Pest Control</Text>
                    <Text style={styles.communityDesc}>Starting in 2 hours by Krishi Vigyan Kendra.</Text>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: theme.spacing.lg, backgroundColor: theme.colors.surface, ...theme.shadows.sm },
    backButton: { padding: 8, borderRadius: 20, backgroundColor: theme.colors.background },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
    heroSection: { padding: theme.spacing.lg },
    heroTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.primary, marginBottom: 8 },
    heroDesc: { fontSize: 16, color: theme.colors.textSecondary },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md },
    mentorCard: { backgroundColor: theme.colors.surface, marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg, borderRadius: theme.borderRadius.xl, padding: theme.spacing.lg, ...theme.shadows.sm },
    mentorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: theme.colors.surface, fontSize: 24, fontWeight: '700' },
    mentorInfo: { flex: 1, marginLeft: 12 },
    mentorName: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center' },
    locationText: { fontSize: 14, color: theme.colors.textSecondary },
    badgeLine: { backgroundColor: '#FFF3E0', padding: 8, borderRadius: 20 },
    mentorStats: { backgroundColor: theme.colors.background, padding: 12, borderRadius: theme.borderRadius.md, marginBottom: 16 },
    statText: { fontSize: 14, color: theme.colors.text, marginBottom: 4 },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.primaryLight, marginHorizontal: 4 },
    actionText: { fontWeight: '700', color: theme.colors.primary },
    communityCard: { marginHorizontal: theme.spacing.lg, backgroundColor: '#1976D2', borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.md },
    communityIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    communityTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.surface, marginBottom: 4 },
    communityDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
});
