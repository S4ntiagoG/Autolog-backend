package com.autolog.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.autolog.backend.dto.OrderTaskRequest;
import com.autolog.backend.dto.ServiceOrderUpdateRequest;
import com.autolog.backend.model.OrderTask;
import com.autolog.backend.model.ServiceOrder;
import com.autolog.backend.repository.OrderTaskRepository;
import com.autolog.backend.repository.ServiceOrderRepository;

@Service
public class ServiceOrderService {

    private final ServiceOrderRepository serviceOrderRepository;
    private final OrderTaskRepository orderTaskRepository;

    public ServiceOrderService(ServiceOrderRepository serviceOrderRepository, OrderTaskRepository orderTaskRepository) {
        this.serviceOrderRepository = serviceOrderRepository;
        this.orderTaskRepository = orderTaskRepository;
    }

    public List<ServiceOrder> getAllServiceOrders() {
        return serviceOrderRepository.findAll();
    }

    public Optional<ServiceOrder> getServiceOrderById(Long id) {
        return serviceOrderRepository.findById(id);
    }

    public ServiceOrder saveServiceOrder(ServiceOrder serviceOrder) {
        LocalDateTime now = LocalDateTime.now();
        if (serviceOrder.getCreatedAt() == null) {
            serviceOrder.setCreatedAt(now);
        }
        if (serviceOrder.getUpdatedAt() == null) {
            serviceOrder.setUpdatedAt(now);
        }
        if (serviceOrder.getEntryDate() == null) {
            serviceOrder.setEntryDate(LocalDate.now());
        }
        if (serviceOrder.getOrderStatus() == null || serviceOrder.getOrderStatus().isBlank()) {
            serviceOrder.setOrderStatus("PENDIENTE");
        }
        return serviceOrderRepository.save(serviceOrder);
    }

    public ServiceOrder updateServiceOrder(Long id, ServiceOrderUpdateRequest request) {
        ServiceOrder existing = serviceOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Orden de servicio no encontrada"));

        if (request.getReasons() != null && !request.getReasons().isEmpty()) {
            existing.setPrimaryReason(String.join(", ", request.getReasons()));
        } else if (request.getPrimaryReason() != null && !request.getPrimaryReason().isBlank()) {
            existing.setPrimaryReason(request.getPrimaryReason());
        }

        existing.setCurrentMileage(request.getCurrentMileage());
        existing.setMileageUnit(request.getMileageUnit() == null || request.getMileageUnit().isBlank() ? "KM" : request.getMileageUnit());
        if (request.getOrderStatus() != null && !request.getOrderStatus().isBlank()) {
            existing.setOrderStatus(request.getOrderStatus());
        }
        existing.setInitialObservations(request.getInitialObservations());
        existing.setCustomerObservations(request.getCustomerObservations());
        existing.setWorkshopPreliminaryObservations(request.getWorkshopPreliminaryObservations());
        existing.setUpdatedAt(LocalDateTime.now());

        return serviceOrderRepository.save(existing);
    }

    public OrderTask addTaskToOrder(Long orderId, OrderTaskRequest request) {
        ServiceOrder serviceOrder = serviceOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Orden de servicio no encontrada"));

        OrderTask task = new OrderTask();
        task.setDescription(request.getDescription().trim());
        task.setCompleted(request.isCompleted());
        serviceOrder.addTask(task);
        serviceOrder.setUpdatedAt(LocalDateTime.now());
        serviceOrderRepository.save(serviceOrder);
        return orderTaskRepository.save(task);
    }

    public OrderTask toggleTask(Long orderId, Long taskId, boolean completed) {
        ServiceOrder order = serviceOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Orden de servicio no encontrada"));

        OrderTask task = order.getTasks().stream()
                .filter(t -> t.getId().equals(taskId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));

        task.setCompleted(completed);
        order.setUpdatedAt(LocalDateTime.now());
        serviceOrderRepository.save(order);
        return orderTaskRepository.save(task);
    }

    public void deleteServiceOrder(Long id) {
        serviceOrderRepository.deleteById(id);
    }
}