package com.autolog.backend.service;

import java.util.Locale;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.autolog.backend.dto.ClientVehicleHomeResponse;
import com.autolog.backend.model.ServiceOrder;
import com.autolog.backend.model.Vehicle;
import com.autolog.backend.repository.ServiceOrderRepository;
import com.autolog.backend.repository.VehicleRepository;

@Service
public class VehicleLookupService {

    private final VehicleRepository vehicleRepository;
    private final ServiceOrderRepository serviceOrderRepository;

    public VehicleLookupService(VehicleRepository vehicleRepository, ServiceOrderRepository serviceOrderRepository) {
        this.vehicleRepository = vehicleRepository;
        this.serviceOrderRepository = serviceOrderRepository;
    }

    @Transactional(readOnly = true)
    public Optional<ClientVehicleHomeResponse> findByPlateAndDocument(String plate, String identificationNumber) {
        String normalizedPlate = plate == null ? "" : plate.toUpperCase(Locale.ROOT);
        if (!VehicleService.isValidColombianPlate(normalizedPlate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de placa inválido");
        }

        Optional<Vehicle> vehicleResult = vehicleRepository.findByPlateAndClient_IdentificationNumber(
                normalizedPlate, identificationNumber);
        if (vehicleResult.isEmpty()) {
            return Optional.empty();
        }

        Vehicle vehicle = vehicleResult.get();
        ServiceOrder latestOrder = serviceOrderRepository
                .findFirstByVehicleIdOrderByEntryDateDescIdDesc(vehicle.getId())
                .orElse(null);
        String orderNumber = latestOrder == null ? null : String.format(Locale.ROOT, "ORD-%03d", latestOrder.getId());
        String status = latestOrder == null
                ? "SIN ORDEN"
                : latestOrder.getStatus() == null ? "PENDIENTE" : latestOrder.getStatus();

        return Optional.of(new ClientVehicleHomeResponse(
                vehicle.getId(),
                vehicle.getVehicleType(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getVehicleYear(),
                vehicle.getPlate(),
                orderNumber,
                status));
    }
}