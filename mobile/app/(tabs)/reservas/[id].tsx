import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { cancelarReserva } from '@/services/reservas.service';
import { Reserva } from '@/services/types';

function parseReservaData(reservaData?: string | string[]): Reserva | null {
  if (typeof reservaData !== 'string') return null;

  try {
    return JSON.parse(reservaData) as Reserva;
  } catch {
    return null;
  }
}

function formatHora(hora?: string) {
  return hora ? hora.slice(0, 5) : '--:--';
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? '-'}</Text>
    </View>
  );
}

export default function DetalleReservaScreen() {
  const { id, reservaData } = useLocalSearchParams<{ id: string; reservaData?: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const reservaId = Number(id);

  const [reserva, setReserva] = useState<Reserva | null>(() => parseReservaData(reservaData));
  const [error, setError] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    if (!reserva) {
      setError('No se recibieron los datos de la reserva seleccionada.');
      return;
    }

    navigation.setOptions({ title: `Reserva #${reserva.id}` });
  }, [navigation, reserva]);

  function pedirConfirmacion() {
    Alert.alert(
      'Cancelar reserva',
      'Estas seguro de que deseas cancelar esta reserva? Esta accion no se puede deshacer.',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Si, cancelar',
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
      setReserva((prev) => (prev ? { ...prev, estado: 'CANCELADA' } : prev));
      Alert.alert('Reserva cancelada', 'Tu reserva ha sido cancelada exitosamente.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo cancelar la reserva. Intenta de nuevo.';
      Alert.alert('Error', msg);
    } finally {
      setCancelando(false);
    }
  }

  if (error || !reserva) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Reserva no encontrada.'}</Text>
      </View>
    );
  }

  const esActiva = reserva.estado === 'ACTIVA';
  const canchaNombre = reserva.canchaNombre ?? reserva.cancha?.nombre ?? 'Reserva sin cancha';
  const sedeNombre = reserva.sedeNombre ?? reserva.cancha?.sede?.nombre ?? 'Sede sin asignar';
  const horaInicio = formatHora(reserva.horaInicio ?? reserva.horario?.horaInicio);
  const horaFin = formatHora(reserva.horaFin ?? reserva.horario?.horaFin);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.reservaId}>Reserva #{reserva.id}</Text>
          <Text style={styles.fecha}>{reserva.fecha}</Text>
          <View style={[styles.estadoBadge, esActiva ? styles.estadoActiva : styles.estadoCancelada]}>
            <Text style={[styles.estadoText, esActiva ? styles.estadoActivaText : styles.estadoCanceladaText]}>
              {reserva.estado ?? 'SIN ESTADO'}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Cancha</Text>
          <InfoRow label="Nombre" value={canchaNombre} />
          <InfoRow label="Sede" value={sedeNombre} />
          <InfoRow label="Cancha ID" value={reserva.canchaId} />
          <InfoRow label="Horario ID" value={reserva.horarioId} />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Horario reservado</Text>
          <InfoRow label="Fecha" value={reserva.fecha} />
          <InfoRow label="Hora" value={`${horaInicio} - ${horaFin}`} />
        </View>

        {esActiva ? (
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
        ) : null}
      </View>
    </ScrollView>
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
    marginBottom: 12,
  },
  estadoBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '700',
  },
  estadoActiva: {
    backgroundColor: '#dcfce7',
  },
  estadoActivaText: {
    color: '#166534',
  },
  estadoCancelada: {
    backgroundColor: '#fee2e2',
  },
  estadoCanceladaText: {
    color: '#b91c1c',
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
