'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from './actions';
import { Paper, TextInput, PasswordInput, Button, Title, Text } from '@mantine/core';
// @ts-expect-error
import IconShieldCheck from '@tabler/icons-react/dist/esm/icons/IconShieldCheck';

export default function LoginPage() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <div className="page-gradient">
      <Paper p="xl" radius="lg" className="glass-card" style={{
        width: '100%', maxWidth: 420,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto', color: '#fff'
          }}>
            <IconShieldCheck size={28} />
          </div>
          <Title order={3} mt="sm">Sistema de Calificaciones</Title>
          <Text size="sm" c="dimmed">IngresÃ¡ con tus credenciales de Encuentro TecnolÃ³gico</Text>
        </div>

        {errorMessage && (
          <div className="alert alert-error">{errorMessage}</div>
        )}

        <form action={dispatch}>
          <TextInput
            label="Correo ElectrÃ³nico"
            name="email"
            type="email"
            required
            placeholder="ejemplo@correo.com"
            mb="md"
          />
          <PasswordInput
            label="ContraseÃ±a"
            name="password"
            required
            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            mb="lg"
          />
          <LoginButton />
        </form>

        <Text ta="center" size="xs" c="dimmed" mt="xl">
          Â¿Olvidaste tu contraseÃ±a? ContactÃ¡ a tu docente.
        </Text>
      </Paper>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" fullWidth size="md" loading={pending} loaderProps={{ type: 'dots' }}>
      {pending ? 'Ingresando...' : 'Ingresar al Portal'}
    </Button>
  );
}
