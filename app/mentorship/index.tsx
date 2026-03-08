import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Award, PhoneCall, Calendar, PlayCircle, RefreshCcw, PlusCircle } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';

interface Mentor {
  id?: string;
  name: string;
  distanceKm: number;
  expertise: string;
  record: string;
  phone: string;
  nextAvailableVisit: string;
}

export default function MentorshipScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [expertise, setExpertise] = useState('');
  const [record, setRecord] = useState('');
  const [phone, setPhone] = useState(userProfile?.phone || '');

  const location = userProfile?.location || 'Pune, MH';

  useEffect(() => {
    fetchMentors();
  }, []);

  const seedMentors = async () => {
    const defaultMentors = [
      {
        name: 'Suresh Patil',
        distanceKm: 4.2,
        expertise: 'Soybean & Cotton',
        record: 'Top 5% in District',
        phone: '+919876543210',
        nextAvailableVisit: 'Tomorrow, 10 AM'
      },
      {
        name: 'Anand Rao',
        distanceKm: 12.0,
        expertise: 'Organic Farming',
        record: 'State Award Winner 2024',
        phone: '+919876543211',
        nextAvailableVisit: 'Friday, 2 PM'
      },
      {
        name: 'Meena Devi',
        distanceKm: 18.5,
        expertise: 'Wheat & Rice',
        record: 'Highest Yield 2024',
        phone: '+919876543212',
        nextAvailableVisit: 'Next Monday'
      }
    ];

    try {
      for (const mentor of defaultMentors) {
        await addDoc(collection(db, 'mentors'), mentor);
      }
    } catch (e) {
      console.log('Seeding error', e);
    }
  };

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const mentorsSnapshot = await getDocs(collection(db, 'mentors'));

      if (mentorsSnapshot.empty) {
        await seedMentors();
        fetchMentors(); // re-fetch after seeding
        return;
      }

      const mentorData: Mentor[] = [];
      mentorsSnapshot.forEach((doc) => {
        mentorData.push({ id: doc.id, ...doc.data() } as Mentor);
      });
      // Sort by distance roughly
      mentorData.sort((a, b) => a.distanceKm - b.distanceKm);
      setMentors(mentorData);
    } catch (error: any) {
      console.error('Failed to fetch mentors from Firestore:', error);
      Alert.alert('Error', error.message || 'Failed to load mentor recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!expertise || !record || !phone) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'mentors'), {
        name: userProfile?.name || 'Local Farmer',
        distanceKm: 1.5, // Mock distance
        expertise,
        record,
        phone,
        nextAvailableVisit: 'Flexible',
      });
      setShowModal(false);
      setExpertise('');
      setRecord('');
      fetchMentors(); // Refresh list
      Alert.alert('Success', 'You are now registered as a mentor!');
    } catch (error: any) {
      console.error('Registration failed:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCall = (phoneNum: string) => {
    Linking.openURL(`tel:${phoneNum}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
            Algorithmically matched with local top performers based in {location}.
          </Text>
          <TouchableOpacity style={styles.registerButton} onPress={() => setShowModal(true)}>
            <PlusCircle color={theme.colors.surface} size={20} />
            <Text style={styles.registerButtonText}>Register as a Mentor</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading network...</Text>
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
                <View key={mentor.id || index} style={styles.mentorCard}>
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

      {/* Registration Modal */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Become a Mentor</Text>
            <Text style={styles.modalDesc}>Share your knowledge to help local farmers.</Text>

            <Text style={styles.inputLabel}>Your Expertise</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Organic Wheat Farming"
              placeholderTextColor="#999"
              value={expertise}
              onChangeText={setExpertise}
            />

            <Text style={styles.inputLabel}>Track Record</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Yielded 3 tons/acre"
              placeholderTextColor="#999"
              value={record}
              onChangeText={setRecord}
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+91..."
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)} disabled={isSubmitting}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color={theme.colors.surface} />
                ) : (
                  <Text style={styles.submitBtnText}>Register</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  heroDesc: { fontSize: 16, color: theme.colors.textSecondary, marginBottom: 16 },
  registerButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  registerButtonText: { color: theme.colors.surface, fontWeight: '700', fontSize: 16, marginLeft: 8 },
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  modalDesc: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 8 },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  cancelBtnText: { color: theme.colors.textSecondary, fontWeight: '700', fontSize: 16 },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.md,
    marginLeft: 12,
  },
  submitBtnText: { color: theme.colors.surface, fontWeight: '700', fontSize: 16 },
});
