export interface Emotion {
  name: string
  cat: string
  desc: string
  nivel: number
}

export const CAT_COLORS: Record<string, string> = {
  felicidad: '#006bd4',
  amor: '#ffb9d2',
  emociones_esteticas: '#ffe11e',
  alegria: '#ffcf1c',
  emociones_sociales_y_morales: '#7b009c',
  actitudes: '#15bb00',
  ira: '#ad3f00',
  sorpresa: '#74e600',
  tristeza: '#00995e',
  asco: '#c5ff5a',
  miedo: '#3a7a5e',
  ansiedad: '#0012a2',
}

export const CAT_NAMES: Record<string, string> = {
  felicidad: 'Felicidad',
  amor: 'Amor',
  alegria: 'Alegría',
  emociones_sociales_y_morales: 'Emociones Sociales & Morales',
  actitudes: 'Actitudes',
  sorpresa: 'Sorpresa',
  tristeza: 'Tristeza',
  miedo: 'Miedo',
  asco: 'Asco',
  ira: 'Ira',
  ansiedad: 'Ansiedad',
  emociones_esteticas: 'Emociones Estéticas',
}

export const CAT_GROUPS = [
  'felicidad','amor','alegria','emociones_sociales_y_morales',
  'actitudes','sorpresa','tristeza','miedo','asco','ira','ansiedad','emociones_esteticas'
]

export const NIVEL_NAMES = ['', 'Emoción Principal', 'Familia Emocional', 'Matiz', 'Subtono', 'Esencia']
