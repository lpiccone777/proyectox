# Depósito Urbano Compartido

Una plataforma colaborativa que conecta personas que necesitan espacio de almacenamiento con quienes tienen espacio disponible en sus hogares.

## 🚀 Características

- **Autenticación segura** con JWT
- **Búsqueda geolocalizada** de espacios
- **Sistema de reservas** completo
- **Pagos integrados** con MercadoPago
- **Calificaciones bidireccionales**
- **Apps nativas** para iOS y Android

## 📁 Estructura del Proyecto

```
proyectoX/
├── backend/          # API REST con Node.js/Express
├── ios/             # App nativa iOS (Swift/SwiftUI)
├── android/         # App nativa Android (Kotlin/Compose)
├── nginx/           # Configuración del proxy reverso
├── scripts/         # Scripts de despliegue
└── docker-compose.yml
```

## 🛠️ Tecnologías

### Backend
- Node.js + Express + TypeScript
- PostgreSQL con PostGIS
- Sequelize ORM
- JWT para autenticación
- MercadoPago SDK

### Mobile
- **iOS**: Swift, SwiftUI, URLSession
- **Android**: Kotlin, Jetpack Compose, Retrofit, Hilt

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- Nginx como proxy reverso

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose
- Xcode 14+ (para iOS)
- Android Studio (para Android)

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/tuusuario/depositourbano.git
cd depositourbano
```

2. **Configurar variables de entorno**
```bash
cp backend/.env.example backend/.env
# Editar .env con tus valores
```

3. **Iniciar con Docker**
```bash
docker-compose up -d
```

4. **Ejecutar migraciones**
```bash
cd backend
npm install
npm run migrate
```

### Desarrollo

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**iOS:**
```bash
cd ios
pod install
open DepositoUrbano.xcworkspace
```

**Android:**
```bash
cd android
./gradlew assembleDebug
```

## 🧪 Testing

**Backend:**
```bash
cd backend
npm test          # Ejecutar tests
npm run test:watch # Modo watch
```

**iOS:**
```bash
cd ios
xcodebuild test -workspace DepositoUrbano.xcworkspace -scheme DepositoUrbanoTests
```

**Android:**
```bash
cd android
./gradlew test
```

## 📦 Despliegue

### Opción 1: Railway (Recomendado)

1. Conecta tu repositorio en [Railway](https://railway.app)
2. Agrega las variables de entorno necesarias
3. Railway detectará automáticamente la configuración

### Opción 2: Render

1. Crea un nuevo Web Service en [Render](https://render.com)
2. Conecta tu repositorio
3. Render usará el archivo `render.yaml`

### Opción 3: Docker

```bash
./scripts/deploy.sh production
```

## 🔐 Variables de Entorno

### Backend
- `NODE_ENV`: Entorno (development/production)
- `PORT`: Puerto del servidor
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Configuración de PostgreSQL
- `JWT_SECRET`: Clave secreta para JWT
- `MERCADOPAGO_ACCESS_TOKEN`: Token de MercadoPago

### Mobile
- `API_BASE_URL`: URL de la API
- `GOOGLE_MAPS_API_KEY`: API Key de Google Maps

## 📱 Distribución de Apps

### iOS
1. Configura tu Apple Developer Account
2. Actualiza el Bundle ID y provisioning profiles
3. Archive y sube a App Store Connect

### Android
1. Genera un keystore para producción
2. Configura el signing en `app/build.gradle`
3. Genera el APK/AAB para Google Play

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- Backend & DevOps: [@tuusuario](https://github.com/tuusuario)
- iOS Development: [@tuusuario](https://github.com/tuusuario)
- Android Development: [@tuusuario](https://github.com/tuusuario)

---

Hecho con ❤️ para el mercado argentino 🇦🇷