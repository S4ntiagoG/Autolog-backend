package com.autolog.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.autolog.backend.model.WorkshopActivity;

@Repository
public interface WorkshopActivityRepository extends JpaRepository<WorkshopActivity, Long> {
    List<WorkshopActivity> findTop10ByOrderByOccurredAtDescIdDesc();
}
