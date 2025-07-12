# Corrección del error de React Object

## Error encontrado

Al intentar registrar un usuario como anfitrión, aparecía el error:
```
Objects are not valid as a React child (found: object with keys {code, message})
```

## Causa del problema

El backend devuelve los errores en formato de objeto:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El email ya está registrado"
  }
}
```

Pero el frontend estaba intentando renderizar este objeto directamente en el JSX, lo cual no está permitido en React.

## Solución implementada

Actualicé el manejo de errores en `App.tsx` para extraer correctamente el mensaje del objeto error:

### Antes:
```typescript
setError(err.response?.data?.error || 'Registration failed');
```

### Después:
```typescript
const errorData = err.response?.data?.error;
const errorMessage = typeof errorData === 'object' && errorData.message 
  ? errorData.message 
  : errorData || 'Registration failed';
setError(errorMessage);
```

## Archivos modificados

- `/frontend/src/App.tsx` - Corregido el manejo de errores en `handleLogin` y `handleRegister`

## Resultado

✅ El error de React ya no aparece
✅ Los mensajes de error se muestran correctamente
✅ La experiencia de usuario es más clara

## Para probar

1. Intenta registrarte con un email que ya existe
2. El mensaje de error debería aparecer correctamente sin crashear la aplicación
3. Intenta hacer login con credenciales incorrectas
4. El mensaje de error también debería aparecer correctamente