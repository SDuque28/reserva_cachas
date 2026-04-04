import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { login } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';

interface FormErrors {
  username?: string;
  password?: string;
}

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { signIn } = useAuth();
  const router = useRouter();

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!username.trim()) {
      newErrors.username = 'El usuario es requerido';
    }
    if (!password) {
      newErrors.password = 'La contrasena es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      console.log('[LOGIN SUBMIT]', { username: username.trim() });
      const { token, usuario } = await login({ username: username.trim(), password });
      console.log('[LOGIN SUCCESS]', {
        username: usuario.username,
        email: usuario.email,
        roles: usuario.roles,
        hasToken: Boolean(token),
      });
      await signIn(token, usuario);
      router.replace('/(tabs)/canchas');
    } catch (e: any) {
      console.error('[LOGIN ERROR]', {
        message: e?.message,
        status: e?.response?.status,
        responseData: e?.response?.data,
      });
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Usuario o contrasena incorrectos. Intenta de nuevo.';
      Alert.alert('Error al iniciar sesion', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Reserva Canchas</Text>
        <Text style={styles.subtitle}>Inicia sesion para continuar</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={[styles.input, errors.username ? styles.inputError : null]}
            value={username}
            onChangeText={(value) => {
              setUsername(value);
              if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
            }}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="tu_usuario"
            placeholderTextColor="#9ca3af"
          />
          {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Contrasena</Text>
          <TextInput
            style={[styles.input, errors.password ? styles.inputError : null]}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            secureTextEntry
            placeholder="******"
            placeholderTextColor="#9ca3af"
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar sesion</Text>
          )}
        </TouchableOpacity>

        <Link href="/register" asChild>
          <TouchableOpacity style={styles.linkButton} activeOpacity={0.7}>
            <Text style={styles.linkText}>No tienes cuenta? Registrate</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1e3a5f',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 36,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#ef4444',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
});
