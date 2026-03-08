import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, Save, User as UserIcon, MapPin, Maximize, Sprout, 
  Clock, Calendar, Handshake, BookOpen, ChevronRight,
  TrendingUp, Award, HelpCircle, RefreshCcw
} from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { db } from '../../src/config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

type ProfileTab = 'edit' | 'activities' | 'stats';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, userProfile, updateProfile } = useAuth();

    const [activeTab, setActiveTab] = useState<ProfileTab>('edit');
    
    // Form states
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [farmSize, setFarmSize] = useState('');
    const [mainCrops, setMainCrops] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Activity states
    const [activities, setActivities] = useState<any[]>([]);
    const [stats, setStats] = useState({
        expertBookings: 0,
        mentorships: 0,
        buyRequests: 0,
        tasksCompleted: 0
    });
    const [isLoadingActivities, setIsLoadingActivities] = useState(false);

    // Pre-fill form if profile already exists
    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '');
            setLocation(userProfile.location || '');
            setFarmSize(userProfile.farmSize || '');
            setMainCrops(userProfile.mainCrops || '');
        }
    }, [userProfile]);

    // Refresh data whenever screen comes into focus
    useFocusEffect(
        useCallback(() => {
            if (activeTab === 'activities' || activeTab === 'stats') {
                fetchAllData();
            }
        }, [activeTab, user])
    );

    const fetchAllData = async () => {
        if (!user) return;
        setIsLoadingActivities(true);
        try {
            const uid = user.uid;
            
            // 1. Expert Bookings (Uses userId)
            const qExpert = query(collection(db, 'expert_bookings'), where('userId', '==', uid));
            const snapExpert = await getDocs(qExpert);
            
            // 2. Mentorship Schedules (Uses farmerId)
            const qMentor = query(collection(db, 'mentorship_schedules'), where('farmerId', '==', uid));
            const snapMentor = await getDocs(qMentor);
            
            // 3. Buy Requests (Uses farmerId)
            const qBuy = query(collection(db, 'buy_requests'), where('farmerId', '==', uid));
            const snapBuy = await getDocs(qBuy);

            // 4. Tasks (for stats)
            const qTasks = query(collection(db, 'farming_tasks'), where('userId', '==', uid));
            const snapTasks = await getDocs(qTasks);

            const allActivities: any[] = [];
            
            snapExpert.forEach(doc => allActivities.push({ ...doc.data(), id: doc.id, type: 'expert', date: doc.data().createdAt }));
            snapMentor.forEach(doc => allActivities.push({ ...doc.data(), id: doc.id, type: 'mentor', date: doc.data().createdAt }));
            snapBuy.forEach(doc => allActivities.push({ ...doc.data(), id: doc.id, type: 'buy', date: doc.data().createdAt }));

            // Sort by date desc
            allActivities.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
            setActivities(allActivities);

            const taskDocs = snapTasks.docs.map(d => d.data());
            setStats({
                expertBookings: snapExpert.size,
                mentorships: snapMentor.size,
                buyRequests: snapBuy.size,
                tasksCompleted: taskDocs.filter(t => t.status === 'completed').length
            });

        } catch (error) {
            console.error("Data fetch error:", error);
        } finally {
            setIsLoadingActivities(false);
        }
    };

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
        } catch (error: any) {
            Alert.alert("Error", error.message || "Could not save profile details.");
        } finally {
            setIsSaving(false);
        }
    };

    const renderActivityIcon = (type: string) => {
        switch(type) {
            case 'expert': return <BookOpen color={theme.colors.primary} size={20} />;
            case 'mentor': return <Handshake color="#673AB7" size={20} />;
            case 'buy': return <Sprout color="#E91E63" size={20} />;
            default: return <HelpCircle color={theme.colors.textSecondary} size={20} />;
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
                <TouchableOpacity 
                    style={styles.refreshButton} 
                    onPress={fetchAllData}
                    disabled={isLoadingActivities}
                >
                    <RefreshCcw 
                        color={isLoadingActivities ? theme.colors.textSecondary : theme.colors.text} 
                        size={20} 
                    />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'edit' && styles.activeTab]} 
                    onPress={() => setActiveTab('edit')}
                >
                    <Text style={[styles.tabText, activeTab === 'edit' && styles.activeTabText]}>Edit Info</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'activities' && styles.activeTab]} 
                    onPress={() => setActiveTab('activities')}
                >
                    <Text style={[styles.tabText, activeTab === 'activities' && styles.activeTabText]}>Activities</Text>
                    {activities.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{activities.length}</Text></View>}
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'stats' && styles.activeTab]} 
                    onPress={() => setActiveTab('stats')}
                >
                    <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>Stats</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {activeTab === 'edit' && (
                    <View style={styles.tabContent}>
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
                                <TextInput style={styles.input} placeholder="District, State" placeholderTextColor={theme.colors.textSecondary} value={location} onChangeText={setLocation} />
                            </View>

                            <Text style={styles.sectionTitle}>Farm Details</Text>
                            <View style={styles.inputContainer}>
                                <Maximize color={theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                                <TextInput style={styles.input} placeholder="Farm Size (Acres)" keyboardType="numeric" placeholderTextColor={theme.colors.textSecondary} value={farmSize} onChangeText={setFarmSize} />
                            </View>
                            <View style={styles.inputContainer}>
                                <Sprout color={theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                                <TextInput style={styles.input} placeholder="Main Crops Currently Grown" placeholderTextColor={theme.colors.textSecondary} value={mainCrops} onChangeText={setMainCrops} />
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
                    </View>
                )}

                {activeTab === 'activities' && (
                    <View style={styles.tabContent}>
                        {isLoadingActivities ? (
                            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                        ) : activities.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Clock color={theme.colors.textSecondary} size={40} />
                                <Text style={styles.emptyText}>No recent activities found.</Text>
                            </View>
                        ) : (
                            activities.map((item) => (
                                <View key={item.id} style={styles.activityCard}>
                                    <View style={styles.activityHeader}>
                                        <View style={styles.iconCircle}>
                                            {renderActivityIcon(item.type)}
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={styles.activityTitle}>
                                                {item.type === 'expert' ? `Expert Guide: ${item.schemeName}` : 
                                                 item.type === 'mentor' ? `Mentor: ${item.mentorName}` : 
                                                 `Market: Sent to ${item.buyerName}`}
                                            </Text>
                                            <Text style={styles.activitySubtitle}>
                                                {item.type === 'buy' ? `For: ${item.cropsWanted?.join(', ')}` : 
                                                 item.type === 'expert' ? `Sheduled: ${item.date} at ${item.time}` : 
                                                 `Visit: ${item.preferredDate} at ${item.preferredTime}`}
                                            </Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? theme.colors.success + '20' : '#f0f0f0' }]}>
                                            <Text style={[styles.statusText, { color: item.status === 'completed' ? theme.colors.success : theme.colors.textSecondary }]}>
                                                {item.status?.toUpperCase() || 'SENT'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.activityFooter}>
                                        <Text style={styles.activityDate}>
                                            {item.date?.toDate ? `Recorded on ${item.date.toDate().toLocaleDateString()}` : 'Date: Just Now'}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                        
                        <TouchableOpacity 
                            style={styles.calendarLink} 
                            onPress={() => router.push('/calendar/index')}
                        >
                            <Calendar color={theme.colors.primary} size={20} />
                            <Text style={styles.calendarLinkText}>Open Farming Calendar</Text>
                            <ChevronRight color={theme.colors.primary} size={18} />
                        </TouchableOpacity>
                    </View>
                )}

                {activeTab === 'stats' && (
                    <View style={styles.tabContent}>
                        <View style={styles.statsGrid}>
                            <View style={styles.statsCard}>
                                <TrendingUp color={theme.colors.primary} size={24} />
                                <Text style={styles.statsValue}>{stats.tasksCompleted}</Text>
                                <Text style={styles.statsLabel}>Tasks Completed</Text>
                            </View>
                            <View style={styles.statsCard}>
                                <Award color="#FF9800" size={24} />
                                <Text style={styles.statsValue}>{stats.expertBookings + stats.mentorships}</Text>
                                <Text style={styles.statsLabel}>Total Bookings</Text>
                            </View>
                            <View style={styles.statsCard}>
                                <Handshake color="#673AB7" size={24} />
                                <Text style={styles.statsValue}>{stats.mentorships}</Text>
                                <Text style={styles.statsLabel}>Expert Visits</Text>
                            </View>
                            <View style={styles.statsCard}>
                                <Sprout color="#E91E63" size={24} />
                                <Text style={styles.statsValue}>{stats.buyRequests}</Text>
                                <Text style={styles.statsLabel}>Market Leads</Text>
                            </View>
                        </View>
                        
                        <View style={styles.summaryStatsSection}>
                            <Text style={styles.detailedStatsHeader}>Activity Summary</Text>
                            <View style={styles.statDetailRow}>
                                <View style={styles.statDetailBullet} />
                                <Text style={styles.statDetailText}>You have sent **{stats.buyRequests}** purchase requests to buyers.</Text>
                            </View>
                            <View style={styles.statDetailRow}>
                                <View style={[styles.statDetailBullet, { backgroundColor: '#FF9800' }]} />
                                <Text style={styles.statDetailText}>Scheduled **{stats.expertBookings}** expert guidance calls.</Text>
                            </View>
                            <View style={styles.statDetailRow}>
                                <View style={[styles.statDetailBullet, { backgroundColor: '#673AB7' }]} />
                                <Text style={styles.statDetailText}>Requested **{stats.mentorships}** on-field mentor visits.</Text>
                            </View>
                        </View>

                        <View style={styles.achievementCard}>
                            <LinearGradient colors={['#FFF8E1', '#FFF3E0']} style={styles.achievementGradient}>
                                <Award color="#FFA000" size={32} />
                                <View style={{ marginLeft: 16, flex: 1 }}>
                                    <Text style={styles.achievementTitle}>Farming Progress</Text>
                                    <Text style={styles.achievementDesc}>Active involvement in the digital mandi. You've reached out to {stats.buyRequests} potential buyers this season!</Text>
                                </View>
                            </LinearGradient>
                        </View>
                    </View>
                )}

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, paddingTop: 60, paddingBottom: theme.spacing.md, backgroundColor: theme.colors.surface },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
    tabBar: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    tab: { flex: 1, paddingVertical: 14, alignItems: 'center', position: 'relative' },
    activeTab: { borderBottomWidth: 3, borderBottomColor: theme.colors.primary },
    tabText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
    activeTabText: { color: theme.colors.primary, fontWeight: '700' },
    badge: { position: 'absolute', top: 8, right: 8, backgroundColor: theme.colors.error, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    content: { flex: 1 },
    tabContent: { padding: theme.spacing.lg },
    tabTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 16 },
    avatarSection: { alignItems: 'center', marginBottom: theme.spacing.xl, marginTop: theme.spacing.md },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12, ...theme.shadows.md },
    avatarInitials: { fontSize: 32, fontWeight: 'bold', color: theme.colors.surface },
    emailText: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '500' },
    formSection: { marginBottom: theme.spacing.xl },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 12, marginTop: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, marginBottom: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.colors.border },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, paddingVertical: 14, fontSize: 15, color: theme.colors.text },
    actionButton: { borderRadius: theme.borderRadius.full, overflow: 'hidden', ...theme.shadows.md },
    buttonGradient: { flexDirection: 'row', paddingVertical: 16, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: theme.colors.surface, fontSize: 15, fontWeight: '700' },
    
    // Activity Styles
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
    emptyText: { marginTop: 12, color: theme.colors.textSecondary, fontSize: 14 },
    activityCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
    activityHeader: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
    activityTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
    activitySubtitle: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    activityFooter: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f9f9f9' },
    activityDate: { fontSize: 11, color: '#aaa', fontStyle: 'italic' },
    calendarLink: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary + '10', padding: 16, borderRadius: 12, marginTop: 20, borderWidth: 1, borderColor: theme.colors.primary + '30' },
    calendarLinkText: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: '700', color: theme.colors.primary },
    
    refreshButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },

    // Status Badge
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    statusText: { fontSize: 10, fontWeight: '800' },

    // Stats Styles
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statsCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#eee', ...theme.shadows.sm },
    statsValue: { fontSize: 24, fontWeight: '800', color: theme.colors.text, marginVertical: 8 },
    statsLabel: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
    
    summaryStatsSection: { marginTop: 24, padding: 20, backgroundColor: '#f9f9f9', borderRadius: 16 },
    detailedStatsHeader: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 16 },
    statDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    statDetailBullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, marginRight: 12 },
    statDetailText: { fontSize: 14, color: theme.colors.textSecondary, flex: 1, lineHeight: 20 },

    achievementCard: { marginTop: 24, borderRadius: 16, overflow: 'hidden' },
    achievementGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    achievementTitle: { fontSize: 16, fontWeight: '700', color: '#795548' },
    achievementDesc: { fontSize: 13, color: '#8D6E63', marginTop: 4, lineHeight: 18 }
});
