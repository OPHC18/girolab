# Manual de Operaciones — Giro Lab

> Última actualización: abril 2026  
> Dominio: https://girolab.net  
> Repositorio: https://github.com/OPHC18/girolab

---

## Índice

1. [Stack tecnológico](#1-stack-tecnológico)
2. [Qué se ha construido](#2-qué-se-ha-construido)
3. [Cómo hacer deploy](#3-cómo-hacer-deploy)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Dónde cambiar los textos de emails](#5-dónde-cambiar-los-textos-de-emails)
6. [Dónde cambiar precios de membresías](#6-dónde-cambiar-precios-de-membresías)
7. [Dónde cambiar precios de planes en PayPal](#7-dónde-cambiar-precios-de-planes-en-paypal)
8. [Cómo agregar o editar instrumentos de evaluación](#8-cómo-agregar-o-editar-instrumentos-de-evaluación)
9. [Cómo gestionar usuarios y roles](#9-cómo-gestionar-usuarios-y-roles)
10. [Cómo gestionar membresías manualmente](#10-cómo-gestionar-membresías-manualmente)
11. [Referencia de tablas Supabase](#11-referencia-de-tablas-supabase)
12. [Servicios externos y sus dashboards](#12-servicios-externos-y-sus-dashboards)
13. [Estructura de carpetas clave](#13-estructura-de-carpetas-clave)

---

## 1. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend / Backend | Next.js 15 (App Router) — TypeScript |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Emails transaccionales | Brevo (ex Sendinblue) |
| Pagos — membresías | PayPal Subscriptions API |
| Deploy | Vercel |
| DNS / Dominio | GoDaddy → apuntado a Vercel |

---

## 2. Qué se ha construido

### Roles de usuario
- **Persona** — busca Menters, agenda citas, hace tests de bienestar
- **Menter** — profesional de bienestar, tiene perfil público, agenda, dashboard completo
- **Empresa** — gestiona talento, accede a instrumentos organizacionales
- **Admin** — acceso al panel de administración

### Módulos completados

#### Autenticación
- Registro / login con email y contraseña
- Login con Google
- Recuperación de contraseña
- Confirmación de email (plantilla personalizada en Supabase)

#### Directorio de Menters
- Búsqueda y filtros (especialidad, modalidad, precio, idioma)
- Matching automático basado en respuestas del onboarding
- Perfil público de cada Menter (`/menter/[id]`)

#### Sistema de citas
- Agenda pública de cada Menter con disponibilidad configurable
- Solicitud, confirmación, rechazo y cancelación de citas
- Reprogramación con notificación al otro participante
- Después de confirmar → modal con botón de WhatsApp para coordinar el pago
- Email automático en cada cambio de estado

#### Membresías Menter (PayPal)
- Plan **Free** — perfil básico
- Plan **Starter** — $20/mes o $216/año (matching, formación, idiomas)
- Plan **Premium** — $28/mes o $303/año (colegiatura, certificados, blog, redes)
- Plan **Master** — otorgado manualmente por Giro Lab
- 15 días de prueba gratuita en Starter y Premium
- Suscripción, cancelación y downgrade automático por pago fallido via webhook

#### Tests de evaluación (11 instrumentos)
- Accesibles con o sin cuenta
- Usuarios anónimos ingresan nombre y email antes de empezar
- Resultado con gráficas de colores diferenciados
- Botón para compartir resultado
- El Menter ve quién completó su test (incluyendo email de anónimos)

#### Dashboard Menter
- Perfil pro: bio, especialidades, precios, disponibilidad, enlaces (WhatsApp, redes)
- Membresía: ver plan actual, suscribirse, cancelar
- Citas: gestión completa de agenda
- Instrumentos: enviar tests, ver resultados de sus clientes
- Roadmap: objetivos e hitos por cliente (con selector de hasta 6 recientes + búsqueda)
- Ingresos: reporte de sesiones y eventos
- Blog: crear y publicar artículos (plan Premium)
- Eventos: crear y gestionar eventos
- Comunidad: foro interno

#### Dashboard Persona
- Mis citas
- Compras
- Tests realizados
- Roadmap (vista como cliente)

#### Dashboard Empresa
- Instrumentos organizacionales (DISC, HEXACO)
- Perfiles de cargo
- Resultados de candidatos

#### Emails automáticos (8 transaccionales)
1. Bienvenida al registrarse
2. Nueva cita solicitada (al Menter)
3. Cita confirmada (a la Persona)
4. Cita cancelada
5. Solicitud de reprogramación
6. Pago de cita confirmado
7. Suscripción de membresía activada
8. Plan rebajado (pago fallido o cancelación)
9. Confirmación de inscripción a evento

#### Ciclo de retención (Supabase Edge Functions)
- Email día 1, día 3, día 7 para usuarios inactivos

#### Páginas públicas
- Home (`/`)
- Blog (`/blog`)
- Comunidad (`/comunidad`)
- Eventos (`/eventos`)
- Términos y condiciones (`/terminos`)
- Política de privacidad (`/privacidad`)
- Política de devoluciones (`/devoluciones`)
- Universo emocional (`/universo`)
- 404 personalizado

---

## 3. Cómo hacer deploy

Cada vez que quieras subir cambios a producción:

```bash
git add src/ public/ supabase/   # agrega los archivos modificados
git commit -m "descripción del cambio"
git push
```

Vercel detecta el push automáticamente y despliega en ~2 minutos.  
Puedes ver el progreso en: https://vercel.com → tu proyecto → Deployments

---

## 4. Variables de entorno

Están en dos lugares:
- **Desarrollo local**: archivo `.env.local` (en la raíz del proyecto, nunca se sube a Git)
- **Producción**: Vercel → Settings → Environment Variables

### Variables actuales

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dbtkrvcftvxmzxalpwze.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Brevo (emails)
BREVO_API_KEY=xkeysib-...
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=...
BREVO_SMTP_PASS=xsmtpsib-...
BREVO_SENDER_EMAIL=contacto@girolab.net
BREVO_SENDER_NAME=Giro Lab

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX=ATPTzz...
PAYPAL_SECRET_SANDBOX=EMMgE6...
NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE=Ach4st...
PAYPAL_SECRET_LIVE=EPAF_I...
PAYPAL_MODE=sandbox          # cambiar a "live" para producción real
PAYPAL_WEBHOOK_ID=49J01948NU1000923

# IDs de planes PayPal (se llenan después de crear los planes)
PAYPAL_PLAN_ID_STARTER_MONTHLY=
PAYPAL_PLAN_ID_STARTER_ANNUAL=
PAYPAL_PLAN_ID_PREMIUM_MONTHLY=P-5TG51934LA9807J00NHOWXZQ
PAYPAL_PLAN_ID_PREMIUM_ANNUAL=

# App
NEXT_PUBLIC_APP_URL=https://girolab.net
INTERNAL_API_SECRET=...

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...
```

---

## 5. Dónde cambiar los textos de emails

Todos los emails están en:

```
src/lib/email/templates/
```

| Archivo | Emails que contiene |
|---|---|
| `auth.ts` | Bienvenida al registrarse |
| `citas.ts` | Nueva cita, confirmada, cancelada, reprogramación, pago confirmado |
| `pagos.ts` | Suscripción activada, plan rebajado |
| `eventos.ts` | Confirmación de inscripción a evento |
| `retencion.ts` | Ciclo retención días 1, 3 y 7 |

### Cómo editar un email

Abre el archivo correspondiente. Cada función es un email. Los textos están dentro de llamadas como:

```typescript
h1('Título del email')
p('Párrafo de texto aquí')
btn('Texto del botón', url)
```

Edita el texto entre comillas y guarda. Luego haz `git push` para que el cambio llegue a producción.

### Layout general (header y footer de todos los emails)

```
src/lib/email/layout.ts
```

Aquí puedes cambiar el color del header (`#421869`), el nombre en el footer, y el link al dashboard.

---

## 6. Dónde cambiar precios de membresías

Los precios que se **muestran en la UI** del dashboard están en:

```
src/app/dashboard/page.tsx  →  línea ~56
```

```typescript
const PLANES = {
  starter: { precio_mensual: 20,  precio_anual: 216  },
  premium: { precio_mensual: 28,  precio_anual: 303  },
}
```

Los precios que se **cobran en PayPal** están en:

```
src/lib/paypal.ts  →  línea ~63
```

```typescript
export const PLAN_PRICES = {
  starter: { monthly: 20.00, annual: 216.00, label: 'Starter' },
  premium: { monthly: 28.00, annual: 303.00, label: 'Premium' },
}
```

**Importante:** Si cambias los precios, debes cambiarlos en los dos lugares y además crear planes nuevos en PayPal (los planes existentes no se pueden modificar, solo desactivar).

---

## 7. Dónde cambiar precios de planes en PayPal

Cuando cambies precios en el código, los planes existentes en PayPal ya no coincidirán. El proceso es:

1. Cambia los precios en `src/lib/paypal.ts` y en `dashboard/page.tsx`
2. Borra o deja en blanco los `PAYPAL_PLAN_ID_*` en `.env.local` y Vercel
3. Haz deploy
4. Intenta una suscripción de prueba → se crearán planes nuevos en PayPal con los precios correctos
5. Copia los nuevos IDs a las variables de entorno

### Para pasar a producción (Live)

1. En Vercel cambia `PAYPAL_MODE=live`
2. Registra el webhook en PayPal Live: `https://girolab.net/api/paypal/webhook`
3. Actualiza `PAYPAL_WEBHOOK_ID` con el ID del webhook de Live
4. Los `PAYPAL_PLAN_ID_*` deben ser los IDs del entorno Live (se crean igual que en sandbox)

---

## 8. Cómo agregar o editar instrumentos de evaluación

Los instrumentos están en:

```
src/lib/assessments/instruments.ts        ← instrumentos de Menter/Persona
src/lib/assessments/instruments_empresa.ts ← instrumentos de Empresa
src/lib/assessments/items/                 ← preguntas de cada instrumento
```

Cada instrumento tiene:
- `id` — identificador único
- `name` — nombre visible
- `description` — descripción corta
- `items` — array de preguntas (en la carpeta `items/`)
- `scoring` — función que calcula el resultado

Para agregar un instrumento nuevo:
1. Crea el archivo de ítems en `src/lib/assessments/items/nombre.ts`
2. Agrégalo al índice `src/lib/assessments/items/index.ts`
3. Define el instrumento en `instruments.ts` o `instruments_empresa.ts`

---

## 9. Cómo gestionar usuarios y roles

Desde Supabase → Authentication → Users puedes:
- Ver todos los usuarios
- Editar `user_metadata` (donde está el campo `role`)
- Desactivar o eliminar cuentas

Los roles válidos son: `persona`, `menter`, `empresa`

Para dar acceso **Master** a un Menter:
1. Supabase → SQL Editor → ejecuta:
```sql
UPDATE menter_memberships
SET plan = 'master', is_active = true
WHERE menter_id = 'UUID-del-menter';
```

---

## 10. Cómo gestionar membresías manualmente

### Ver todas las membresías activas
```sql
SELECT mm.menter_id, u.email, mm.plan, mm.billing_cycle,
       mm.is_active, mm.trial_ends_at, mm.paypal_subscription_id
FROM menter_memberships mm
JOIN auth.users u ON u.id = mm.menter_id
WHERE mm.is_active = true
ORDER BY mm.plan, u.email;
```

### Subir de plan manualmente (sin PayPal)
```sql
UPDATE menter_memberships
SET plan = 'premium',
    billing_cycle = 'monthly',
    is_active = true,
    starts_at = now(),
    expires_at = now() + interval '1 month',
    updated_at = now()
WHERE menter_id = 'UUID-del-menter';
```

### Bajar a Free manualmente
```sql
UPDATE menter_memberships
SET plan = 'free',
    is_active = false,
    paypal_subscription_id = null,
    downgrade_reason = 'manual',
    updated_at = now()
WHERE menter_id = 'UUID-del-menter';
```

---

## 11. Referencia de tablas Supabase

| Tabla | Qué guarda |
|---|---|
| `auth.users` | Usuarios (gestionado por Supabase Auth) |
| `menter_profiles` | Perfil público del Menter (bio, especialidades, precios) |
| `menter_memberships` | Plan, ciclo, estado de suscripción PayPal |
| `appointments` | Citas entre Persona y Menter |
| `events` | Eventos creados por Menters |
| `event_registrations` | Inscripciones a eventos |
| `roadmaps` | Roadmaps de clientes |
| `roadmap_objectives` | Objetivos dentro de un roadmap |
| `roadmap_milestones` | Hitos dentro de un objetivo |
| `assessment_results` | Resultados de tests de evaluación |
| `blog_posts` | Artículos del blog |
| `payments` | Log de todos los pagos procesados |
| `job_profiles` | Perfiles de cargo (para Empresas) |

---

## 12. Servicios externos y sus dashboards

| Servicio | Para qué | Dashboard |
|---|---|---|
| **Supabase** | Base de datos + Auth | supabase.com → proyecto dbtkrvcftvxmzxalpwze |
| **Brevo** | Emails transaccionales | app.brevo.com |
| **PayPal** | Cobro de membresías | developer.paypal.com (sandbox) / paypal.com (live) |
| **Vercel** | Deploy y hosting | vercel.com |
| **GoDaddy** | Dominio girolab.net | godaddy.com |
| **GitHub** | Repositorio de código | github.com/OPHC18/girolab |

---

## 13. Estructura de carpetas clave

```
src/
├── app/
│   ├── api/                    ← Endpoints del servidor
│   │   ├── paypal/             ← Suscripciones PayPal
│   │   ├── mp/                 ← MercadoPago (solo eventos, legacy)
│   │   ├── assessment/         ← Guardar resultados de tests
│   │   ├── email/              ← Envío de emails desde cliente
│   │   └── account/            ← Eliminar cuenta
│   ├── dashboard/              ← Dashboard principal (todos los roles)
│   │   ├── page.tsx            ← Componente principal (~7000 líneas)
│   │   └── components/         ← Sub-componentes del dashboard
│   ├── menter/[id]/            ← Perfil público del Menter
│   ├── test/[instrument]/      ← Tests de evaluación
│   ├── blog/                   ← Blog público
│   ├── eventos/                ← Eventos públicos
│   └── comunidad/              ← Comunidad
├── components/                 ← Componentes reutilizables
│   ├── AgendaModalPublico.tsx  ← Modal de agendar cita (desde perfil público)
│   └── assessments/            ← Stepper de tests
└── lib/
    ├── assessments/            ← Instrumentos, ítems y scoring
    ├── email/                  ← Layout + templates de emails
    ├── paypal.ts               ← Cliente PayPal REST API
    ├── supabase-server.ts      ← Cliente Supabase server-side
    └── recaptcha.ts            ← Verificación reCAPTCHA

supabase/
├── migrations/                 ← Scripts SQL de cambios a la BD
└── functions/                  ← Edge Functions (retención de usuarios)
```

---

*Manual generado para el equipo de Giro Lab — abril 2026*
