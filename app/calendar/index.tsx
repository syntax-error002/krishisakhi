import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle2, Circle, Clock, ChevronRight, RefreshCcw } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { db } from '../../src/config/firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';

interface FarmingTask {
  id: string;
  taskName: string;
  cropName: string;
  description: string;
  dueDate: any;
  status: 'pending' | 'completed';
}

export default function CalendarScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<FarmingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'farming_tasks'),
        where('userId', '==', user?.uid),
        orderBy('dueDate', 'asc')
      );
      const snapshot = await getDocs(q);
      const data: FarmingTask[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as FarmingTask);
      });
      setTasks(data);
    } catch (error: any) {
      console.error('Fetch tasks error:', error);
      Alert.alert('Error', 'Failed to load your farming calendar.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      await updateDoc(doc(db, 'farming_tasks', taskId), {
        status: newStatus,
      });
      // Optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update task status.');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysRemaining = (timestamp: any) => {
    if (!timestamp) return 0;
    const now = new Date();
    const due = timestamp.toDate();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Farming Calendar</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchTasks}>
          <RefreshCcw color={theme.colors.text} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{tasks.filter(t => t.status === 'pending').length}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={[styles.summaryItem, { borderLeftWidth: 1, borderLeftColor: '#eee' }]}>
            <Text style={[styles.summaryValue, { color: theme.colors.success }]}>{tasks.filter(t => t.status === 'completed').length}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CalendarIcon color={theme.colors.textSecondary} size={48} />
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptyDesc}>Generate a plan in the Climate Planner to see your tasks here.</Text>
            <TouchableOpacity style={styles.goPlannerBtn} onPress={() => router.push('/planner')}>
              <Text style={styles.goPlannerBtnText}>Go to Planner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.taskList}>
            {tasks.map((task) => {
              const daysLeft = getDaysRemaining(task.dueDate);
              const isOverdue = daysLeft < 0 && task.status === 'pending';
              
              return (
                <TouchableOpacity 
                  key={task.id} 
                  style={[styles.taskCard, task.status === 'completed' && styles.taskCardCompleted]}
                  onPress={() => toggleTaskStatus(task.id, task.status)}
                >
                  <View style={styles.taskIconContainer}>
                    {task.status === 'completed' ? (
                      <CheckCircle2 color={theme.colors.success} size={24} />
                    ) : (
                      <Circle color={isOverdue ? theme.colors.error : theme.colors.textSecondary} size={24} />
                    )}
                  </View>
                  
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskName, task.status === 'completed' && styles.textStrikethrough]}>
                      {task.taskName}
                    </Text>
                    <Text style={styles.cropName}>{task.cropName}</Text>
                    <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
                    
                    <View style={styles.dateRow}>
                      <Clock size={12} color={isOverdue ? theme.colors.error : theme.colors.textSecondary} />
                      <Text style={[styles.dateText, isOverdue && {color: theme.colors.error, fontWeight: '700'}]}>
                        {formatDate(task.dueDate)} {isOverdue ? '(Overdue)' : daysLeft === 0 ? '(Today)' : `(${daysLeft} days left)`}
                      </Text>
                    </View>
                  </View>
                  
                  <ChevronRight color="#ddd" size={20} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 20, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  refreshButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  content: { flex: 1, padding: 20 },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...theme.shadows.md,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  summaryLabel: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  loadingText: { marginTop: 12, color: theme.colors.textSecondary, fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginTop: 16 },
  emptyDesc: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 40, lineHeight: 20 },
  goPlannerBtn: { marginTop: 24, backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  goPlannerBtnText: { color: '#fff', fontWeight: '700' },
  taskList: { gap: 12 },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  taskCardCompleted: {
    opacity: 0.7,
    borderLeftColor: theme.colors.success,
  },
  taskIconContainer: { marginRight: 16 },
  taskInfo: { flex: 1 },
  taskName: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 2 },
  cropName: { fontSize: 12, color: theme.colors.primary, fontWeight: '600', marginBottom: 4 },
  taskDesc: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 11, color: theme.colors.textSecondary },
  textStrikethrough: { textDecorationLine: 'line-through' },
});
