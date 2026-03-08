import { Tabs } from 'expo-router';
import { Home, CloudRain, Scan, Handshake, MessageSquare } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

// ── Custom centre FAB button for AI Scan ──────────────────────────────────────
function ScanButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={fabStyles.wrapper} activeOpacity={0.85}>
      <View style={fabStyles.outer}>
        <View style={fabStyles.inner}>
          <Scan color="#fff" size={28} strokeWidth={2.5} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const fabStyles = StyleSheet.create({
  wrapper: {
    top: -24,
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
  },
  outer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(76,175,80,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
        }}
      />

      <Tabs.Screen
        name="planner"
        options={{
          title: 'Climate',
          tabBarIcon: ({ color }) => <CloudRain color={color} size={22} />,
        }}
      />

      {/* ── Centre FAB ── */}
      <Tabs.Screen
        name="scan"
        options={{
          title: '',
          tabBarIcon: () => null,
          tabBarButton: (props) => <ScanButton onPress={props.onPress as any} />,
        }}
      />

      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          tabBarIcon: ({ color }) => <Handshake color={color} size={22} />,
        }}
      />

      <Tabs.Screen
        name="chatbot"
        options={{
          title: 'Krishi AI',
          tabBarIcon: ({ color }) => <MessageSquare color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
