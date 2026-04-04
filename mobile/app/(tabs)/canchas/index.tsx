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

  useEffect(() => {
    async function cargarFiltros() {
      try {
        const [sedesData, tiposData] = await Promise.all([getSedes(), getTiposCanchas()]);
        setSedes(sedesData);
        setTipos(tiposData);
      } catch {
        // Los filtros no son criticos; la lista de canchas igual puede mostrarse.
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
      setError('No se pudo cargar la lista de canchas. Verifica tu conexion.');
    } finally {
      setLoadingCanchas(false);
    }
  }, [sedeSeleccionada, tipoSeleccionado]);

  useEffect(() => {
    cargarCanchas();
  }, [cargarCanchas]);

  function renderFiltroChip(label: string, isActive: boolean, onPress: () => void) {
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
    const tipoNombre = item.tipoNombre ?? item.tipo?.nombre ?? 'Cancha';
    const sedeNombre = item.sedeNombre ?? item.sede?.nombre ?? 'Sede sin asignar';
    const inicial = item.nombre.trim().charAt(0).toUpperCase() || 'C';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: '/(tabs)/canchas/[id]',
            params: {
              id: item.id.toString(),
              canchaData: JSON.stringify(item),
            },
          })
        }
      >
        {item.imagenUrl ? (
          <Image source={{ uri: item.imagenUrl }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.placeholderInitial}>{inicial}</Text>
            <Text style={styles.placeholderText}>{tipoNombre}</Text>
          </View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{tipoNombre}</Text>
            </View>
          </View>

          <Text style={styles.cardMeta}>{sedeNombre}</Text>

          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.descripcion}
          </Text>

          {item.capacidad > 0 ? (
            <Text style={styles.cardCapacidad}>Capacidad: {item.capacidad} personas</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {!loadingFiltros && (
        <View style={styles.filtrosContainer}>
          <Text style={styles.filtroLabel}>Sede</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {renderFiltroChip('Todas', sedeSeleccionada === null, () => setSedeSeleccionada(null))}
            {sedes.map((sede) =>
              renderFiltroChip(sede.nombre, sedeSeleccionada === sede.id, () =>
                setSedeSeleccionada(sedeSeleccionada === sede.id ? null : sede.id)
              )
            )}
          </ScrollView>

          <Text style={styles.filtroLabel}>Tipo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {renderFiltroChip('Todos', tipoSeleccionado === null, () => setTipoSeleccionado(null))}
            {tipos.map((tipo) =>
              renderFiltroChip(tipo.nombre, tipoSeleccionado === tipo.id, () =>
                setTipoSeleccionado(tipoSeleccionado === tipo.id ? null : tipo.id)
              )
            )}
          </ScrollView>
        </View>
      )}

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
          <Text style={styles.emptyText}>
            No hay canchas disponibles para los filtros seleccionados.
          </Text>
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
    height: 120,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderInitial: {
    color: '#1d4ed8',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 4,
  },
  placeholderText: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '600',
  },
  cardBody: {
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  typeBadge: {
    backgroundColor: '#eff6ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d4ed8',
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
