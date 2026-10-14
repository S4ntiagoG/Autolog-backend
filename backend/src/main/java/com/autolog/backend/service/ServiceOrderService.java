package com.autolog.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.autolog.backend.dto.ServiceHistoryItem;
import com.autolog.backend.model.ServiceLabor;
import com.autolog.backend.model.ServiceOrder;
import com.autolog.backend.model.ServicePart;
import com.autolog.backend.repository.ServiceOrderRepository;

@Service
public class ServiceOrderService {

    private final ServiceOrderRepository serviceOrderRepository;

    public ServiceOrderService(ServiceOrderRepository serviceOrderRepository) {
        this.serviceOrderRepository = serviceOrderRepository;
    }

    // Listar todas las órdenes de servicio
    public List<ServiceOrder> getAllServiceOrders() {
        return serviceOrderRepository.findAll().stream()
                .map(this::withCalculatedCost)
                .collect(Collectors.toList());
    }

    // Buscar una orden de servicio por ID
    public Optional<ServiceOrder> getServiceOrderById(Long id) {
        return serviceOrderRepository.findById(id)
                .map(this::withCalculatedCost);
    }

    public List<ServiceHistoryItem> getHistoryByVehicleId(Long vehicleId) {
        return serviceOrderRepository.findByVehicleIdOrderByEntryDateDescIdDesc(vehicleId).stream()
                .map(order -> new ServiceHistoryItem(
                        order.getId(),
                        order.getEntryDate(),
                        order.getPrimaryReason(),
                        order.getCurrentMileage(),
                        order.getCustomerObservations(),
                        calculateServiceCost(order),
                        order.getStatus(),
                        order.getEstimatedPickupAt(),
                        order.getProgressNote(),
                        order.getTasks()))
                .collect(Collectors.toList());
    }

    // Registrar o guardar una nueva orden de servicio (Ingreso al taller)
    public ServiceOrder saveServiceOrder(ServiceOrder serviceOrder) {
        return serviceOrderRepository.save(withCalculatedCost(serviceOrder));
    }

    // Eliminar una orden de servicio por ID
    public void deleteServiceOrder(Long id) {
        serviceOrderRepository.deleteById(id);
    }

    private BigDecimal calculateServiceCost(ServiceOrder order) {
        List<ServicePart> parts = order.getParts() == null ? List.of() : order.getParts();
        List<ServiceLabor> laborItems = order.getLabor() == null ? List.of() : order.getLabor();
        if (parts.isEmpty() && laborItems.isEmpty()) {
            return null;
        }
        BigDecimal partsCost = parts.stream()
                .map(this::partCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal laborCost = laborItems.stream()
                .map(this::laborCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return partsCost.add(laborCost).setScale(2, RoundingMode.HALF_UP);
    }

    private ServiceOrder withCalculatedCost(ServiceOrder order) {
        order.setServiceCost(calculateServiceCost(order));
        return order;
    }

    private BigDecimal partCost(ServicePart part) {
        return part.getUnitPrice().multiply(BigDecimal.valueOf(part.getQuantity()));
    }

    private BigDecimal laborCost(ServiceLabor labor) {
        return labor.getHours().multiply(labor.getRate());
    }
}