// src/lib/assessments/items/baron.ts
// BarOn ICE — Inventario de Cociente Emocional de BarOn
// 133 ítems · Escala Likert 1-5
// Adaptación latinoamericana (Ugarriza, 2001)
//
// Instrucción general:
// "Lee cada frase e indica con qué frecuencia es verdad para ti.
//  No hay respuestas correctas o incorrectas. Trabaja con rapidez y sin pensar demasiado."

export interface BarOnItem {
  numero:   number
  texto:    string
  inverso?: boolean   // true = puntúa al revés (6 - respuesta)
}

// ── Mapeo de ítems por subescala (para referencia interna del scoring) ───────
// Fuente: BarOn (1997) / Ugarriza (2001) Lima Metropolitana
export const BARON_SUBSCALE_MAP = {
  // Intrapersonal
  CM: [7, 9, 23, 35, 52, 63, 88, 116],                          // Autoconciencia Emocional
  AS: [22, 37, 67, 82, 96, 111, 126, 1],                        // Asertividad
  AC: [11, 24, 40, 56, 70, 85, 100, 114, 129, 6, 21, 36, 51],   // Autoconcepto
  AR: [3, 19, 32, 48, 57, 76, 92, 107, 121, 128, 131],           // Autorrealización
  IN: [14, 28, 43, 59, 74, 87, 103, 131],                        // Independencia
  // Interpersonal
  EM: [18, 44, 55, 61, 72, 98, 119, 124],                        // Empatía
  RS: [16, 30, 46, 61, 72, 76, 90, 98],                          // Responsabilidad Social
  RI: [10, 23, 31, 39, 55, 62, 69, 84, 99, 113],                 // Relaciones Interpersonales
  // Adaptabilidad
  PR: [8, 35, 38, 53, 65, 68, 83, 88, 97, 112],                  // Prueba de Realidad
  FL: [14, 28, 43, 59, 74, 87, 106],                             // Flexibilidad
  SP: [1,  15, 29, 45, 60, 75, 89],                              // Solución de Problemas
  // Manejo del Estrés
  TE: [4, 20, 33, 49, 64, 78, 93, 108],                          // Tolerancia al Estrés
  CI: [13, 27, 42, 58, 73, 86, 102, 117],                        // Control de Impulsos
  // Ánimo General
  FE: [2, 17, 31, 47, 62, 77, 91, 105, 120],                     // Felicidad
  OP: [11, 20, 26, 54, 80, 106, 108, 132],                       // Optimismo
  // Validez — Impresión Positiva
  IP: [14, 28, 41, 51, 66, 90, 106],
} as const

// Ítems que se puntúan de forma inversa (6 − respuesta)
export const BARON_INVERSOS = new Set([
  2, 14, 21, 26, 28, 41, 46, 51, 55, 61, 66, 75, 90, 98,
  100, 101, 104, 106, 108, 110, 114, 119, 125, 132,
])

// Pares para el Índice de Inconsistencia (BarOn, 1997)
export const BARON_PARES_INCONSISTENCIA: [number, number][] = [
  [6,  81], [7,  116], [9,  88],  [11, 85],
  [23, 63], [31, 62],  [33, 64],  [37, 126],
  [39, 69], [51, 95],  [60, 89],  [75, 107],
]

// ── 133 ÍTEMS ────────────────────────────────────────────────────────────────
export const BARON_ITEMS: BarOnItem[] = [
  { numero:   1, texto: 'Cuando enfrento una situación difícil me gusta reunir toda la información que pueda sobre ella.' },
  { numero:   2, texto: 'Me resulta difícil disfrutar de la vida.', inverso: true },
  { numero:   3, texto: 'Prefiero seguir a otros en lugar de tomar mis propias decisiones.', inverso: true },
  { numero:   4, texto: 'Me resulta relativamente fácil expresar mis sentimientos.' },
  { numero:   5, texto: 'Me siento seguro(a) de mí mismo(a) en la mayoría de situaciones.' },
  { numero:   6, texto: 'Mi vida tiene un propósito claro.' },
  { numero:   7, texto: 'Puedo reconocer las emociones de las personas por la expresión de su rostro.' },
  { numero:   8, texto: 'Me resulta difícil no ver las cosas claramente tal como son.', inverso: true },
  { numero:   9, texto: 'Soy consciente de lo que estoy sintiendo.' },
  { numero:  10, texto: 'Me resulta fácil adaptarme a nuevas situaciones.' },
  { numero:  11, texto: 'Me siento bien conmigo mismo(a).' },
  { numero:  12, texto: 'Me detendría y ayudaría a un niño que llora buscando a sus padres.' },
  { numero:  13, texto: 'Cuando me enojo no puedo calmarme.', inverso: true },
  { numero:  14, texto: 'Sé cómo mantenerme tranquilo(a) en situaciones difíciles.' },
  { numero:  15, texto: 'Me gusta ayudar a la gente.' },
  { numero:  16, texto: 'Soy capaz de respetar a los demás.' },
  { numero:  17, texto: 'Soy optimista en lo que respecta a la mayoría de cosas que hago.' },
  { numero:  18, texto: 'Soy capaz de entender cómo se siente la gente.' },
  { numero:  19, texto: 'Si pudiera violar la ley sin que nadie lo supiera, lo haría.', inverso: true },
  { numero:  20, texto: 'Intento no hacer daño a los sentimientos de los demás.' },
  { numero:  21, texto: 'No valoro lo suficiente los logros que he obtenido.', inverso: true },
  { numero:  22, texto: 'Soy capaz de hablar abiertamente sobre mis sentimientos.' },
  { numero:  23, texto: 'Me resulta difícil compartir mis sentimientos más íntimos con los demás.', inverso: true },
  { numero:  24, texto: 'Me gusto a mí mismo(a).' },
  { numero:  25, texto: 'Tengo tendencia a deprimirme.', inverso: true },
  { numero:  26, texto: 'Sé por qué mis emociones cambian.' },
  { numero:  27, texto: 'Soy impulsivo(a).', inverso: true },
  { numero:  28, texto: 'Me resulta difícil cambiar mis ideas.', inverso: true },
  { numero:  29, texto: 'Tengo buenas relaciones interpersonales.' },
  { numero:  30, texto: 'Me importa lo que les sucede a las personas.' },
  { numero:  31, texto: 'Me resulta difícil hacer amigos.', inverso: true },
  { numero:  32, texto: 'Generalmente espero que las cosas resulten bien.' },
  { numero:  33, texto: 'Soy capaz de manejar el estrés sin ponerme demasiado nervioso(a).' },
  { numero:  34, texto: 'Me siento satisfecho(a) con mi capacidad para solucionar problemas.' },
  { numero:  35, texto: 'Soy consciente de cómo me siento en cada momento.' },
  { numero:  36, texto: 'Hay muchas cosas que no me gustan de mí.', inverso: true },
  { numero:  37, texto: 'Soy capaz de expresar mis ideas sin dificultad.' },
  { numero:  38, texto: 'Cuando intento solucionar problemas, analizo todas las posibles soluciones.' },
  { numero:  39, texto: 'Mis relaciones más cercanas significan mucho para mí.' },
  { numero:  40, texto: 'Siento que tengo un buen concepto de mí mismo(a).' },
  { numero:  41, texto: 'Tengo la sensación de que algo no está bien en mi cabeza.', inverso: true },
  { numero:  42, texto: 'Soy impaciente con los demás.', inverso: true },
  { numero:  43, texto: 'Puedo cambiar mis actitudes para ver las cosas de una manera diferente.' },
  { numero:  44, texto: 'Soy bueno(a) para entender los sentimientos de los demás.' },
  { numero:  45, texto: 'Tengo buena capacidad para resolver problemas.' },
  { numero:  46, texto: 'Me resulta difícil tomar decisiones por mí mismo(a).', inverso: true },
  { numero:  47, texto: 'Me siento feliz con el tipo de persona que soy.' },
  { numero:  48, texto: 'Soy capaz de tomar mis propias decisiones sin la influencia de otros.' },
  { numero:  49, texto: 'Me resulta difícil esperar cuando quiero algo ahora.', inverso: true },
  { numero:  50, texto: 'La gente me dice que estoy por debajo de su nivel de comprensión.', inverso: true },
  { numero:  51, texto: 'Prefiero no hablar de mis pensamientos más íntimos.', inverso: true },
  { numero:  52, texto: 'Trato de identificar mis emociones a medida que las experimento.' },
  { numero:  53, texto: 'Creo en mi capacidad para controlar situaciones difíciles.' },
  { numero:  54, texto: 'No tengo días malos.', inverso: true },
  { numero:  55, texto: 'Me resulta difícil establecer límites en mis relaciones.', inverso: true },
  { numero:  56, texto: 'Me es fácil sonreír.' },
  { numero:  57, texto: 'Disfruto de lo que hago.' },
  { numero:  58, texto: 'No puedo manejar bien mi enojo.', inverso: true },
  { numero:  59, texto: 'Me resulta sencillo adaptarme a entornos cambiantes.' },
  { numero:  60, texto: 'Prefiero que otros tomen decisiones por mí.', inverso: true },
  { numero:  61, texto: 'Me resulta difícil entender a las personas que me rodean.', inverso: true },
  { numero:  62, texto: 'Es fácil decirle a la gente cómo me siento.' },
  { numero:  63, texto: 'Las cosas pequeñas me afectan demasiado.', inverso: true },
  { numero:  64, texto: 'Soy capaz de sobrellevar bien la presión.' },
  { numero:  65, texto: 'Sé distinguir lo que es importante de lo que no.' },
  { numero:  66, texto: 'Me resulta relativamente fácil decirle no a alguien.' },
  { numero:  67, texto: 'Intento ser realista y no fantasioso.' },
  { numero:  68, texto: 'Cuando evalúo situaciones, confío en mis propias percepciones.' },
  { numero:  69, texto: 'Encuentro difícil mantener relaciones cercanas con las personas.', inverso: true },
  { numero:  70, texto: 'Tengo una imagen positiva de mí mismo(a).' },
  { numero:  71, texto: 'Nunca he mentido.', inverso: true },
  { numero:  72, texto: 'Soy sensible a las necesidades de los demás.' },
  { numero:  73, texto: 'Me enojo con facilidad.', inverso: true },
  { numero:  74, texto: 'Puedo cambiar mi manera de hacer las cosas cuando veo que no está funcionando.' },
  { numero:  75, texto: 'Cuando enfrento situaciones difíciles, me doy por vencido(a).', inverso: true },
  { numero:  76, texto: 'Sé cuándo la gente está molesta aunque no lo digan.' },
  { numero:  77, texto: 'Me siento motivado(a) para seguir adelante.' },
  { numero:  78, texto: 'Puedo mantener la calma cuando estoy bajo presión.' },
  { numero:  79, texto: 'Tiendo a hablar bien de los demás.' },
  { numero:  80, texto: 'Sé que las cosas saldrán bien.' },
  { numero:  81, texto: 'Soy capaz de definir metas y seguir un plan para alcanzarlas.' },
  { numero:  82, texto: 'Puedo comunicarme abiertamente con los demás.' },
  { numero:  83, texto: 'Cuando alguien me cuenta un problema, trato de ver las cosas desde su perspectiva.' },
  { numero:  84, texto: 'Mis relaciones personales son importantes para mí.' },
  { numero:  85, texto: 'Estoy satisfecho(a) con mi vida.' },
  { numero:  86, texto: 'Puedo posponer la gratificación si la situación lo requiere.' },
  { numero:  87, texto: 'Cuando necesito cambiar de opinión, lo hago sin mayor dificultad.' },
  { numero:  88, texto: 'En general, me resulta difícil entender lo que siento.', inverso: true },
  { numero:  89, texto: 'Tengo tendencia a abandonar las tareas difíciles antes de terminarlas.', inverso: true },
  { numero:  90, texto: 'Me cuesta trabajo decir no.', inverso: true },
  { numero:  91, texto: 'Me siento contento(a) con mi vida.' },
  { numero:  92, texto: 'No dependo de otros para tomar mis propias decisiones.' },
  { numero:  93, texto: 'Puedo tolerar el estrés sin perder el control.' },
  { numero:  94, texto: 'Intento sacar lo mejor de las cosas.' },
  { numero:  95, texto: 'Estoy comprometido(a) con los objetivos que me propongo.' },
  { numero:  96, texto: 'Me resulta difícil defender mis derechos.', inverso: true },
  { numero:  97, texto: 'Sé distinguir mis fortalezas de mis debilidades.' },
  { numero:  98, texto: 'Me resulta difícil comprender los sentimientos de los demás.', inverso: true },
  { numero:  99, texto: 'Disfruto de la compañía de otras personas.' },
  { numero: 100, texto: 'Tengo una mala imagen de mí mismo(a).', inverso: true },
  { numero: 101, texto: 'Tengo problemas para controlar mis emociones.', inverso: true },
  { numero: 102, texto: 'Me resulta difícil controlar mi frustración.', inverso: true },
  { numero: 103, texto: 'Me resulta sencillo pensar por mí mismo(a) sin depender de los demás.' },
  { numero: 104, texto: 'Tengo problemas para tomar decisiones importantes.', inverso: true },
  { numero: 105, texto: 'Me resulta fácil sonreír y mantener un buen ánimo.' },
  { numero: 106, texto: 'No tengo problema en adaptarme a las exigencias de la vida.' },
  { numero: 107, texto: 'Me siento solo(a) aunque esté con gente.', inverso: true },
  { numero: 108, texto: 'Me resulta difícil mantener el equilibrio cuando las cosas cambian.', inverso: true },
  { numero: 109, texto: 'Soy capaz de entender cómo se sienten los demás.' },
  { numero: 110, texto: 'Me resulta difícil comenzar cosas nuevas.', inverso: true },
  { numero: 111, texto: 'Puedo hablar de mis sentimientos sin sentirme avergonzado(a).' },
  { numero: 112, texto: 'Sé bien qué está ocurriendo y por qué.' },
  { numero: 113, texto: 'Disfruto hacer cosas para los demás.' },
  { numero: 114, texto: 'Siento que algo falta en mi vida.', inverso: true },
  { numero: 115, texto: 'Me cuesta trabajo imaginarme el futuro de manera positiva.', inverso: true },
  { numero: 116, texto: 'Tengo conciencia clara de mis propias emociones.' },
  { numero: 117, texto: 'Me resulta difícil controlar mis impulsos.', inverso: true },
  { numero: 118, texto: 'Me siento seguro(a) de lo que hago.' },
  { numero: 119, texto: 'Sé cómo me siento, pero no siempre sé por qué.', inverso: true },
  { numero: 120, texto: 'No me es difícil sonreír.' },
  { numero: 121, texto: 'Tomo mis propias decisiones.' },
  { numero: 122, texto: 'Realmente no sé para qué soy bueno(a).', inverso: true },
  { numero: 123, texto: 'No soy muy bueno(a) dando respuesta a los problemas.', inverso: true },
  { numero: 124, texto: 'Intento comprender el punto de vista de los demás antes de sacar conclusiones.' },
  { numero: 125, texto: 'No me gusta hablar de lo que siento.', inverso: true },
  { numero: 126, texto: 'Puedo expresar mis ideas claramente.' },
  { numero: 127, texto: 'Si me enojo con alguien, lo puedo decir sin perder el control.' },
  { numero: 128, texto: 'Hago planes para el futuro porque creo que tengo buenas posibilidades de lograrlo.' },
  { numero: 129, texto: 'Generalmente confío en mí mismo(a).' },
  { numero: 130, texto: 'Estoy satisfecho(a) con lo que he logrado en mi vida.' },
  { numero: 131, texto: 'Pienso bien sobre lo que quiero antes de actuar.' },
  { numero: 132, texto: 'Me resulta difícil ver el lado positivo de las cosas.', inverso: true },
  { numero: 133, texto: 'No tengo una buena idea sobre lo que quiero en la vida.', inverso: true },
]
