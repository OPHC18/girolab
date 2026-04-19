import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'omarphc@hotmail.com', 'omarphc180726@gmail.com']

const DEMO_MENTERS = [
  {
    email: 'ana.rodriguez.demo@girolab.net',
    password: 'GiroLab2024!',
    nombre: 'Ana',
    apellidos: 'Rodríguez',
    pais: 'Colombia',
    bio: 'Coach certificada con 8 años de experiencia en bienestar integral y mindfulness. Acompaño a personas a reconectar con su propósito y gestionar el estrés con herramientas prácticas.',
    casos_que_atiende: ['Estrés y burnout', 'Mindfulness', 'Bienestar emocional', 'Propósito de vida'],
    precio_sesion: 60,
    plan: 'premium',
    avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=ana',
    especialidades: ['Mindfulness', 'Coaching de bienestar'],
  },
  {
    email: 'carlos.mendoza.demo@girolab.net',
    password: 'GiroLab2024!',
    nombre: 'Carlos',
    apellidos: 'Mendoza',
    pais: 'México',
    bio: 'Consultor de liderazgo y management con experiencia en Fortune 500. Ayudo a líderes y equipos a desarrollar su máximo potencial con metodologías ágiles y coaching ejecutivo.',
    casos_que_atiende: ['Liderazgo', 'Management', 'Productividad', 'Gestión de equipos'],
    precio_sesion: 90,
    plan: 'master',
    avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=carlos',
    especialidades: ['Liderazgo ejecutivo', 'Coaching empresarial'],
  },
  {
    email: 'sofia.herrera.demo@girolab.net',
    password: 'GiroLab2024!',
    nombre: 'Sofía',
    apellidos: 'Herrera',
    pais: 'Argentina',
    bio: 'Psicóloga y coach de desarrollo personal. Especializada en transiciones de vida, inteligencia emocional y construcción de relaciones saludables. Mi enfoque combina psicología positiva y coaching.',
    casos_que_atiende: ['Desarrollo personal', 'Inteligencia emocional', 'Relaciones', 'Ansiedad'],
    precio_sesion: 50,
    plan: 'starter',
    avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=sofia',
    especialidades: ['Psicología positiva', 'Desarrollo personal'],
  },
  {
    email: 'pablo.garcia.demo@girolab.net',
    password: 'GiroLab2024!',
    nombre: 'Pablo',
    apellidos: 'García',
    pais: 'España',
    bio: 'Emprendedor serial y mentor de startups. Fundé 3 empresas y he asesorado a más de 50 startups en fundraising, estrategia y crecimiento. Creo en el aprendizaje desde la práctica.',
    casos_que_atiende: ['Emprendimiento', 'Estrategia de negocio', 'Fundraising', 'Marketing'],
    precio_sesion: 80,
    plan: 'premium',
    avatar_url: 'https://api.dicebear.com/7.x/personas/svg?seed=pablo',
    especialidades: ['Emprendimiento', 'Estrategia empresarial'],
  },
]

const DEMO_POSTS = [
  '¡Hola comunidad Giro Lab! Acabo de completar mi primera sesión de coaching y estoy emocionada con los insights que obtuve. ¿Alguien más ha tenido esa sensación de claridad después de hablar con su Menter? 🌟',
  'Tip de productividad que aprendí esta semana: el método de bloques de tiempo de 90 minutos. Trabajar en ciclos respetando los ritmos naturales del cerebro cambia todo. ¿Lo han probado?',
  'Reflexión del día: el burnout no llega de la noche a la mañana. Son señales pequeñas que ignoramos por meses. Aprender a reconocerlas a tiempo es una habilidad que vale la pena desarrollar. 💪',
  'Compartiendo un libro que mi Menter me recomendó: "Atomic Habits" de James Clear. Llevo solo 3 semanas aplicando sus principios y ya noto cambios reales en mis rutinas. Altamente recomendado.',
  'Pregunta para la comunidad: ¿cómo manejan el síndrome del impostor al asumir un nuevo rol de liderazgo? Me encantaría escuchar sus experiencias y estrategias.',
  'Este mes decidí trabajar en mis límites personales y profesionales. Es increíble cómo decir "no" con confianza puede transformar tus relaciones y tu energía. Gracias a mi Menter por el acompañamiento.',
]

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const createdMenterIds: string[] = []

  for (const menter of DEMO_MENTERS) {
    // Check if already exists
    const existing = await (admin.auth.admin as any).getUserByEmail(menter.email).catch(() => null)
    let userId: string

    if (existing?.data?.user?.id) {
      userId = existing.data.user.id
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email: menter.email,
        password: menter.password,
        email_confirm: true,
        user_metadata: {
          nombre: menter.nombre,
          apellidos: menter.apellidos,
          role: 'menter',
          avatar_url: menter.avatar_url,
          especialidades: menter.especialidades,
        },
      })
      if (error || !data.user) continue
      userId = data.user.id
    }

    createdMenterIds.push(userId)

    // Upsert menter_profile
    await admin.from('menter_profile').upsert({
      menter_id: userId,
      pais: menter.pais,
      bio: menter.bio,
      casos_que_atiende: menter.casos_que_atiende,
      precio_sesion: menter.precio_sesion,
      duracion_sesion: 60,
      anticipacion_minima: 24,
      modalidad: ['videollamada'],
      idiomas: ['Español'],
      formacion: [],
      experiencia_laboral: [],
      enlaces: {},
      declaracion_jurada: true,
    }, { onConflict: 'menter_id' })

    // Upsert membership
    await admin.from('menter_memberships').upsert({
      menter_id: userId,
      plan: menter.plan,
      billing_cycle: 'manual',
      is_active: true,
    }, { onConflict: 'menter_id' })
  }

  // Create demo community posts (rotate through created menters)
  let postCount = 0
  for (let i = 0; i < DEMO_POSTS.length; i++) {
    const userId = createdMenterIds[i % createdMenterIds.length]
    if (!userId) continue
    const { error } = await admin.from('community_posts').insert({
      user_id: userId,
      contenido: DEMO_POSTS[i],
      likes_count: Math.floor(Math.random() * 15),
      comments_count: 0,
    })
    if (!error) postCount++
  }

  return NextResponse.json({
    ok: true,
    message: `${createdMenterIds.length} Menters y ${postCount} posts creados`,
  })
}
