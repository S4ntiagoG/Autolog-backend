package com.autolog.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.autolog.backend.dto.SimulatedPaymentResponse;
import com.autolog.backend.dto.ServiceHistoryItem;
import com.autolog.backend.model.ServiceTask;
import com.autolog.backend.model.ServiceLabor;
import com.autolog.backend.model.ServiceOrder;
import com.autolog.backend.model.ServicePart;
import com.autolog.backend.model.PaymentMethod;
import com.autolog.backend.model.WorkshopActivityType;
import com.autolog.backend.repository.ServiceOrderRepository;

@Service
public class ServiceOrderService {

    private final ServiceOrderRepository serviceOrderRepository;
    private final WorkshopActivityService activityService;

    public ServiceOrderService(
            ServiceOrderRepository serviceOrderRepository,
            WorkshopActivityService activityService) {
        this.serviceOrderRepository = serviceOrderRepository;
        this.activityService = activityService;
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
                        order.getTasks(),
                        order.getPaymentMethod(),
                        order.getPaymentRecordedAt(),
                        order.getPaymentAmount()))
                .collect(Collectors.toList());
    }

    @Transactional
    public SimulatedPaymentResponse recordSimulatedPayment(
            Long orderId,
            String plate,
            String identificationNumber,
            PaymentMethod paymentMethod) {
        ServiceOrder order = serviceOrderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        boolean matchingPlate = order.getVehicle().getPlate().equalsIgnoreCase(plate.trim());
        boolean matchingCustomer = order.getVehicle().getClient().getIdentificationNumber()
                .equals(identificationNumber.trim());
        if (!matchingPlate || !matchingCustomer) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        if (!"LISTO".equalsIgnoreCase(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El pago simulado solo está disponible cuando el servicio está listo para entrega.");
        }
        if (order.getPaymentMethod() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Esta orden ya tiene un medio de pago registrado.");
        }

        BigDecimal amount = calculateServiceCost(order);
        if (amount == null || amount.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La orden todavía no tiene un total de servicio para pagar.");
        }

        order.setPaymentMethod(paymentMethod);
        order.setPaymentRecordedAt(java.time.LocalDateTime.now());
        order.setPaymentAmount(amount);
        ServiceOrder savedOrder = serviceOrderRepository.save(order);
        return new SimulatedPaymentResponse(
                savedOrder.getId(),
                savedOrder.getPaymentMethod(),
                savedOrder.getPaymentRecordedAt(),
                savedOrder.getPaymentAmount());
    }

    // Registrar o guardar una nueva orden de servicio (Ingreso al taller)
    public ServiceOrder saveServiceOrder(ServiceOrder serviceOrder) {
        return serviceOrderRepository.save(withCalculatedCost(serviceOrder));
    }

    @Transactional
    public ServiceOrder registerVehicleEntry(ServiceOrder serviceOrder, String mechanicName) {
        ServiceOrder savedOrder = saveServiceOrder(serviceOrder);
        activityService.record(
                savedOrder,
                WorkshopActivityType.VEHICLE_RECEIVED,
                "Ingreso registrado: " + savedOrder.getPrimaryReason(),
                mechanicName);
        return savedOrder;
    }

    @Transactional
    public ServiceOrder saveWorkOrder(
            ServiceOrder serviceOrder,
            String previousStatus,
            List<ServiceTask> previousTasks,
            String mechanicName) {
        ServiceOrder savedOrder = saveServiceOrder(serviceOrder);
        if (!java.util.Objects.equals(previousStatus, savedOrder.getStatus())) {
            activityService.record(
                    savedOrder,
                    WorkshopActivityType.STATUS_CHANGED,
                    "Estado actualizado: " + previousStatus + " → " + savedOrder.getStatus(),
                    mechanicName);
        }

        List<ServiceTask> currentTasks = savedOrder.getTasks() == null ? List.of() : savedOrder.getTasks();
        for (int index = 0; index < currentTasks.size(); index++) {
            ServiceTask task = currentTasks.get(index);
            boolean wasCompleted = index < previousTasks.size() && previousTasks.get(index).isCompleted();
            if (task.isCompleted() && !wasCompleted) {
                activityService.record(
                        savedOrder,
                        WorkshopActivityType.TASK_COMPLETED,
                        "Trabajo completado: " + task.getDescription(),
                        mechanicName);
            }
        }
        return savedOrder;
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