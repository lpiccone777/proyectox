# Configuración de OAuth para Depósito Urbano

## 🔐 Google OAuth Setup

### 1. Crear proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre sugerido: "Deposito Urbano"

### 2. Habilitar Google+ API
1. En el menú lateral, ve a **APIs y servicios** > **Biblioteca**
2. Busca "Google+ API" o "Google Identity"
3. Haz click en **Habilitar**

### 3. Configurar pantalla de consentimiento OAuth
1. Ve a **APIs y servicios** > **Pantalla de consentimiento de OAuth**
2. Selecciona **Externo** como tipo de usuario
3. Completa la información:
   - Nombre de la aplicación: "Depósito Urbano"
   - Correo de soporte: tu email
   - Logo de la aplicación: (opcional)
   - Dominios autorizados: localhost (para desarrollo)
   - Correo del desarrollador: tu email

### 4. Crear credenciales OAuth 2.0
1. Ve a **APIs y servicios** > **Credenciales**
2. Click en **Crear credenciales** > **ID de cliente OAuth**
3. Tipo de aplicación: **Aplicación web**
4. Nombre: "Depósito Urbano Web"
5. Orígenes de JavaScript autorizados:
   ```
   http://localhost:3001
   http://localhost:3000
   ```
6. URIs de redirección autorizados:
   ```
   http://localhost:5001/api/v1/auth/google/callback
   ```
7. Click en **Crear**

### 5. Copiar las credenciales
Obtendrás:
- **Client ID**: algo como `123456789-abc...apps.googleusercontent.com`
- **Client Secret**: una cadena secreta

### 6. Configurar variables de entorno

#### Backend (.env)
```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
```

#### Frontend (.env)
```env
REACT_APP_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

## 🍎 Apple Sign In Setup (Opcional)

### Requisitos
- Cuenta de desarrollador de Apple ($99/año)
- Acceso a Apple Developer Portal

### 1. Configurar en Apple Developer
1. Ve a [Apple Developer](https://developer.apple.com/)
2. Ve a **Certificates, Identifiers & Profiles**
3. Crea un nuevo **App ID**:
   - Platform: iOS + macOS
   - Description: "Depósito Urbano"
   - Bundle ID: `com.tucompania.depositourbano`
   - Capabilities: Habilita **Sign In with Apple**

### 2. Crear Service ID
1. En **Identifiers**, crea un nuevo **Services ID**
2. Description: "Depósito Urbano Web"
3. Identifier: `com.tucompania.depositourbano.web`
4. Habilita **Sign In with Apple**
5. Configura dominios y URLs de retorno:
   - Dominios: `localhost`
   - Return URLs: `http://localhost:5001/api/v1/auth/apple/callback`

### 3. Crear Key
1. Ve a **Keys**
2. Crea una nueva key
3. Nombre: "Depósito Urbano Auth Key"
4. Habilita **Sign In with Apple**
5. Descarga el archivo `.p8` (guárdalo seguro, solo se puede descargar una vez)

### 4. Variables de entorno para Apple

#### Backend (.env)
```env
APPLE_CLIENT_ID=com.tucompania.depositourbano.web
APPLE_TEAM_ID=TU_TEAM_ID
APPLE_KEY_ID=TU_KEY_ID
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
[contenido del archivo .p8]
-----END PRIVATE KEY-----
```

## 🚀 Probar la implementación

### 1. Reiniciar servidores
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

### 2. Verificar funcionalidad
1. Abre http://localhost:3001
2. En la pantalla de login, verás el botón de "Sign in with Google"
3. Click en el botón
4. Serás redirigido a Google para autenticarte
5. Después de autorizar, serás redirigido de vuelta y logueado automáticamente

## ⚠️ Notas importantes

### Para desarrollo
- Las URLs de localhost funcionan sin HTTPS para desarrollo
- Google OAuth funciona inmediatamente después de la configuración
- Apple Sign In requiere HTTPS incluso en desarrollo (usa ngrok si es necesario)

### Para producción
1. Actualiza las URLs autorizadas en Google Console
2. Actualiza las URLs de retorno en Apple Developer
3. Usa HTTPS obligatoriamente
4. Actualiza las variables de entorno con las URLs de producción

## 🔧 Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que las URLs en Google Console coincidan exactamente con las de tu aplicación
- Incluye el puerto si lo usas (ej: `:3001`)

### Error: "invalid_client"
- Verifica que el Client ID esté correcto en frontend y backend
- Asegúrate de que el Client Secret esté solo en el backend

### El botón de Google no aparece
- Verifica que `REACT_APP_GOOGLE_CLIENT_ID` esté configurado
- Reinicia el servidor de React después de agregar variables de entorno

## 📚 Referencias
- [Google Identity Platform](https://developers.google.com/identity)
- [Sign in with Apple JS](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js)
- [React OAuth2 | Google](https://www.npmjs.com/package/@react-oauth/google)