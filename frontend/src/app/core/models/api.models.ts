export interface ClientRequest {
  name: string;
  identificationNumber: string;
  email: string;
  phone: string;
}

export interface ClientResponse extends ClientRequest {
  id: number;
}

export interface VehicleRequest {
  vehicleType: string;
  brand: string;
  model: string;
  plate: string;
  chassisNumber: string;
  vehicleYear: number;
  client: { id: number };
}

export interface VehicleResponse extends Omit<VehicleRequest, 'client'> {
  id: number;
  client: ClientResponse;
}

export interface VehicleLookupRequest {
  plate: string;
  identificationNumber: string;
}

export interface ClientVehicleHomeResponse {
  vehicleId: number;
  vehicleType: string;
  brand: string;
  model: string;
  vehicleYear: number;
  plate: string;
  orderNumber: string | null;
  status: string;
}

export interface ServiceHistoryItem {
  serviceOrderId: number;
  entryDate: string;
  primaryReason: string;
  currentMileage: number;
  customerObservations: string | null;
  serviceCost: number | null;
  status: VehicleServiceStatus;
  estimatedPickupAt: string | null;
  progressNote: string | null;
  tasks: ServiceTaskRequest[];
  paymentMethod: PaymentMethod | null;
  paymentRecordedAt: string | null;
  paymentAmount: number | null;
}

export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO';

export type WorkshopActivityType = 'VEHICLE_RECEIVED' | 'STATUS_CHANGED' | 'TASK_COMPLETED';

export interface WorkshopActivityResponse {
  id: number;
  type: WorkshopActivityType;
  occurredAt: string;
  mechanicName: string;
  vehicleBrand: string;
  vehicleModel: string;
  plate: string;
  detail: string;
  serviceOrderId: number;
}

export type WorkshopCurrency = 'COP' | 'USD' | 'EUR';

export interface WorkshopSettings {
  hourlyRateCop: number;
  vatPercentage: number;
  currency: WorkshopCurrency;
  invoiceNote: string;
}

export type MechanicSpecialty =
  | 'Mecánica general'
  | 'Motores'
  | 'Frenos'
  | 'Transmisión'
  | 'Electricidad'
  | 'Inyección'
  | 'Suspensión';

export type MechanicExperienceLevel = 'Junior' | 'Semi-senior' | 'Senior';

export interface MechanicAssignment {
  serviceOrderId: number;
  plate: string;
  vehicleDescription: string;
  status: string;
}

export interface MechanicRecord {
  id: number;
  accessEmail: string;
  fullName: string;
  documentNumber: string | null;
  phone: string | null;
  email: string | null;
  specialty: MechanicSpecialty | null;
  experienceLevel: MechanicExperienceLevel | null;
  hireDate: string | null;
  available: boolean;
  deletable: boolean;
  assignments: MechanicAssignment[];
}

export interface MechanicRequest {
  accessEmail: string;
  fullName: string;
  documentNumber: string;
  phone: string;
  email: string;
  specialty: MechanicSpecialty;
  experienceLevel: MechanicExperienceLevel;
  hireDate: string;
  password: string;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA_DEBITO: 'Tarjeta débito',
  TARJETA_CREDITO: 'Tarjeta crédito'
};

export interface SimulatedPaymentRequest {
  plate: string;
  identificationNumber: string;
  paymentMethod: PaymentMethod;
}

export interface SimulatedPaymentResponse {
  serviceOrderId: number;
  paymentMethod: PaymentMethod;
  paymentRecordedAt: string;
  amount: number;
}

export interface ServiceOrderRequest {
  entryDate: string;
  primaryReason: string;
  currentMileage: number;
  customerObservations: string;
  serviceCost?: number | null;
  estimatedPickupAt?: string | null;
  progressNote?: string | null;
  paymentMethod?: PaymentMethod | null;
  paymentRecordedAt?: string | null;
  paymentAmount?: number | null;
  mechanicDiagnosis?: string;
  status?: VehicleServiceStatus;
  tasks?: ServiceTaskRequest[];
  parts?: ServicePartRequest[];
  labor?: ServiceLaborRequest[];
  photoFront?: string;
  photoRightSide?: string;
  photoBack?: string;
  photoOdometer?: string;
  photoExtra?: string;
  vehicle: { id: number };
}

export interface ServiceOrderResponse extends ServiceOrderRequest {
  id: number;
  vehicle: VehicleResponse;
}

export type VehicleServiceStatus = 'PENDIENTE' | 'EN PROGRESO' | 'LISTO';

export interface ServiceTaskRequest {
  description: string;
  completed: boolean;
}

export interface ServicePartRequest {
  name: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
}

export interface ServiceLaborRequest {
  description: string;
  hours: number;
  rate: number;
}

export interface ServiceOrderUpdateRequest {
  primaryReason: string;
  currentMileage: number;
  customerObservations: string;
  estimatedPickupAt: string | null;
  progressNote: string | null;
}

export interface VehicleIntakeDraft {
  vehicle: {
    vehicleType: string;
    brand: string;
    plate: string;
    chassisNumber: string;
    model: string;
    vehicleYear: number;
  };
  customer: ClientRequest;
  entry: {
    primaryReason: string;
    currentMileage: number;
    customerObservations: string;
  };
}
