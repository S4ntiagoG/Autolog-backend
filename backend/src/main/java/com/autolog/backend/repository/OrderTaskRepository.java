package com.autolog.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.autolog.backend.model.OrderTask;
import com.autolog.backend.model.ServiceOrder;

@Repository
public interface OrderTaskRepository extends JpaRepository<OrderTask, Long> {
    List<OrderTask> findByServiceOrder(ServiceOrder serviceOrder);
}
