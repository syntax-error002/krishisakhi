import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Platform, Easing
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, ChevronRight, BookOpen, Activity, 
  Droplets, ShieldAlert, Sprout, Landmark, ArrowUpRight, Beaker 
} from 'lucide-react-native';
import { theme } from '../../src/theme';

// Complex, high-tech hardcoded data structure
const KNOWLEDGE_GRAPH = [
  {
    id: 'c1',
    title: 'Precision Soil Diagnostics',
    subtitle: 'N-P-K vectors, Organic Carbon, & pH Optimization',
    icon: Beaker,
    topics: [
      {
        id: 't1',
        title: 'Macronutrient Calibration (N-P-K)',
        questions: [
          {
            id: 'q1',
            text: 'What is the optimal nutrient uptake curve for cereal crops?',
            answer: 'Cereals exhibit a non-linear nutrient absorption curve. Nitrogen demand peaks steeply during the tillering and panicle initiation phases, whereas Phosphorus is critical during early root formation. We utilize a split-dose application strategy to maximize nitrogen use efficiency (NUE) and prevent nitrate leaching.',
            chart: {
              title: 'Standardized N-P-K Uptake Trajectory (%)',
              max: 100,
              data: [
                { label: 'Tillering (N)', value: 85, color: '#3b82f6' },
                { label: 'Rooting (P)', value: 65, color: '#f59e0b' },
                { label: 'Grain Fill (K)', value: 92, color: '#10b981' }
              ]
            }
          },
          {
            id: 'q2',
            text: 'How to remediate alkaline soil (pH > 8.5)?',
            answer: 'Alkaline soils suffer from poor structure and micronutrient lock-up (Iron, Zinc). Remediation involves applying agricultural gypsum (Calcium Sulfate) which displaces exchangeable sodium. Follow this with leaching to wash the sodium below the root zone. Incorporating green manure (Dhaincha) significantly accelerates pH neutralization by introducing organic acids.',
            chart: null
          }
        ]
      },
      {
        id: 't2',
        title: 'Soil Microbiome Dynamics',
        questions: [
          {
            id: 'q3',
            text: 'Impact of synthetic fertilizers on microbial biomass?',
            answer: 'Long-term high-dose synthetic fertilization decreases soil microbial biomass carbon (SMBC) by 15-20%. It suppresses symbiotic mycorrhizal fungi and nitrogen-fixing bacteria. Integrating farmyard manure (FYM) or vermicompost buffers this effect, providing a carbon substrate for microbial proliferation.',
            chart: {
              title: 'Microbial Biomass Relative Index',
              max: 100,
              data: [
                { label: '100% Synthetic', value: 40, color: '#ef4444' },
                { label: '50% Synthetic + 50% FYM', value: 75, color: '#f59e0b' },
                { label: '100% Organic', value: 95, color: '#10b981' }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'c2',
    title: 'Phytopathology & Disease Vectors',
    subtitle: 'Pathogen forecasting and remediation protocols',
    icon: ShieldAlert,
    topics: [
      {
        id: 't3',
        title: 'Fungal Pathogens (Blights & Rusts)',
        questions: [
          {
            id: 'q4',
            text: 'Epidemiology of Late Blight in Potatoes?',
            answer: 'Late Blight (Phytophthora infestans) spores germinate rapidly when relative humidity exceeds 90% and temperatures are between 12-15°C. The disease progression is exponential. Prophylactic sprays of contact fungicides (Mancozeb) are necessary before canopy closure. If infection exceeds 5% foliage, systemic fungicides (Metalaxyl) must be deployed immediately.',
            chart: {
              title: 'Disease Progression Curve vs Time (Days)',
              max: 100,
              data: [
                { label: 'Day 3', value: 5, color: '#fcd34d' },
                { label: 'Day 7', value: 25, color: '#fb923c' },
                { label: 'Day 12', value: 85, color: '#dc2626' }
              ]
            }
          }
        ]
      },
      {
        id: 't4',
        title: 'Entomological Threats (Pests)',
        questions: [
          {
            id: 'q5',
            text: 'Economic Threshold Logic for Fall Armyworm?',
            answer: 'Insecticide application is only economically viable when the pest population breaches the Economic Threshold Level (ETL). For Fall Armyworm in vegetative stage maize, the ETL is 10% damaged whorls. Below this threshold, deploying Telenomus remus (egg parasitoid) or spraying Bacillus thuringiensis (Bt) is mathematically superior for long-term ROI.',
            chart: null
          }
        ]
      }
    ]
  },
  {
    id: 'c3',
    title: 'Hydrological Optimization',
    subtitle: 'Evapotranspiration metrics & precision irrigation',
    icon: Droplets,
    topics: [
      {
        id: 't5',
        title: 'Micro-Irrigation Algorithms',
        questions: [
          {
            id: 'q6',
            text: 'Calculating crop water requirement (ETc)?',
            answer: 'Crop water requirement implies balancing crop evapotranspiration (ETc). It is calculated as ETc = ETo × Kc, where ETo is reference evapotranspiration (based on local weather data) and Kc is the specific crop coefficient at its current phenological stage. Drip irrigation systems should be calibrated to solely replenish this daily ETc deficit, operating at 90% application efficiency.',
            chart: {
              title: 'Water Use Efficiency (Yield per mm Water)',
              max: 20,
              data: [
                { label: 'Flood Irrigation', value: 6, color: '#ef4444' },
                { label: 'Sprinkler', value: 12, color: '#3b82f6' },
                { label: 'Surface Drip', value: 18, color: '#10b981' }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'c4',
    title: 'Agronomic Economics & Policy',
    subtitle: 'Subsidy algorithms, price volatility & ROI',
    icon: Landmark,
    topics: [
      {
        id: 't6',
        title: 'Yield Economics & Forecasting',
        questions: [
          {
            id: 'q7',
            text: 'How to calculate the Cost-Benefit Ratio (CBR)?',
            answer: 'CBR = Gross Returns / Total Cost of Cultivation. A CBR > 1.5 indicates a highly profitable agronomic enterprise. It requires strict optimization of variable costs (seeds, fertilizers, labor) and utilizing government subsidies like PM-KISAN or PMFBY (crop insurance) to hedge against systemic climate risks.',
            chart: {
              title: 'Cost Distribution in Cultivation (%)',
              max: 50,
              data: [
                { label: 'Labor', value: 45, color: '#6366f1' },
                { label: 'Inputs (Fert/Seed)', value: 35, color: '#8b5cf6' },
                { label: 'Machinery', value: 20, color: '#ec4899' }
              ]
            }
          }
        ]
      }
    ]
  }
];

export default function KnowledgeGraphScreen() {
  const router = useRouter();
  const [path, setPath] = useState<string[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [path]);

  const handleSelect = (id: string) => {
    fadeAnim.setValue(0);
    setPath([...path, id]);
  };

  const traverseNodes = () => {
    if (path.length === 0) return { type: 'categories', data: KNOWLEDGE_GRAPH };
    
    const cat = KNOWLEDGE_GRAPH.find(c => c.id === path[0]);
    if (!cat) return { type: 'error', data: null };
    
    if (path.length === 1) return { type: 'topics', data: cat.topics, parentTitle: cat.title };
    
    const topic = cat.topics.find(t => t.id === path[1]);
    if (!topic) return { type: 'error', data: null };

    if (path.length === 2) return { type: 'questions', data: topic.questions, parentTitle: topic.title };

    const question = topic.questions.find(q => q.id === path[2]);
    if (!question) return { type: 'error', data: null };

    return { type: 'answer', data: question, parentTitle: question.text };
  };

  const currentNode = traverseNodes();

  const BarChart = ({ chartData }: { chartData: any }) => {
    if (!chartData) return null;
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{chartData.title}</Text>
        <View style={styles.chartBody}>
          {chartData.data.map((item: any, idx: number) => {
            const widthPct = Math.min(100, Math.max(0, (item.value / chartData.max) * 100));
            return (
              <View key={idx} style={styles.chartRow}>
                <View style={styles.chartLabelContainer}>
                  <Text style={styles.chartLabel}>{item.label}</Text>
                  <Text style={styles.chartValue}>{item.value}</Text>
                </View>
                <View style={styles.chartTrack}>
                  <Animated.View 
                    style={[
                      styles.chartFill, 
                      { width: `${widthPct}%`, backgroundColor: item.color }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => path.length > 0 ? setPath(path.slice(0, -1)) : router.back()} 
          style={styles.backButton}
        >
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Knowledge Graph</Text>
          <Text style={styles.headerStatus}>
            {path.length === 0 ? 'Root Directory' : `Level ${path.length + 1} Selected`}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Breadcrumb / Path indicator */}
      {path.length > 0 && (
        <View style={styles.breadcrumbBar}>
          <Text style={styles.breadcrumbText}>Root</Text>
          {path.map((p, idx) => (
            <View key={p} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ChevronRight size={14} color="#888" style={{ marginHorizontal: 4 }} />
              <Text style={styles.breadcrumbText} numberOfLines={1}>{`Node ${idx+1}`}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Main Content Area */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
          
          {currentNode.type === 'categories' && (
            <View>
              <Text style={styles.sectionTitle}>Select Domain Subroutine</Text>
              {currentNode.data.map((cat: any) => {
                const Icon = cat.icon;
                return (
                  <TouchableOpacity key={cat.id} style={styles.card} onPress={() => handleSelect(cat.id)} activeOpacity={0.8}>
                    <View style={styles.cardIconBox}>
                      <Icon color="#fff" size={24} />
                    </View>
                    <View style={styles.cardTextContent}>
                      <Text style={styles.cardTitle}>{cat.title}</Text>
                      <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
                    </View>
                    <ChevronRight color={theme.colors.primary} size={24} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {currentNode.type === 'topics' && (
            <View>
              <Text style={styles.sectionTitle}>{currentNode.parentTitle}</Text>
              <Text style={styles.sectionSubtitle}>Select specific topic area</Text>
              {currentNode.data.map((topic: any) => (
                <TouchableOpacity key={topic.id} style={styles.card} onPress={() => handleSelect(topic.id)} activeOpacity={0.8}>
                   <View style={styles.cardTextContent}>
                      <Text style={styles.cardTitle}>{topic.title}</Text>
                      <Text style={styles.cardSubtitle}>{topic.questions.length} active queries available</Text>
                    </View>
                    <ChevronRight color={theme.colors.primary} size={24} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {currentNode.type === 'questions' && (
            <View>
              <Text style={styles.sectionTitle}>{currentNode.parentTitle}</Text>
              <Text style={styles.sectionSubtitle}>Select query to resolve</Text>
              {currentNode.data.map((q: any) => (
                <TouchableOpacity key={q.id} style={styles.cardAlt} onPress={() => handleSelect(q.id)} activeOpacity={0.8}>
                  <Text style={styles.questionCardText}>{q.text}</Text>
                  <ArrowUpRight color={theme.colors.primary} size={20} style={{ marginLeft: 16 }} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {currentNode.type === 'answer' && (
            <View style={styles.answerWrapper}>
              <Text style={styles.answerQuestionHeader}>{currentNode.parentTitle}</Text>
              
              <View style={styles.answerContentBox}>
                <Text style={styles.answerText}>{currentNode.data.answer}</Text>
              </View>

              <BarChart chartData={currentNode.data.chart} />

              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => setPath([])}
              >
                <Activity color="#fff" size={18} style={{ marginRight: 8 }} />
                <Text style={styles.resetButtonText}>Return to Root Directory</Text>
              </TouchableOpacity>
            </View>
          )}

        </Animated.View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' }, // Deep dark modern background
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 60, 
    paddingBottom: 20, 
    paddingHorizontal: theme.spacing.lg, 
    backgroundColor: '#1e293b', 
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    zIndex: 10 
  },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: '#334155' },
  headerTitleGroup: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#f8fafc', letterSpacing: 0.5 },
  headerStatus: { fontSize: 11, color: '#10b981', marginTop: 4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  breadcrumbText: { color: '#94a3b8', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', maxWidth: 100 },
  scrollView: { flex: 1 },
  scrollContent: { padding: theme.spacing.lg, paddingTop: 24 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#f8fafc', marginBottom: 6, letterSpacing: -0.5 },
  sectionSubtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: theme.spacing.lg,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardTextContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#94a3b8' },
  questionCardText: { fontSize: 16, fontWeight: '600', color: '#f8fafc', flex: 1, lineHeight: 24 },
  
  // Answer specific styles
  answerWrapper: { marginTop: 8 },
  answerQuestionHeader: { fontSize: 22, fontWeight: '800', color: theme.colors.primary, marginBottom: 24, lineHeight: 30 },
  answerContentBox: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  answerText: { fontSize: 15, color: '#e2e8f0', lineHeight: 24, letterSpacing: 0.2 },
  
  // Custom Chart Styles
  chartContainer: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chartTitle: { fontSize: 14, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 },
  chartBody: { width: '100%' },
  chartRow: { marginBottom: 16 },
  chartLabelContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  chartLabel: { fontSize: 13, color: '#e2e8f0', fontWeight: '500' },
  chartValue: { fontSize: 13, color: '#f8fafc', fontWeight: '800' },
  chartTrack: { height: 12, backgroundColor: '#0f172a', borderRadius: 6, overflow: 'hidden' },
  chartFill: { height: '100%', borderRadius: 6 },

  // Buttons
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: 18,
    borderRadius: 16,
    marginTop: 12,
  },
  resetButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
