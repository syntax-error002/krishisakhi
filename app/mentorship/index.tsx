import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Linking, Modal, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Award, PhoneCall, Calendar, PlayCircle, RefreshCcw, PlusCircle, X, CheckCircle } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
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
  const { user, userProfile } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Register as mentor modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expertise, setExpertise] = useState('');
  const [record, setRecord] = useState('');
  const [regPhone, setRegPhone] = useState(userProfile?.phone || '');

  // Schedule visit modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedMsg, setSchedMsg] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const location = userProfile?.location || 'Pune, MH';

  useEffect(() => { fetchMentors(); }, []);

  const seedMentors = async () => {
    const defaultMentors = [
      { name: 'Suresh Patil', distanceKm: 4.2, expertise: 'Soybean & Cotton', record: 'Top 5% in District', phone: '+919876543210', nextAvailableVisit: 'Tomorrow, 10 AM' },
      { name: 'Anand Rao', distanceKm: 12.0, expertise: 'Organic Farming', record: 'State Award Winner 2024', phone: '+919876543211', nextAvailableVisit: 'Friday, 2 PM' },
      { name: 'Meena Devi', distanceKm: 18.5, expertise: 'Wheat & Rice', record: 'Highest Yield 2024', phone: '+919876543212', nextAvailableVisit: 'Next Monday' },
    ];
    try {
      for (const mentor of defaultMentors) {
        await addDoc(collection(db, 'mentors'), mentor);
      }
    } catch (e) { console.log('Seeding error', e); }
  };

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'mentors'));
      if (snap.empty) { await seedMentors(); fetchMentors(); return; }
      const data: Mentor[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Mentor));
      data.sort((a, b) => a.distanceKm - b.distanceKm);
      setMentors(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load mentors.');
    } finally { setIsLoading(false); }
  };

  // ── Register as mentor ───────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!expertise || !record || !regPhone) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'mentors'), {
        name: userProfile?.name || 'Local Farmer',
        distanceKm: 1.5,
        expertise,
        record,
        phone: regPhone,
        nextAvailableVisit: 'Flexible',
      });
      setShowRegisterModal(false);
      setExpertise(''); setRecord('');
      fetchMentors();
      Alert.alert('🎉 Registered!', 'You are now listed as a mentor in your community.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally { setIsSubmitting(false); }
  };

  // ── Schedule a visit ─────────────────────────────────────────────────────
  const openScheduleModal = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setSchedDate('');
    setSchedTime('');
    setSchedMsg('');
    setShowScheduleModal(true);
  };

  const handleScheduleVisit = async () => {
    if (!schedDate || !schedTime) {
      Alert.alert('Missing Info', 'Please enter preferred date and time.');
      return;
    }
    if (!selectedMentor) return;
    setIsScheduling(true);
    try {
      await addDoc(collection(db, 'mentorship_schedules'), {
        mentorId: selectedMentor.id || '',
        mentorName: selectedMentor.name,
        mentorPhone: selectedMentor.phone,
        farmerName: userProfile?.name || 'Farmer',
        farmerId: user?.uid || '',
        farmerLocation: location,
        preferredDate: schedDate,
        preferredTime: schedTime,
        message: schedMsg || `I'd like to learn from you about ${selectedMentor.expertise}.`,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setShowScheduleModal(false);
      Alert.alert(
        '✅ Visit Scheduled!',
        `Your request has been sent to ${selectedMentor.name}. They will confirm via phone (${selectedMentor.phone}).`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not schedule visit. Please try again.');
    } finally { setIsScheduling(false); }
  };

  const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
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
          <Text style={styles.heroTitle}>Learn from the Best 🌾</Text>
          <Text style={styles.heroDesc}>
            Algorithmically matched with local top performers near {location}.
          </Text>
          <TouchableOpacity style={styles.registerButton} onPress={() => setShowRegisterModal(true)}>
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
                      <Text style={{ fontWeight: '700' }}>Expertise: </Text>{mentor.expertise}
                    </Text>
                    <Text style={styles.statText}>
                      <Text style={{ fontWeight: '700' }}>Record: </Text>{mentor.record}
                    </Text>
                    <View style={styles.availRow}>
                      <Calendar size={12} color={theme.colors.primary} />
                      <Text style={styles.availText}> Next Available: {mentor.nextAvailableVisit}</Text>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleCall(mentor.phone)}>
                      <PhoneCall size={16} color={theme.colors.primary} />
                      <Text style={styles.actionText}> Call Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.scheduleBtn]}
                      onPress={() => openScheduleModal(mentor)}
                    >
                      <Calendar size={16} color="#fff" />
                      <Text style={[styles.actionText, { color: '#fff' }]}> Schedule Visit</Text>
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
                <Text style={styles.communityDesc}>Starting in 2 hours by Krishi Vigyan Kendra.</Text>
              </View>
            </View>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Register as Mentor Modal ──────────────────────────────────────── */}
      <Modal visible={showRegisterModal} animationType="slide" transparent onRequestClose={() => setShowRegisterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Become a Mentor 🌱</Text>
              <TouchableOpacity onPress={() => setShowRegisterModal(false)} style={styles.modalClose}>
                <X color={theme.colors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>Share your knowledge to help local farmers.</Text>

            <Text style={styles.inputLabel}>Your Expertise</Text>
            <TextInput style={styles.input} placeholder="e.g. Organic Wheat Farming" placeholderTextColor="#999" value={expertise} onChangeText={setExpertise} />

            <Text style={styles.inputLabel}>Track Record</Text>
            <TextInput style={styles.input} placeholder="e.g. Yielded 3 tons/acre" placeholderTextColor="#999" value={record} onChangeText={setRecord} />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput style={styles.input} placeholder="+91..." placeholderTextColor="#999" keyboardType="phone-pad" value={regPhone} onChangeText={setRegPhone} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRegisterModal(false)} disabled={isSubmitting}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Register</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Schedule Visit Modal ──────────────────────────────────────────── */}
      <Modal visible={showScheduleModal} animationType="slide" transparent onRequestClose={() => setShowScheduleModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📅 Schedule a Visit</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)} style={styles.modalClose}>
                <X color={theme.colors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>
            {selectedMentor && (
              <View style={styles.mentorMiniCard}>
                <View style={styles.mentorMiniAvatar}>
                  <Text style={styles.avatarText}>{selectedMentor.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.mentorMiniName}>{selectedMentor.name}</Text>
                  <Text style={styles.mentorMiniExpert}>{selectedMentor.expertise}</Text>
                </View>
              </View>
            )}

            <Text style={styles.inputLabel}>Preferred Date</Text>
            <TextInput style={styles.input} placeholder="e.g. 15 March 2026" placeholderTextColor="#999" value={schedDate} onChangeText={setSchedDate} />

            <Text style={styles.inputLabel}>Preferred Time</Text>
            <TextInput style={styles.input} placeholder="e.g. 9:00 AM" placeholderTextColor="#999" value={schedTime} onChangeText={setSchedTime} />

            <Text style={styles.inputLabel}>Message (optional)</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="What do you want to learn / discuss?"
              placeholderTextColor="#999"
              multiline
              value={schedMsg}
              onChangeText={setSchedMsg}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowScheduleModal(false)} disabled={isScheduling}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleScheduleVisit} disabled={isScheduling}>
                {isScheduling ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Send Request</Text>}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface, ...theme.shadows.sm,
  },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: theme.colors.background },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  refreshButton: { padding: 8 },
  heroSection: { padding: theme.spacing.lg },
  heroTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.primary, marginBottom: 8 },
  heroDesc: { fontSize: 15, color: theme.colors.textSecondary, marginBottom: 16 },
  registerButton: {
    flexDirection: 'row', backgroundColor: theme.colors.primary,
    paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: theme.borderRadius.full, alignItems: 'center', alignSelf: 'flex-start',
  },
  registerButtonText: { color: theme.colors.surface, fontWeight: '700', fontSize: 15, marginLeft: 8 },
  loadingContainer: { padding: theme.spacing.xl, alignItems: 'center' },
  loadingText: { marginTop: theme.spacing.md, color: theme.colors.textSecondary },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md, color: theme.colors.text },
  emptyContainer: { padding: theme.spacing.xl, alignItems: 'center' },
  emptyText: { color: theme.colors.textSecondary },
  mentorCard: {
    backgroundColor: theme.colors.surface, marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg, borderRadius: 20, padding: theme.spacing.lg, ...theme.shadows.sm,
  },
  mentorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: theme.colors.surface, fontSize: 22, fontWeight: '700' },
  mentorInfo: { flex: 1, marginLeft: 12 },
  mentorName: { fontSize: 17, fontWeight: '800', color: theme.colors.text, marginBottom: 3 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 13, color: theme.colors.textSecondary },
  badgeLine: { backgroundColor: '#FFF3E0', padding: 8, borderRadius: 20 },
  mentorStats: { backgroundColor: theme.colors.background, padding: 12, borderRadius: 14, marginBottom: 14 },
  statText: { fontSize: 13, color: theme.colors.text, marginBottom: 4 },
  availRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  availText: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 11, borderRadius: 14, borderWidth: 1.5,
    borderColor: theme.colors.primaryLight,
  },
  scheduleBtn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  actionText: { fontWeight: '700', color: theme.colors.primary, fontSize: 13 },
  communityCard: {
    marginHorizontal: theme.spacing.lg, backgroundColor: '#1976D2',
    borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg,
    flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.md,
  },
  communityIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  communityTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.surface, marginBottom: 4 },
  communityDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: theme.colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  modalClose: { padding: 4 },
  modalDesc: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 20 },

  mentorMiniCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12, backgroundColor: theme.colors.background, padding: 12, borderRadius: 14 },
  mentorMiniAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  mentorMiniName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  mentorMiniExpert: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },

  inputLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 6 },
  input: {
    backgroundColor: theme.colors.inputBackground, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, color: theme.colors.text, marginBottom: 14,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 10 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  cancelBtnText: { color: theme.colors.textSecondary, fontWeight: '700', fontSize: 15 },
  submitBtn: { backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 14 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
