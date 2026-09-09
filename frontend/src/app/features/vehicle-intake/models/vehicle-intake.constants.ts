export const VEHICLE_TYPES = ['Automóvil', 'Motocicleta', 'Camioneta', 'Camión', 'SUV'] as const;

export const VEHICLE_BRANDS = [
  'Chevrolet',
  'Ford',
  'Honda',
  'Kia',
  'Mazda',
  'Renault',
  'Toyota',
  'Yamaha',
  'Otra'
] as const;

export const VISIT_REASONS = [
  'Mantenimiento preventivo',
  'Revisión general',
  'Diagnóstico de falla',
  'Reparación correctiva',
  'Inspección pre-compra',
  'Otro'
] as const;

export const MAX_EVIDENCE_IMAGES = 5;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
