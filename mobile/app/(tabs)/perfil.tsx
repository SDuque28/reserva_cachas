import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function PerfilScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [cerrando, setCerrando] = useState(false);

  function pedirConfirmacion() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: handleSignOut },
      ]
    );
  }

  async function handleSignOut() {
    setCerrando(true);
    try {
      await signOut();
      router.replace('/login');
    } catch {
      Alert.alert('Error', 'No se pudo cerrar sesión. Intenta de nuevo.');
    } finally {
      setCerrando(false);
    }
  }

  return (
    <View style={styles.container} >
      {/* Avatar inicial */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.nombre ? user.nombre.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
      </View>

      {/* Datos del usuario */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información de la cuenta</Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Nombre</Text>
          <Text style={styles.fieldValue}>{user?.nombre ?? '–'}</Text>
        </View>

        <View style={[styles.field, styles.fieldLast]}>
          <Text style={styles.fieldLabel}>Correo electrónico</Text>
          <Text style={styles.fieldValue}>{user?.email ?? '–'}</Text>
        </View>
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity
        style={[styles.signOutButton, cerrando && styles.buttonDisabled]}
        onPress={pedirConfirmacion}
        disabled={cerrando}
        activeOpacity={0.8}
      >
        {cerrando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 24,
    paddingTop: 32,
    justifyContent: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  field: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  fieldLast: {
    borderBottomWidth: 0,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
