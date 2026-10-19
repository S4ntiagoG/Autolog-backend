package com.autolog.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autolog.backend.dto.WorkshopActivityResponse;
import com.autolog.backend.model.ServiceOrder;
import com.autolog.backend.model.WorkshopActivity;
import com.autolog.backend.model.WorkshopActivityType;
import com.autolog.backend.repository.WorkshopActivityRepository;

@Service
public class WorkshopActivityService {
    private final WorkshopActivityRepository activityRepository;

    public WorkshopActivityService(WorkshopActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    @Transactional
    public void record(
            ServiceOrder order,
            WorkshopActivityType type,
            String detail,
            String mechanicName) {
        WorkshopActivity activity = new WorkshopActivity();
        activity.setType(type);
        activity.setOccurredAt(LocalDateTime.now());
        activity.setMechanicName(mechanicName);
        activity.setVehicleBrand(order.getVehicle().getBrand());
        activity.setVehicleModel(order.getVehicle().getModel());
        activity.setPlate(order.getVehicle().getPlate());
        activity.setDetail(detail);
        activity.setServiceOrderId(order.getId());
        activityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public List<WorkshopActivityResponse> getRecentActivity() {
        return activityRepository.findTop10ByOrderByOccurredAtDescIdDesc().stream()
                .map(activity -> new WorkshopActivityResponse(
                        activity.getId(),
                        activity.getType(),
                        activity.getOccurredAt(),
                        activity.getMechanicName(),
                        activity.getVehicleBrand(),
                        activity.getVehicleModel(),
                        activity.getPlate(),
                        activity.getDetail(),
                        activity.getServiceOrderId()))
                .toList();
    }
}
