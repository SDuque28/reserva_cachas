import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getCanchas } from '@/services/canchas.service';
import { getSedes } from '@/services/sedes.service';
import { getTiposCanchas } from '@/services/tipos.service';
import { Cancha, Sede, TipoCancha } from '@/services/types';

export default function CanchasScreen() {
  const router = useRouter();

  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [tipos, setTipos] = useState<TipoCancha[]>([]);

  const [sedeSeleccionada, setSedeSeleccionada] = useState<number | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<number | null>(null);

  const [loadingCanchas, setLoadingCanchas] = useState(false);
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar sedes y tipos al montar
  useEffect(() => {
    async function cargarFiltros() {
      try {
        const [sedesData, tiposData] = await Promise.all([getSedes(), getTiposCanchas()]);
        setSedes(sedesData);
        setTipos(tiposData);
      } catch {
        // Los filtros no son críticos; la lista igual puede cargarse
      } finally {
        setLoadingFiltros(false);
      }
    }
    cargarFiltros();
  }, []);

  const cargarCanchas = useCallback(async () => {
    setLoadingCanchas(true);
    setError(null);
    try {
      const filtros: { sedeId?: number; tipoId?: number } = {};
      if (sedeSeleccionada !== null) filtros.sedeId = sedeSeleccionada;
      if (tipoSeleccionado !== null) filtros.tipoId = tipoSeleccionado;
      const data = await getCanchas(filtros);
      setCanchas(data);
    } catch {
      setError('No se pudo cargar la lista de canchas. Verifica tu conexión.');
    } finally {
      setLoadingCanchas(false);
    }
  }, [sedeSeleccionada, tipoSeleccionado]);

  // Recargar canchas cada vez que cambian los filtros
  useEffect(() => {
    cargarCanchas();
  }, [cargarCanchas]);

  function renderFiltroChip(
    label: string,
    isActive: boolean,
    onPress: () => void
  ) {
    return (
      <TouchableOpacity
        key={label}
        style={[styles.chip, isActive && styles.chipActive]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  function renderCancha({ item }: { item: Cancha }) {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/(tabs)/canchas/${item.id}`)}
      >
        {item.imagenUrl ? (
          <Image source={{ uri: item.imagenUrl }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.placeholderText}>Sin imagen</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text style={styles.cardMeta}>
            {item.sede?.nombre} · {item.tipo?.nombre}
          </Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.descripcion}
          </Text>
          <Text style={styles.cardCapacidad}>Capacidad: {item.capacidad} personas</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filtros */}
      {!loadingFiltros && (
        <View style={styles.filtrosContainer}>
          <Text style={styles.filtroLabel}>Sede</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {renderFiltroChip('Todas', sedeSeleccionada === null, () =>
              setSedeSeleccionada(null)
            )}
            {sedes.map((s) =>
              renderFiltroChip(s.nombre, sedeSeleccionada === s.id, () =>
                setSedeSeleccionada(sedeSeleccionada === s.id ? null : s.id)
              )
            )}
          </ScrollView>

          <Text style={styles.filtroLabel}>Tipo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {renderFiltroChip('Todos', tipoSeleccionado === null, () =>
              setTipoSeleccionado(null)
            )}
            {tipos.map((t) =>
              renderFiltroChip(t.nombre, tipoSeleccionado === t.id, () =>
                setTipoSeleccionado(tipoSeleccionado === t.id ? null : t.id)
              )
            )}
          </ScrollView>
        </View>
      )}

      {/* Lista */}
      {loadingCanchas ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={cargarCanchas}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : canchas.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No hay canchas disponibles para los filtros seleccionados.</Text>
        </View>
      ) : (
        <FlatList
          data={canchas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCancha}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  filtrosContainer: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
  },
  chipRow: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  cardBody: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 6,
  },
  cardCapacidad: {
    fontSize: 12,
    color: '#9ca3af',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
