import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { useAlert } from '@/components/ui/app-alert';
import {
  Bell,
  Globe,
  Shield,
  Info,
  ChevronRight,
  Trash2,
  ExternalLink,
} from 'lucide-react-native';

const APP_VERSION = '1.0.0';

interface RowProps {
  icon: React.ComponentType<{ color: string; size: number }>;
  iconColor: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightLabel?: string;
  destructive?: boolean;
}

function Row({ icon: Icon, iconColor, label, subtitle, onPress, rightLabel, destructive }: RowProps) {
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={styles.row}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: `${iconColor}18` }]}>
        <Icon color={iconColor} size={18} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>
          {label}
        </Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightLabel ? (
        <Text style={styles.rowRight}>{rightLabel}</Text>
      ) : onPress ? (
        <ChevronRight color="#8b8f96" size={18} />
      ) : null}
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const { showAlert } = useAlert();

  const handleOpenNotificationSettings = () => {
    Linking.openSettings();
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://ordenv.org');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://ordenv.org/privacy');
  };

  const handleDeleteAccount = () => {
    showAlert({
      title: 'Видалення акаунту',
      message: 'Для видалення акаунту зверніться до підтримки: support@ordenv.org',
      buttons: [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Написати на email',
          style: 'destructive',
          onPress: () => Linking.openURL('mailto:support@ordenv.org?subject=Видалення акаунту'),
        },
      ],
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageLabel}>// НАЛАШТУВАННЯ</Text>
      <Text style={styles.pageTitle}>Налаштування</Text>

      {/* Notifications */}
      <Section title="Сповіщення">
        <Row
          icon={Bell}
          iconColor="#b5793a"
          label="Push-сповіщення"
          subtitle="Керувати через налаштування пристрою"
          onPress={handleOpenNotificationSettings}
        />
      </Section>

      {/* About */}
      <Section title="Про додаток">
        <Row
          icon={Globe}
          iconColor="#3b82f6"
          label="Сайт"
          subtitle="ordenv.org"
          onPress={handleOpenWebsite}
        />
        <View style={styles.divider} />
        <Row
          icon={Shield}
          iconColor="#8b5cf6"
          label="Політика конфіденційності"
          onPress={handlePrivacyPolicy}
        />
        <View style={styles.divider} />
        <Row
          icon={Info}
          iconColor="#8b8f96"
          label="Версія"
          rightLabel={APP_VERSION}
        />
      </Section>

      {/* Danger zone */}
      <Section title="Акаунт">
        <Row
          icon={Trash2}
          iconColor="#ef4444"
          label="Видалити акаунт"
          subtitle="Незворотна дія"
          onPress={handleDeleteAccount}
          destructive
        />
      </Section>

      <Text style={styles.footer}>Орден Ветеранів © 2025</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1011',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  pageLabel: {
    color: '#b5793a',
    fontSize: 11,
    fontFamily: 'IBMPlexMono_400Regular',
    letterSpacing: 2,
    marginBottom: 4,
    marginTop: 4,
  },
  pageTitle: {
    color: '#e7e7e7',
    fontSize: 26,
    fontFamily: 'Inter_900Black',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#8b8f96',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#141618',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1d20',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    color: '#e7e7e7',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  rowLabelDestructive: {
    color: '#ef4444',
  },
  rowSubtitle: {
    color: '#8b8f96',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  rowRight: {
    color: '#8b8f96',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#1a1d20',
    marginLeft: 60,
  },
  footer: {
    color: '#8b8f96',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 8,
  },
});
