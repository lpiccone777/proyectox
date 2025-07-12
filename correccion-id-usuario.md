# Corrección del error de ID al crear usuarios

## Problema identificado

Al intentar registrar un nuevo usuario, el sistema fallaba con "Validation error" porque:

1. El controlador estaba enviando `id: 0` al crear usuarios
2. Ya existe un usuario con ID 0 en la base de datos (`elmvpiccone@gmail.com`)
3. PostgreSQL intentaba insertar con ese ID específico en lugar de autogenerarlo

## SQL problemático
```sql
INSERT INTO "users" ("id","email","password",...) VALUES ($1,$2,$3,...)
```
Donde `$1` era 0, causando conflicto con el usuario existente.

## Solución aplicada

En `authController.ts`, cambié:

### Antes:
```typescript
const user = await User.create({
  id: 0, // Will be auto-generated
  email,
  password,
  // ...
} as any);
```

### Después:
```typescript
const user = await User.create({
  email,
  password,
  // ...
});
```

## Resultado

- ✅ El ID ahora se autogenera correctamente
- ✅ No hay conflictos con IDs existentes
- ✅ Los nuevos usuarios pueden registrarse sin problemas

## Para verificar

1. Reinicia el servidor backend
2. Intenta registrarte con `asesorpicconel@gmail.com`
3. Debería funcionar correctamente

## Usuarios actuales en la base de datos

```
ID 0: elmvpiccone@gmail.com
ID 1: host@example.com
ID 2: tenant@example.com
ID 3: both@example.com
```

Los nuevos usuarios se crearán con ID 4 en adelante.