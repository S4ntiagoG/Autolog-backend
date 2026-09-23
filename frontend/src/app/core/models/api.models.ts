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
  client?: { id: number };
}

export interface VehicleResponse extends Omit<VehicleRequest, 'client'> {
  id: number;
  client: ClientResponse;
}

export interface OrderTask {
  id: number;
  description: string;
  completed: boolean;
}

export interface ServiceOrderRequest {
  entryDate?: string;
  primaryReason: string;
  currentMileage: number;
  customerObservations?: string;
  initialObservations?: string;
  workshopPreliminaryObservations?: string;
  mileageUnit?: string;
  orderStatus?: string;
  photoFront?: string;
  photoRightSide?: string;
  photoBack?: string;
  photoOdometer?: string;
  photoExtra?: string;
  vehicle?: { id: number };
  reasons?: string[];
  createdAt?: string;
  updatedAt?: string;
  tasks?: OrderTask[];
}

export interface ServiceOrderResponse extends ServiceOrderRequest {
  id: number;
  vehicle: VehicleResponse;
  createdAt?: string;
  updatedAt?: string;
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
