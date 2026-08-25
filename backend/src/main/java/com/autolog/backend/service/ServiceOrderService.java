package com.autolog.backend.service;

import com.autolog.backend.model.ServiceOrder;
import com.autolog.backend.repository.ServiceOrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ServiceOrderService {

    private final ServiceOrderRepository serviceOrderRepository;

    public ServiceOrderService(ServiceOrderRepository serviceOrderRepository) {
        this.serviceOrderRepository = serviceOrderRepository;
    }

    // Listar todas las órdenes de servicio
    public List<ServiceOrder> getAllServiceOrders() {
        return serviceOrderRepository.findAll();
    }

    // Buscar una orden de servicio por ID
    public Optional<ServiceOrder> getServiceOrderById(Long id) {
        return serviceOrderRepository.findById(id);
    }

    // Registrar o guardar una nueva orden de servicio (Ingreso al taller)
    public ServiceOrder saveServiceOrder(ServiceOrder serviceOrder) {
        return serviceOrderRepository.save(serviceOrder);
    }

    // Eliminar una orden de servicio por ID
    public void deleteServiceOrder(Long id) {
        serviceOrderRepository.deleteById(id);
    }
}