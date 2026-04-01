import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { getReservaById, cancelarReserva } from '@/services/reservas.service';
import { Reserva } from '@/services/types';

export default function DetalleReservaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const reservaId = Number(id);

  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getReservaById(reservaId);
        setReserva(data);
        navigation.setOptions({ title: `Reserva #${data.id}` });
      } catch {
        setError('No se pudo cargar el detalle de la reserva.');
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [reservaId]);

  function pedirConfirmacion() {
    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: ejecutarCancelacion,
        },
      ]
    );
  }

  async function ejecutarCancelacion() {
    setCancelando(true);
    try {
      await cancelarReserva(reservaId);
      Alert.alert('Reserva cancelada', 'Tu reserva ha sido cancelada exitosamente.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || 'No se pudo cancelar la reserva. Intenta de nuevo.';
      Alert.alert('Error', msg);
    } finally {
      setCancelando(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !reserva) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Reserva no encontrada.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Cabecera */}
        <View style={styles.headerCard}>
          <Text style={styles.reservaId}>Reserva #{reserva.id}</Text>
          <Text style={styles.fecha}>{reserva.fecha}</Text>
        </View>

        {/* Cancha */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Cancha</Text>
          <InfoRow label="Nombre" value={reserva.cancha?.nombre} />
          <InfoRow label="Tipo" value={reserva.cancha?.tipo?.nombre} />
          <InfoRow label="Capacidad" value={`${reserva.cancha?.capacidad} personas`} />
          <InfoRow label="Descripción" value={reserva.cancha?.descripcion} />
        </View>

        {/* Sede */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Sede</Text>
          <InfoRow label="Nombre" value={reserva.cancha?.sede?.nombre} />
          <InfoRow label="Dirección" value={reserva.cancha?.sede?.direccion} />
        </View>

        {/* Horario */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Horario reservado</Text>
          <InfoRow label="Día" value={reserva.horario?.diaSemana} />
          <InfoRow
            label="Hora"
            value={`${reserva.horario?.horaInicio} – ${reserva.horario?.horaFin}`}
          />
        </View>

        {/* Botón cancelar */}
        <TouchableOpacity
          style={[styles.cancelButton, cancelando && styles.buttonDisabled]}
          onPress={pedirConfirmacion}
          disabled={cancelando}
          activeOpacity={0.8}
        >
          {cancelando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.cancelButtonText}>Cancelar reserva</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? '–'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  headerCard: {
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  reservaId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#93c5fd',
    marginBottom: 4,
  },
  fecha: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
});
