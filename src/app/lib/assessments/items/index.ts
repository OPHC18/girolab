// src/lib/assessments/items/index.ts
// Ítems clínicos en español para los 11 instrumentos
// BDI-II (21) · BAI (21) · MDQ (15) · ASRS (18) · Big Five (44)
// NPI-40 (40) · MSI-BPD (10) · Dark Triad (12) · PID-5 (25)
// DISC (24 grupos) · HEXACO-HH (24) = 254 ítems totales

import type { InstrumentId } from '../instruments';

export interface Item {
  numero: number;
  texto: string;
  instruccion?: string; // instrucción especial para ese ítem (ej: MDQ Parte B)
}

export const ITEMS: Partial<Record<InstrumentId | 'MDQ' | 'ASRS_v1_1', Item[]>> = {

  // ──────────────────────────────────────────────────────────
  // 1. BDI-II – Inventario de Depresión de Beck II
  // Instrucción general: "Elige la afirmación que mejor describe
  // cómo te has sentido durante las últimas dos semanas,
  // incluyendo hoy. Cada grupo tiene 4 opciones (0-3)."
  // ──────────────────────────────────────────────────────────
  BDI_II: [
    {
      numero: 1,
      texto: 'Tristeza',
      instruccion: '0 = No me siento triste · 1 = Me siento triste gran parte del tiempo · 2 = Me siento triste continuamente · 3 = Me siento tan triste o tan desgraciado/a que no puedo soportarlo',
    },
    {
      numero: 2,
      texto: 'Pesimismo',
      instruccion: '0 = No estoy desanimado/a sobre mi futuro · 1 = Me siento más desanimado/a que antes · 2 = No espero que las cosas mejoren · 3 = Siento que mi futuro es desesperanzador',
    },
    {
      numero: 3,
      texto: 'Fracasos en el pasado',
      instruccion: '0 = No me siento fracasado/a · 1 = He fracasado más de lo que debería · 2 = Cuando miro atrás veo muchos fracasos · 3 = Siento que soy un fracaso total',
    },
    {
      numero: 4,
      texto: 'Pérdida de placer',
      instruccion: '0 = Obtengo tanto placer de las cosas como siempre · 1 = No disfruto de las cosas tanto como antes · 2 = Obtengo muy poco placer de las cosas · 3 = No puedo obtener ningún placer de las cosas',
    },
    {
      numero: 5,
      texto: 'Sentimientos de culpa',
      instruccion: '0 = No me siento culpable · 1 = Me siento culpable de muchas cosas que hice · 2 = Me siento bastante culpable la mayor parte del tiempo · 3 = Me siento culpable constantemente',
    },
    {
      numero: 6,
      texto: 'Sentimientos de castigo',
      instruccion: '0 = No siento que estoy siendo castigado/a · 1 = Siento que puedo ser castigado/a · 2 = Espero ser castigado/a · 3 = Siento que estoy siendo castigado/a',
    },
    {
      numero: 7,
      texto: 'Autodesprecio',
      instruccion: '0 = Tengo la misma opinión de mí que antes · 1 = He perdido confianza en mí mismo/a · 2 = Estoy decepcionado/a de mí mismo/a · 3 = Me desagrado',
    },
    {
      numero: 8,
      texto: 'Autocrítica',
      instruccion: '0 = No me critico ni me culpo más que antes · 1 = Me critico más que antes · 2 = Me critico por todas mis faltas · 3 = Me culpo de todo lo malo que pasa',
    },
    {
      numero: 9,
      texto: 'Pensamientos o deseos suicidas',
      instruccion: '0 = No tengo ningún pensamiento de suicidarme · 1 = Tengo pensamientos de suicidarme, pero no los llevaría a cabo · 2 = Me gustaría suicidarme · 3 = Me suicidaría si pudiera',
    },
    {
      numero: 10,
      texto: 'Llanto',
      instruccion: '0 = No lloro más que antes · 1 = Lloro más que antes · 2 = Lloro por cualquier cosa · 3 = Tengo ganas de llorar pero no puedo',
    },
    {
      numero: 11,
      texto: 'Agitación',
      instruccion: '0 = No estoy más agitado/a que de costumbre · 1 = Me siento más agitado/a que de costumbre · 2 = Estoy tan agitado/a que me cuesta estar quieto/a · 3 = Estoy tan agitado/a que tengo que moverme continuamente',
    },
    {
      numero: 12,
      texto: 'Pérdida de interés',
      instruccion: '0 = No he perdido el interés en los demás · 1 = Estoy menos interesado/a en los demás que antes · 2 = He perdido la mayor parte del interés en los demás · 3 = Me resulta difícil interesarme en algo',
    },
    {
      numero: 13,
      texto: 'Indecisión',
      instruccion: '0 = Tomo decisiones tan bien como siempre · 1 = Me resulta más difícil tomar decisiones que antes · 2 = Tengo mucha más dificultad en tomar decisiones que antes · 3 = Tengo problemas para tomar cualquier decisión',
    },
    {
      numero: 14,
      texto: 'Inutilidad',
      instruccion: '0 = No me siento inútil · 1 = No me considero tan valioso/a y útil como solía ser · 2 = Me siento inútil en comparación con otras personas · 3 = Me siento completamente inútil',
    },
    {
      numero: 15,
      texto: 'Pérdida de energía',
      instruccion: '0 = Tengo tanta energía como siempre · 1 = Tengo menos energía que antes · 2 = No tengo suficiente energía para hacer muchas cosas · 3 = No tengo suficiente energía para hacer nada',
    },
    {
      numero: 16,
      texto: 'Cambios en el sueño',
      instruccion: '0 = No he notado ningún cambio en mi sueño · 1 = Duermo un poco más/menos que antes · 2 = Duermo bastante más/menos que antes · 3 = Duermo la mayor parte del día / me despierto 1-2 horas antes y no puedo volver a dormir',
    },
    {
      numero: 17,
      texto: 'Irritabilidad',
      instruccion: '0 = No estoy más irritable que antes · 1 = Estoy más irritable que de costumbre · 2 = Estoy mucho más irritable que antes · 3 = Estoy irritable constantemente',
    },
    {
      numero: 18,
      texto: 'Cambios en el apetito',
      instruccion: '0 = No he notado ningún cambio en mi apetito · 1 = Mi apetito es un poco menor/mayor que antes · 2 = Mi apetito es bastante menor/mayor que antes · 3 = No tengo nada de apetito / tengo ganas de comer constantemente',
    },
    {
      numero: 19,
      texto: 'Dificultad de concentración',
      instruccion: '0 = Puedo concentrarme tan bien como siempre · 1 = No puedo concentrarme tan bien como siempre · 2 = Me resulta difícil mantener la concentración en algo durante mucho tiempo · 3 = No puedo concentrarme en nada',
    },
    {
      numero: 20,
      texto: 'Cansancio',
      instruccion: '0 = No estoy más cansado/a que de costumbre · 1 = Me canso más fácilmente que antes · 2 = Me canso al hacer cualquier cosa · 3 = Estoy demasiado cansado/a para hacer cualquier cosa',
    },
    {
      numero: 21,
      texto: 'Pérdida de interés en el sexo',
      instruccion: '0 = No he notado ningún cambio en mi interés sexual · 1 = Estoy menos interesado/a en el sexo que antes · 2 = Estoy mucho menos interesado/a en el sexo · 3 = He perdido completamente el interés en el sexo',
    },
  ],

  // ──────────────────────────────────────────────────────────
  // 2. BAI – Inventario de Ansiedad de Beck
  // Instrucción: "Indica en qué medida has sido molestado/a
  // por cada síntoma durante la última semana."
  // ──────────────────────────────────────────────────────────
  BAI: [
    { numero:  1, texto: 'Entumecimiento u hormigueo en el cuerpo' },
    { numero:  2, texto: 'Sensación de calor' },
    { numero:  3, texto: 'Temblor en las piernas' },
    { numero:  4, texto: 'Incapacidad para relajarme' },
    { numero:  5, texto: 'Miedo a que ocurra lo peor' },
    { numero:  6, texto: 'Mareo o sensación de que me voy a desmayar' },
    { numero:  7, texto: 'Latidos del corazón acelerados o a golpes' },
    { numero:  8, texto: 'Inestable e inseguro/a' },
    { numero:  9, texto: 'Aterrorizado/a o asustado/a' },
    { numero: 10, texto: 'Nerviosismo' },
    { numero: 11, texto: 'Sensación de ahogo' },
    { numero: 12, texto: 'Manos temblorosas' },
    { numero: 13, texto: 'Cuerpo tembloroso' },
    { numero: 14, texto: 'Miedo a perder el control' },
    { numero: 15, texto: 'Dificultad para respirar' },
    { numero: 16, texto: 'Miedo a morirme' },
    { numero: 17, texto: 'Estar asustado/a' },
    { numero: 18, texto: 'Indigestión o malestar en el estómago' },
    { numero: 19, texto: 'Desmayarme o sensación de que me voy a desmayar' },
    { numero: 20, texto: 'Cara enrojecida' },
    { numero: 21, texto: 'Sudoración (no relacionada con el calor)' },
  ],

  // ──────────────────────────────────────────────────────────
  // 3. MDQ – Cuestionario de Trastornos del Estado de Ánimo
  // ──────────────────────────────────────────────────────────
  MDQ: [
    { numero:  1, texto: '¿Ha habido algún período de tiempo en que no era su yo habitual y se sentía tan bien o tan eufórico/a que otras personas pensaban que no era su comportamiento habitual o estaba tan eufórico/a que le ocasionó problemas?' },
    { numero:  2, texto: '¿Ha habido algún período en que se sentía tan irritable que llegó a gritar, discutir o pelear con personas ajenas a su familia? ¿Estaba tan irritable que llegó a golpear o arrojar objetos a personas?' },
    { numero:  3, texto: '¿Se sentía mucho más seguro/a de sí mismo/a de lo habitual?' },
    { numero:  4, texto: '¿Dormía mucho menos de lo usual y sentía que no le hacía falta dormir más?' },
    { numero:  5, texto: '¿Era mucho más locuaz o hablaba más rápido de lo usual?' },
    { numero:  6, texto: '¿Los pensamientos le pasaban por la cabeza tan rápido que no podía seguirles la pista?' },
    { numero:  7, texto: '¿Se distraía tan fácilmente que tenía problemas para concentrarse o mantenerse enfocado/a en lo que estaba haciendo?' },
    { numero:  8, texto: '¿Tenía mucha más energía que lo usual?' },
    { numero:  9, texto: '¿Estaba mucho más activo/a o hacía muchas más cosas de lo usual?' },
    { numero: 10, texto: '¿Era mucho más sociable o extrovertido/a de lo usual, por ejemplo, llamaba a amigos en plena noche?' },
    { numero: 11, texto: '¿Estaba mucho más interesado/a en el sexo de lo usual?' },
    { numero: 12, texto: '¿Hacía cosas fuera de lo usual o que otras personas pensaban que eran imprudentes, arriesgadas o que podrían causarle problemas?' },
    { numero: 13, texto: '¿Gastar dinero le ocasionó problemas o le causó dificultades a usted o a su familia?' },
    { numero: 14, texto: 'Si marcó SÍ a más de una de las preguntas anteriores: ¿Alguna vez varias de estas cosas sucedieron al mismo tiempo?', instruccion: 'Parte B – Simultaneidad' },
    { numero: 15, texto: '¿Cuánto problema le causaron estas situaciones? (0 = Sin problema · 1 = Problema menor · 2 = Problema moderado · 3 = Problema grave)', instruccion: 'Parte C – Nivel de deterioro' },
  ],

  // ──────────────────────────────────────────────────────────
  // 4. ASRS v1.1 – Escala de Autoevaluación para TDAH
  // Instrucción: "Marca la frecuencia con que has experimentado
  // cada síntoma durante los últimos 6 meses."
  // ──────────────────────────────────────────────────────────
  ASRS_v1_1: [
    { numero:  1, texto: '¿Con qué frecuencia tienes dificultades para concluir los detalles finales de un proyecto una vez que la parte desafiante ya fue terminada?' },
    { numero:  2, texto: '¿Con qué frecuencia tienes dificultades para poner las cosas en orden cuando tienes que hacer una tarea que requiere organización?' },
    { numero:  3, texto: '¿Con qué frecuencia tienes dificultades para recordar citas o compromisos?' },
    { numero:  4, texto: '¿Con qué frecuencia evitas o demoras el inicio de un proyecto que requiere mucha concentración?' },
    { numero:  5, texto: '¿Con qué frecuencia mueves o retuerces las manos o los pies cuando tienes que estar sentado/a por un largo período de tiempo?' },
    { numero:  6, texto: '¿Con qué frecuencia te sientes excesivamente activo/a o compulsado/a a hacer cosas, como si te impulsara un motor?' },
    { numero:  7, texto: '¿Con qué frecuencia cometes errores por descuido cuando tienes que trabajar en un proyecto aburrido o difícil?' },
    { numero:  8, texto: '¿Con qué frecuencia tienes dificultades para mantener la atención cuando realizas trabajo tedioso o repetitivo?' },
    { numero:  9, texto: '¿Con qué frecuencia tienes dificultades para concentrarte en lo que te dicen aunque te hablen directamente?' },
    { numero: 10, texto: '¿Con qué frecuencia extravías o tienes dificultades para encontrar cosas en tu casa o en tu trabajo?' },
    { numero: 11, texto: '¿Con qué frecuencia te distraes con la actividad o el ruido a tu alrededor?' },
    { numero: 12, texto: '¿Con qué frecuencia te vas de tu asiento en reuniones u otras situaciones en las que deberías permanecer sentado/a?' },
    { numero: 13, texto: '¿Con qué frecuencia te sientes inquieto/a o intranquilo/a?' },
    { numero: 14, texto: '¿Con qué frecuencia tienes dificultades para descansar o relajarte cuando tienes tiempo libre?' },
    { numero: 15, texto: '¿Con qué frecuencia te encuentras hablando demasiado cuando estás en situaciones sociales?' },
    { numero: 16, texto: '¿Con qué frecuencia, cuando estás en una conversación, terminas las frases de las personas antes de que ellas lo hagan?' },
    { numero: 17, texto: '¿Con qué frecuencia tienes dificultades para esperar tu turno en situaciones donde el turno es necesario?' },
    { numero: 18, texto: '¿Con qué frecuencia interrumpes a los demás cuando están ocupados?' },
  ],

  // ──────────────────────────────────────────────────────────
  // 5. BIG FIVE – BFI-44 (Inventario de los Cinco Grandes)
  // Instrucción: "Me veo como alguien que..."
  // ──────────────────────────────────────────────────────────
  BIG_FIVE: [
    { numero:  1, texto: 'Es hablador/a' },
    { numero:  2, texto: 'Tiende a encontrar defectos en los demás' },
    { numero:  3, texto: 'Hace un trabajo completo' },
    { numero:  4, texto: 'Está deprimido/a, triste' },
    { numero:  5, texto: 'Es original/a, se le ocurren nuevas ideas' },
    { numero:  6, texto: 'Es reservado/a' },
    { numero:  7, texto: 'Es servicial y no egoísta con los demás' },
    { numero:  8, texto: 'Puede ser algo descuidado/a' },
    { numero:  9, texto: 'Es relajado/a, maneja bien el estrés' },
    { numero: 10, texto: 'Es curioso/a por muchas cosas diferentes' },
    { numero: 11, texto: 'Está lleno/a de energía' },
    { numero: 12, texto: 'Inicia conflictos con los demás' },
    { numero: 13, texto: 'Es un trabajador de confianza' },
    { numero: 14, texto: 'Puede estar tenso/a' },
    { numero: 15, texto: 'Es un pensador/a brillante y profundo/a' },
    { numero: 16, texto: 'Genera mucho entusiasmo' },
    { numero: 17, texto: 'Tiene una naturaleza perdonadora' },
    { numero: 18, texto: 'Tiende a ser desorganizado/a' },
    { numero: 19, texto: 'Se preocupa mucho' },
    { numero: 20, texto: 'Tiene una imaginación activa' },
    { numero: 21, texto: 'Tiende a ser callado/a' },
    { numero: 22, texto: 'Generalmente confía en los demás' },
    { numero: 23, texto: 'Tiende a ser perezoso/a' },
    { numero: 24, texto: 'Es emocionalmente estable, no se altera fácilmente' },
    { numero: 25, texto: 'Es ingenioso/a, un pensador/a profundo/a' },
    { numero: 26, texto: 'Tiene una personalidad asertiva' },
    { numero: 27, texto: 'Puede ser frío/a y distante' },
    { numero: 28, texto: 'Persevera hasta terminar las tareas' },
    { numero: 29, texto: 'Puede ser temperamental' },
    { numero: 30, texto: 'Valora la experiencia artística y estética' },
    { numero: 31, texto: 'Es tímido/a e inhibido/a' },
    { numero: 32, texto: 'Es considerado/a y amable con casi todo el mundo' },
    { numero: 33, texto: 'Hace las cosas con eficiencia' },
    { numero: 34, texto: 'Permanece calmado/a en situaciones tensas' },
    { numero: 35, texto: 'Prefiere el trabajo de rutina' },
    { numero: 36, texto: 'Es extrovertido/a, sociable' },
    { numero: 37, texto: 'A veces es grosero/a con los demás' },
    { numero: 38, texto: 'Hace planes y los lleva a cabo' },
    { numero: 39, texto: 'Se pone nervioso/a fácilmente' },
    { numero: 40, texto: 'Le gusta reflexionar y jugar con las ideas' },
    { numero: 41, texto: 'Tiene pocos intereses artísticos' },
    { numero: 42, texto: 'Le gusta cooperar con los demás' },
    { numero: 43, texto: 'Se distrae fácilmente' },
    { numero: 44, texto: 'Es sofisticado/a en arte, música o literatura' },
  ],

  // ──────────────────────────────────────────────────────────
  // 6. NPI-40 – Inventario de Personalidad Narcisista
  // Instrucción: "Para cada par, elige la afirmación que mejor
  // te describe, aunque ninguna sea perfectamente exacta."
  // Formato especial: par A / B — el scoring usa parseNPIResponses()
  // ──────────────────────────────────────────────────────────
  NPI_40: [
    { numero:  1, texto: 'A: Tengo un talento natural para influir en las personas.\nB: No soy muy bueno/a para influir en las personas.' },
    { numero:  2, texto: 'A: La modestia no me sienta bien.\nB: Soy esencialmente una persona modesta.' },
    { numero:  3, texto: 'A: Haría casi cualquier cosa con tal de apostar.\nB: Tiendo a ser prudente.' },
    { numero:  4, texto: 'A: Cuando la gente me halaga, a veces me siento incómodo/a.\nB: Sé que soy bueno/a porque todo el mundo me lo dice.' },
    { numero:  5, texto: 'A: El pensamiento de gobernar el mundo me asusta un poco.\nB: Si gobernara el mundo, sería un lugar mucho mejor.' },
    { numero:  6, texto: 'A: Generalmente puedo hablar a los demás para que hagan lo que quiero.\nB: Soy difícil para hablar a las personas para que hagan lo que quiero.' },
    { numero:  7, texto: 'A: Prefiero ser líder.\nB: Me da lo mismo ser líder o no serlo.' },
    { numero:  8, texto: 'A: Seré un/a gran persona.\nB: Espero ser exitoso/a.' },
    { numero:  9, texto: 'A: No soy mejor ni peor que la mayoría de la gente.\nB: Creo que soy una persona especial.' },
    { numero: 10, texto: 'A: No estoy seguro/a de que saldría bien en una situación de emergencia.\nB: Me veo bien actuando bajo presión.' },
    { numero: 11, texto: 'A: Me gusta tener autoridad sobre otras personas.\nB: No me gusta tener autoridad sobre otras personas.' },
    { numero: 12, texto: 'A: No me gusta exhibirme.\nB: Me gusta mirarme en el espejo.' },
    { numero: 13, texto: 'A: Me molesta cuando la gente no me hace caso ni me presta atención.\nB: No me importa cuando la gente no me hace caso.' },
    { numero: 14, texto: 'A: Soy más capaz que otras personas.\nB: Hay mucho que puedo aprender de los demás.' },
    { numero: 15, texto: 'A: Soy mucho como los demás.\nB: Soy una persona extraordinaria.' },
    { numero: 16, texto: 'A: Me gusta asumir responsabilidades.\nB: Prefiero seguir que liderar.' },
    { numero: 17, texto: 'A: Me gusta la influencia que tengo sobre las personas.\nB: No me gusta intentar influir en la conducta de los demás.' },
    { numero: 18, texto: 'A: Puedo hacer casi cualquier cosa que me proponga.\nB: A veces me siento impotente ante las circunstancias.' },
    { numero: 19, texto: 'A: Me avergüenza un poco cuando me hago el/la centro de atención.\nB: Me gusta ser el/la centro de atención.' },
    { numero: 20, texto: 'A: Me gustaría ser como yo mismo/a.\nB: No hay nadie exactamente como yo.' },
    { numero: 21, texto: 'A: Haré lo que sea para conseguir lo que quiero.\nB: Generalmente puedo esperar lo que quiero.' },
    { numero: 22, texto: 'A: Siempre sé lo que hago.\nB: A veces no tengo muy claro qué hago.' },
    { numero: 23, texto: 'A: Confío en mi propia toma de decisiones.\nB: A veces confío en otros para que tomen las decisiones por mí.' },
    { numero: 24, texto: 'A: No me importa tanto aparecer en pantalla.\nB: Me gusta mirar mis propias actuaciones en vídeo.' },
    { numero: 25, texto: 'A: Siempre quiero saber quién está al mando.\nB: No me importa quién está al mando.' },
    { numero: 26, texto: 'A: Me gusta exhibir mi cuerpo.\nB: Soy poco aficionado a mostrar mi cuerpo.' },
    { numero: 27, texto: 'A: Puedo leer a la gente como un libro.\nB: La gente es a veces difícil de entender.' },
    { numero: 28, texto: 'A: Realmente me gusta ser el/la centro de atención.\nB: Es que no me gusta cuando soy el/la centro de atención.' },
    { numero: 29, texto: 'A: Me sentiría incómodo/a si alguien elogiara mis logros.\nB: Me gusta que me elogien.' },
    { numero: 30, texto: 'A: Claramente soy mejor que los demás.\nB: No soy mejor ni peor que la mayoría.' },
    { numero: 31, texto: 'A: Me gusta ser la autoridad.\nB: No me importa seguir la corriente.' },
    { numero: 32, texto: 'A: Me resulta muy difícil hablar de mí mismo/a con otros.\nB: Me gusta hablar de mí mismo/a con otros.' },
    { numero: 33, texto: 'A: Intento asegurarme de que las personas me prestan atención.\nB: Me incomoda ser el/la centro de atención.' },
    { numero: 34, texto: 'A: Mi cuerpo no es nada especial.\nB: Me gusta lucir mi cuerpo.' },
    { numero: 35, texto: 'A: Soy bueno/a tomando mis propias decisiones.\nB: Generalmente me aconsejo con otros.' },
    { numero: 36, texto: 'A: Prefiero mezclarse entre la multitud.\nB: Me gusta ser el/la líder.' },
    { numero: 37, texto: 'A: Me gusta tener control sobre los demás.\nB: No me importa dejar a otros tomar el control.' },
    { numero: 38, texto: 'A: No soy muy bueno/a para influir en las personas.\nB: Soy un/a experto/a en influir a las personas.' },
    { numero: 39, texto: 'A: Me gusta hacerme cargo de las situaciones.\nB: Prefiero que otro se haga cargo.' },
    { numero: 40, texto: 'A: Soy una persona asombrosa.\nB: Soy básicamente igual a la mayoría de las personas.' },
  ],

  // ──────────────────────────────────────────────────────────
  // 7. MSI-BPD – McLean Screening para Trastorno Límite
  // Instrucción: "Responde Sí o No a cada pregunta."
  // ──────────────────────────────────────────────────────────
  MSI_BPD: [
    { numero:  1, texto: '¿Alguna vez has tenido experiencias de sentirte fuera de tu cuerpo, como si te observaras desde afuera, o de sentir que las personas y los objetos a tu alrededor no son reales?' },
    { numero:  2, texto: '¿Con frecuencia te sientes seguro/a de tus emociones y de quién eres en realidad?' },
    { numero:  3, texto: '¿Alguna vez te has lastimado a propósito, por ejemplo, cortándote o quemándote?' },
    { numero:  4, texto: '¿Has amenazado con suicidarte o has intentado suicidarte?' },
    { numero:  5, texto: '¿Alguna vez has hecho cosas impulsivas que te han causado problemas, como gastar en exceso, tener relaciones sexuales sin protección, consumir drogas, conducir de manera imprudente o atracones de comida?' },
    { numero:  6, texto: '¿Tu estado de ánimo cambia con mucha frecuencia, como sentirte bien y luego muy mal, en cuestión de horas o días?' },
    { numero:  7, texto: '¿Con frecuencia te sientes muy enojado/a, incluso con pequeñas cosas, o perdes el control sobre tu ira?' },
    { numero:  8, texto: '¿Con frecuencia te ha preocupado que la gente te abandone o te deje solo/a?' },
    { numero:  9, texto: '¿Con frecuencia sientes un vacío en tu interior, como si no hubiera nada ahí?' },
    { numero: 10, texto: '¿Has tenido relaciones inestables e intensas, alternando entre sentir que la otra persona es perfecta y luego odiarla?' },
  ],

  // ──────────────────────────────────────────────────────────
  // 8. DARK TRIAD – Dirty Dozen (12 ítems)
  // Instrucción: "Indica tu grado de acuerdo con cada afirmación."
  // ──────────────────────────────────────────────────────────
  DARK_TRIAD: [
    { numero:  1, texto: 'Tiendo a querer que otros me admiren.' },
    { numero:  2, texto: 'Tiendo a querer que otros me presten atención.' },
    { numero:  3, texto: 'Me parece natural ser el/la líder.' },
    { numero:  4, texto: 'Soy una persona especial.' },
    { numero:  5, texto: 'No me importa manipular a personas para conseguir lo que quiero.' },
    { numero:  6, texto: 'He usado el engaño o las mentiras para salirme con la mía.' },
    { numero:  7, texto: 'He usado la adulación para conseguir lo que quiero.' },
    { numero:  8, texto: 'Exploto a las personas en mi beneficio.' },
    { numero:  9, texto: 'Me vengo de las personas que me hacen daño.' },
    { numero: 10, texto: 'Busco que me digan que hice algo mal para poder desquitarme.' },
    { numero: 11, texto: 'No me arrepiento de haber lastimado a alguien para conseguir lo que quería.' },
    { numero: 12, texto: 'Las personas generalmente son blandas y fáciles de manipular.' },
  ],

  // ──────────────────────────────────────────────────────────
  // 9. PID-5-BF – Inventario de Personalidad DSM-5 (25 ítems)
  // Instrucción: "¿Hasta qué punto cada una de las siguientes
  // afirmaciones te describe?"
  // ──────────────────────────────────────────────────────────
  PID_5: [
    { numero:  1, texto: 'Cometo errores por no prestar atención o por ser descuidado/a.' },
    { numero:  2, texto: 'Actúo de forma impulsiva sin pensar en las consecuencias.' },
    { numero:  3, texto: 'Me distraigo fácilmente con cosas sin importancia.' },
    { numero:  4, texto: 'Busco experiencias emocionantes o peligrosas.' },
    { numero:  5, texto: 'Quiero que todo sea perfecto, incluso si eso significa no terminar las cosas a tiempo.' },
    { numero:  6, texto: 'No me acerco a los demás aunque quisiera hacerlo.' },
    { numero:  7, texto: 'Me siento separado/a de la realidad, como si estuviera mirando mi vida desde afuera.' },
    { numero:  8, texto: 'Mis emociones cambian rápidamente y soy incapaz de controlarlas.' },
    { numero:  9, texto: 'Me preocupo por muchas cosas diferentes.' },
    { numero: 10, texto: 'Me angustio mucho cuando pienso en separarme de alguien importante para mí.' },
    { numero: 11, texto: 'Me resulta difícil resistirme a los deseos de otras personas.' },
    { numero: 12, texto: 'Me enojo fácilmente, incluso por cosas sin importancia.' },
    { numero: 13, texto: 'Prefiero estar solo/a que acompañado/a.' },
    { numero: 14, texto: 'Evito las relaciones íntimas con las personas.' },
    { numero: 15, texto: 'Pocas cosas me hacen sentir bien.' },
    { numero: 16, texto: 'No muestro mis emociones aunque las sienta.' },
    { numero: 17, texto: 'Me resulta difícil confiar en los demás.' },
    { numero: 18, texto: 'Uso a las personas para conseguir lo que quiero.' },
    { numero: 19, texto: 'Miento o engaño para obtener lo que necesito.' },
    { numero: 20, texto: 'Pienso que soy superior a los demás.' },
    { numero: 21, texto: 'Busco llamar la atención de los demás.' },
    { numero: 22, texto: 'Me importa poco cómo se sienten los demás.' },
    { numero: 23, texto: 'Creo que tengo poderes especiales que otros no tienen.' },
    { numero: 24, texto: 'Me comporto de formas que otras personas consideran raras o extrañas.' },
    { numero: 25, texto: 'Mis pensamientos a veces parecen ir tan rápido que no puedo controlarlos.' },
  ],
};

// ──────────────────────────────────────────────────────────────
// INSTRUCCIONES GENERALES POR INSTRUMENTO
// Usadas en la pantalla de intro del TestLandingPage
// ──────────────────────────────────────────────────────────────
export const INSTRUMENT_INSTRUCTIONS: Partial<Record<string, string>> = {
  BDI_II:     'Para cada pregunta, elige la opción que mejor describe cómo te has sentido durante las últimas dos semanas, incluyendo hoy. No hay respuestas correctas o incorrectas.',
  BAI:        'A continuación se lista una serie de síntomas comunes de la ansiedad. Lee cada uno con atención e indica en qué medida te ha molestado durante la última semana.',
  MDQ:        'Piensa en cómo eres la mayor parte del tiempo. Las preguntas A-M preguntan sobre cómo eres en general, no en períodos de estrés.',
  ASRS_v1_1:  'Por favor responde las preguntas sobre cómo te has sentido y te has comportado en los últimos 6 meses.',
  BIG_FIVE:   'Aquí hay una serie de características que pueden o no aplicarse a ti. Por favor, indica en qué medida estás de acuerdo o en desacuerdo con cada afirmación.',
  NPI_40:     'Para cada par de afirmaciones, elige la que mejor te describe. No hay respuestas correctas ni incorrectas — solo trata de ser honesto/a contigo mismo/a.',
  MSI_BPD:    'Por favor responde Sí o No a cada pregunta basándote en cómo te has sentido y comportado la mayor parte de tu vida.',
  DARK_TRIAD: 'Indica en qué medida estás de acuerdo con cada afirmación. Responde con honestidad — no hay respuestas buenas ni malas.',
  PID_5:      'A continuación encontrarás una serie de afirmaciones. Lee cada una y decide en qué medida te describe.',
  DISC:       'En cada grupo encontrarás 4 palabras. Selecciona la que MÁS te describe y la que MENOS te describe. Responde de forma espontánea — no hay respuestas correctas.',
  HEXACO_HH:  'Indica tu grado de acuerdo con cada afirmación. Responde con la mayor honestidad posible — tus respuestas son completamente confidenciales.',
};