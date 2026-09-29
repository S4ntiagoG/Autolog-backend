export type VehicleStatus = 'LISTO' | 'EN PROGRESO' | 'PENDIENTE';

export interface MechanicVehicleItem {
  id: number;
  serviceOrderId: number | null;
  plate: string;
  brand: string;
  model: string;
  vehicleYear: number;
  color?: string;
  ownerName: string;
  lastServiceDate: string; // Formato DD/MM/YYYY o '-- / -- / ----'
  status: VehicleStatus;
}

