package com.donotlisten.navigation.controller;

import com.donotlisten.common.ApiResponse;
import com.donotlisten.navigation.dto.NavigationResponse;
import com.donotlisten.navigation.service.NavigationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/navigation")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NavigationController {

    private final NavigationService navigationService;

    @GetMapping
    public ApiResponse<NavigationResponse> getNavigation() {
        return ApiResponse.success(navigationService.getNavigation());
    }
}
