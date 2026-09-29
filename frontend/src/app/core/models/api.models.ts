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
}

export interface ServiceOrderRequest {
  entryDate: string;
  primaryReason: string;
  currentMileage: number;
  customerObservations: string;
  serviceCost?: number | null;
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

export interface ServiceOrderUpdateRequest {
  primaryReason: string;
  currentMileage: number;
  customerObservations: string;
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
