# MANUAL JWT - CECyTech Backend

## Qué es JWT y por qué lo necesitamos

JWT (JSON Web Token) es un token firmado por el backend que demuestra que un usuario ya inició sesión. Cuando el frontend envía una petición con `Authorization: Bearer <token>`, el backend valida la firma y extrae el usuario real del token — **no del body**.

Esto evita que alguien envíe cualquier `studentId` y registre asistencia por otro alumno.

---

## Qué ya está implementado (base)

Los siguientes archivos ya existen en `src/auth/` y están listos para usar por cualquier módulo:

| Archivo | Qué hace |
|---------|----------|
| `auth.module.ts` | Módulo que exporta `JwtModule` (global) y `AuthService` |
| `jwt.strategy.ts` | Extrae el token del header `Authorization`, lo valida con `JWT_SECRET`, y pone el payload en `req.user` |
| `jwt-auth.guard.ts` | Guard que exige JWT válido en la ruta |
| `roles.guard.ts` | Guard que compara `req.user.role` contra los roles permitidos |
| `current-user.decorator.ts` | Decorador `@CurrentUser()` para obtener el usuario del request |
| `roles.decorator.ts` | Decorador `@Roles('student', 'teacher')` para definir roles permitidos |
| `auth.service.ts` | Servicio de login que retorna `{ access_token, user }` |
| `auth.controller.ts` | Endpoint `POST /api/auth/login` |

**No toques estos archivos.** Solo úsalos importando desde `../auth/`.

---

## Cómo funciona el login

```
POST /api/auth/login
Body: { "identifier": "email@correo.com", "password": "xxx" }

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-del-usuario",
    "email": "email@correo.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "student",
    ...
  }
}
```

El `access_token` es el JWT. El frontend debe guardarlo y enviarlo en todas las peticiones protegidas.

---

## Cómo proteger rutas en CUALQUIER módulo

### Paso 1: Importar los decoradores y guards

En tu **controller**, agrega estos imports al inicio del archivo:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
```

### Paso 2: Aplicar guards a las rutas

Hay 3 niveles de protección:

#### Nivel 1: Solo requiere estar logueado (cualquier rol)

```typescript
@UseGuards(JwtAuthGuard)
@Get('mis-datos')
misDatos(@CurrentUser() user: any) {
  // user = { id: "uuid", email: "...", role: "student" }
  // El id viene del JWT, no del body
  return this.miService.obtenerPorUsuario(user.id);
}
```

#### Nivel 2: Requiere un rol específico

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher')
@Post('calificar')
calificar(@Body() dto: CalificarDto, @CurrentUser() user: any) {
  // user.id = uuid del profesor logueado
  return this.miService.calificar(dto, user.id);
}
```

#### Nivel 3: Varios roles permitidos

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
@Get('reportes')
verReportes() {
  return this.miService.obtenerReportes();
}
```

### Paso 3: Obtener el usuario logueado

Usa `@CurrentUser()` en los parámetros del método:

```typescript
@UseGuards(JwtAuthGuard)
@Get('algo')
async miMetodo(@CurrentUser() user: any) {
  console.log(user.id);    // UUID del usuario
  console.log(user.email); // email del usuario
  console.log(user.role);  // "admin" | "teacher" | "student" | "parent"
}
```

**IMPORTANTE:** `@CurrentUser()` debe ser el ÚNICO decorador de parámetro custom. Si necesitas más, agrúpalos.

---

## Ejemplo: Attendance (asistencia por QR)

**Problema que resuelve:** Un alumno envía `studentId` de otro para registrar asistencia por él.

**Solución con JWT:** El ID viene del token, no del body.

```typescript
// AttendanceController.ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('student')
@Post('scan')
async scanQr(
  @Body() dto: { qrToken: string },
  @CurrentUser() user: any,
) {
  // user.id = UUID del ALUMNO logueado (viene del JWT)
  // NO necesitas enviar studentId en el body
  return this.attendanceService.scanQr(dto.qrToken, user.id);
}
```

**Flujo:**
```
1. Profesor inicia asistencia → POST /api/attendance/start → Token de profesor → user.id = profesor
2. Alumno escanea QR → POST /api/attendance/scan → Token de alumno → user.id = alumno correcto
```

---

## Ejemplo: Evaluaciones (Meredith)

```typescript
// partial-grades.controller.ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher')
@Post()
create(@Body() dto: CreatePartialGradeDto, @CurrentUser() user: any) {
  // user.id = UUID del profesor que califica
  return this.partialGradesService.create(dto, user.id);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('student')
@Get('my-grades')
getMyGrades(@CurrentUser() user: any) {
  // user.id = UUID del alumno que consulta sus calificaciones
  return this.partialGradesService.findByStudent(user.id);
}
```

---

## Ejemplo: Exámenes (Aníbal)

```typescript
// exam-attempts.controller.ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('student')
@Post()
startAttempt(@Body() dto: CreateExamAttemptDto, @CurrentUser() user: any) {
  // user.id = UUID del alumno que intenta el examen
  return this.examAttemptsService.start(dto.examId, user.id);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
@Get()
findAll() {
  // Solo admin y teacher ven todos los intentos
  return this.examAttemptsService.findAll();
}
```

---

## Ejemplo: Rutas mixtas (cualquier módulo)

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher', 'student', 'parent')
@Get('reporte/:id')
getReporte(@Param('id') id: string, @CurrentUser() user: any) {
  // Todos los roles pueden ver, pero el service filtra según user.role
  return this.miService.getReporte(id, user.id, user.role);
}
```

---

## Ejemplo: Rutas públicas (sin guard)

```typescript
// Login y register NO necesitan guards
@Post('login')
login(@Body() dto: LoginDto) {
  return this.authService.login(dto.identifier, dto.password);
}

@Post('register')
register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
}
```

---

## Cómo enviar el token desde el frontend

En cualquier petición HTTP del frontend:

```javascript
// Después de hacer login y recibir el token
const token = response.data.access_token;

// Guardarlo (localStorage, cookie, etc.)
localStorage.setItem('token', token);

// Enviarlo en cada petición protegida
fetch('http://localhost:3000/api/attendance/scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // ← AQUÍ
  },
  body: JSON.stringify({ qrToken: '...' })
});
```

Si no envías el token o es inválido, el backend responde `401 Unauthorized`.

---

## Errores comunes

### 401 Unauthorized
- No enviaste el header `Authorization`
- El token expiró (duración: 1 hora por defecto)
- El token es inválido (firma incorrecta)

### 403 Forbidden
- El usuario está logueado pero no tiene el rol requerido
- Ejemplo: un student intenta acceder a una ruta `@Roles('teacher')`

### Token expirado
El frontend debe detectar el 401 y redirigir al login para obtener un nuevo token.

---

## Variables de entorno (.env)

```
JWT_SECRET=mi-secreto    # Clave para firmar tokens (NO cambiar en producción)
JWT_EXPIRATION=1h        # Duración del token
```

---

## Resumen rápido para implementar (cualquier módulo)

1. En tu controller, agrega los imports de `JwtAuthGuard`, `RolesGuard`, `Roles`, `CurrentUser`
2. Antes de cada ruta que quieras proteger, pon `@UseGuards(JwtAuthGuard, RolesGuard)`
3. Agrega `@Roles('admin', 'teacher', 'student', 'parent')` según quién puede acceder
4. Usa `@CurrentUser() user: any` para obtener el usuario logueado
5. Usa `user.id` en tu service en vez de recibir el ID por body
6. Para rutas públicas (login, register), no pongas ningún guard

**Reglas:**
- Las rutas de login y register NO necesitan guards — son públicas por diseño
- `@CurrentUser()` debe ser el ÚNICO decorador de parámetro custom en el método
- Si necesitas que un servicio distinto (ej. `UsersService`) esté disponible, importa `UsersModule` en tu módulo
