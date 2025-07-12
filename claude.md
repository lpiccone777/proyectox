# Proyecto: Depósito Urbano Compartido (Micro-Almacenaje)

## Contexto
Eres un agente inteligente Claude Code especializado en desarrollo ágil, eficiente y escalable. Tu tarea es crear desde cero una aplicación para gestionar un negocio colaborativo llamado Depósito Urbano Compartido, orientado al mercado argentino.

## Descripción del negocio
Una plataforma colaborativa que conecta:
- **Anfitriones**: usuarios que ofrecen espacios vacíos de almacenamiento (habitaciones, garajes, depósitos pequeños, bauleras).
- **Inquilinos**: usuarios que necesitan espacios temporales para guardar objetos personales (mudanzas, vacaciones, falta de espacio).

## Especificaciones técnicas

### Arquitectura
- Monorepo

### Frontend
- Desarrollo REAL nativo (no híbrido), Mobile First (iOS y Android nativo)
- Flujo clave de pantallas:
  - Registro/Login
  - Búsqueda con geolocalización
  - Listado detallado de espacios
  - Reserva y pago
  - Gestión de reservas y calificaciones

### Backend
- Desarrollo en Node.js con Express
- API REST completa y segura
- Base de datos relacional: PostgreSQL
- Integración de pagos: MercadoPago
- Autenticación robusta

### Infraestructura
Definir claramente en la implementación, pero optimizada para rendimiento y escalabilidad.

## Reglas que debes cumplir antes de finalizar cada tarea
1. ¿Cumplí claramente con el objetivo específico de la tarea asignada?
2. ¿El frontend y backend están alineados en cuanto a datos, estructura y expectativas mutuas?
3. ¿Probé de forma exhaustiva y completa todos los endpoints que creé?
4. ¿Los tests cubren al menos el 80% del código implementado?
5. ¿El frontend y backend compilan correctamente sin errores?

## Módulos que debe incluir tu desarrollo

### Frontend Mobile (nativo)
- Registro y Login (Google, Apple, correo electrónico)
- Roles diferenciados (Anfitrión/Inquilino)
- Creación y gestión de espacios disponibles (fotos, precios, calendario)
- Búsqueda avanzada con geolocalización
- Pantalla de reserva, checkout y pagos digitales (MercadoPago)
- Gestión de reservas activas y finalizadas
- Calificaciones bidireccionales y reseñas

### Backend Node.js (Express)
- API REST con endpoints claros para todas las operaciones
- Gestión de usuarios con autenticación segura (JWT recomendado)
- Administración de espacios, reservas, pagos, calificaciones
- Base de datos relacional (PostgreSQL): estructura eficiente, relaciones bien definidas
- Integración robusta con MercadoPago para pagos y reembolsos

### Seguridad
- Implementa prácticas seguras en la gestión de datos personales y financieros
- Protección contra ataques comunes (inyección SQL, XSS, etc.)

### Pruebas automatizadas
- Unit tests y pruebas de integración para backend y frontend
- Cobertura mínima del 80% del código implementado

## Primeros pasos que debes seguir
1. Configura el monorepo para albergar frontend (iOS y Android nativo) y backend (Node.js)
2. Define e implementa claramente el modelo de datos en PostgreSQL
3. Diseña API REST inicial con estructura de endpoints y objetos JSON bien definidos
4. Crea estructura básica del frontend mobilefirst (autenticación, navegación inicial, pantallas principales)

Tu entrega final debe resultar en un proyecto plenamente funcional, altamente escalable y claramente documentado dentro del monorepo.

**Recuerda antes de finalizar**: ¿Cumplí el objetivo? ¿Frontend y backend alineados? ¿Tests cumplen cobertura 80%? ¿Compila sin errores?