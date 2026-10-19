package com.autolog.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autolog.backend.dto.WorkshopActivityResponse;
import com.autolog.backend.service.WorkshopActivityService;

@RestController
@RequestMapping("/api/mechanics/activity")
public class WorkshopActivityController {
    private final WorkshopActivityService activityService;

    public WorkshopActivityController(WorkshopActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public List<WorkshopActivityResponse> getRecentActivity() {
        return activityService.getRecentActivity();
    }
}
