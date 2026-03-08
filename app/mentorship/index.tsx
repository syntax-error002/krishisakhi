import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Award, PhoneCall, Calendar, PlayCircle, RefreshCcw } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { API_ENDPOINTS, apiCall } from '../../src/config/api';

interface Mentor {
  name: string;
  distanceKm: number;
  expertise: string;
  record: string;
  phone: string;
  nextAvailableVisit: string;
}

interface MentorsResponse {
  headline: string;
  mentors: Mentor[];
}

export default function MentorshipScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [headline, setHeadline] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const location = userProfile?.location || 'Pune, MH';
  const mainCrop = userProfile?.mainCrops?.split(',')[0]?.trim() || 'soybean';

  useEffect(() => {
    fetchMentors();
  }, [location, mainCrop]);

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const data = await apiCall<MentorsResponse>(API_ENDPOINTS.mentors, {
        method: 'POST',
        body: JSON.stringify({
          location: location,
          mainCrop: mainCrop,
        }),
      });
      setMentors(data.mentors);
      setHeadline(data.headline);
    } catch (error: any) {
      console.error('Failed to fetch mentors:', error);
      Alert.alert('Error', error.message || 'Failed to load mentor recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mentorship Network</Text>
        <TouchableOpacity onPress={fetchMentors} style={styles.refreshButton}>
          <RefreshCcw color={theme.colors.text} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Learn from the Best</Text>
        <Text style={styles.heroDesc}>
          {headline || 'Algorithmically matched with local top performers.'}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Finding mentors...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Your Recommended Mentors</Text>

          {mentors.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No mentors found in your area.</Text>
            </View>
          ) : (
            mentors.map((mentor, index) => (
              <View key={index} style={styles.mentorCard}>
                <View style={styles.mentorHeader}>
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{mentor.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.mentorInfo}>
                    <Text style={styles.mentorName}>{mentor.name}</Text>
                    <View style={styles.locationRow}>
                      <MapPin size={12} color={theme.colors.textSecondary} />
                      <Text style={styles.locationText}> {mentor.distanceKm.toFixed(1)} km away</Text>
                    </View>
                  </View>
                  <View style={styles.badgeLine}>
                    <Award size={16} color="#F57C00" />
                  </View>
                </View>

                <View style={styles.mentorStats}>
                  <Text style={styles.statText}>
                    <Text style={{ fontWeight: '700' }}>Expertise: </Text>
                    {mentor.expertise}
                  </Text>
                  <Text style={styles.statText}>
                    <Text style={{ fontWeight: '700' }}>Record: </Text>
                    {mentor.record}
                  </Text>
                  <Text style={[styles.statText, { fontSize: 12, color: theme.colors.textSecondary }]}>
                    Next Available: {mentor.nextAvailableVisit}
                  </Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCall(mentor.phone)}
                  >
                    <PhoneCall size={18} color={theme.colors.primary} />
                    <Text style={styles.actionText}> Call Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Calendar size={18} color={theme.colors.primary} />
                    <Text style={styles.actionText}> Sched. Visit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <View style={styles.communityCard}>
            <View style={styles.communityIcon}>
              <PlayCircle color={theme.colors.surface} size={32} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.communityTitle}>Live Workshop: Pest Control</Text>
              <Text style={styles.communityDesc}>
                Starting in 2 hours by Krishi Vigyan Kendra.
              </Text>
            </View>
          </View>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: theme.colors.background },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  refreshButton: { padding: 8 },
  heroSection: { padding: theme.spacing.lg },
  heroTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.primary, marginBottom: 8 },
  heroDesc: { fontSize: 16, color: theme.colors.textSecondary },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
  },
  mentorCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  mentorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: theme.colors.surface, fontSize: 24, fontWeight: '700' },
  mentorInfo: { flex: 1, marginLeft: 12 },
  mentorName: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 14, color: theme.colors.textSecondary },
  badgeLine: { backgroundColor: '#FFF3E0', padding: 8, borderRadius: 20 },
  mentorStats: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 16,
  },
  statText: { fontSize: 14, color: theme.colors.text, marginBottom: 4 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
    marginHorizontal: 4,
  },
  actionText: { fontWeight: '700', color: theme.colors.primary },
  communityCard: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: '#1976D2',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  communityIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.surface, marginBottom: 4 },
  communityDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
});
