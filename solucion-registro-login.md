# Solución del problema de registro y login

## Problema identificado

1. **Normalización de emails**: El validador estaba usando `normalizeEmail()` que modificaba los emails:
   - `User+tag@gmail.com` → `user@gmail.com`
   - `user.name@gmail.com` → `username@gmail.com`
   - Convertía a minúsculas y eliminaba puntos/etiquetas

2. **Usuarios existentes en la base de datos**:
   ```
   - elmvpiccone@gmail.com (role: both)
   - host@example.com (role: host)
   - tenant@example.com (role: tenant)
   - both@example.com (role: both)
   ```

3. **Flujo del error**:
   - Al registrarte con un email que se normaliza a uno existente → Error 409
   - Al hacer login, si la contraseña no coincide → Error 401

## Soluciones implementadas

### 1. Eliminé la normalización agresiva de emails
En `authValidators.ts`, cambié:
```typescript
// Antes
.normalizeEmail()

// Después
.trim()
.toLowerCase()
```

Ahora solo se elimina espacios en blanco y se convierte a minúsculas, sin modificar el contenido del email.

### 2. Mejoré el manejo de errores en el frontend
Los errores del backend que vienen como objetos `{code, message}` ahora se manejan correctamente y solo se muestra el mensaje.

## Para resolver tu situación actual

### Opción 1: Limpiar la base de datos
Si quieres empezar de cero:
```bash
# En el backend
npm run seed:reset  # Si existe este comando
# O conectarte a PostgreSQL y ejecutar:
# DELETE FROM users;
```

### Opción 2: Usar un email diferente
Intenta registrarte con un email que no esté en la lista anterior.

### Opción 3: Usar las credenciales de los usuarios seed
El script seed.ts probablemente creó estos usuarios con contraseña `password123`. Puedes intentar:
- Email: `host@example.com`
- Password: `password123` (o la que esté en el script seed)

## Verificación

Para verificar qué usuarios existen:
```bash
cd backend
npm run check:users
```

Para verificar si un email específico existe:
```bash
npm run check:users -- "tuemail@ejemplo.com"
```

## Resultado esperado

Con estas correcciones:
- Los emails ya no se modifican automáticamente
- Los errores se muestran correctamente
- Puedes registrarte con emails únicos
- El login funciona correctamente con las credenciales correctas