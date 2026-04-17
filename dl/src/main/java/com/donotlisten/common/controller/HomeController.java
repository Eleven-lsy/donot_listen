package com.donotlisten.common.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 首页控制器。
 * 处理根路径重定向到前端首页。
 */
@Controller
public class HomeController {

    @GetMapping("/")
    public void redirectToHome(HttpServletResponse response) throws IOException {
        response.sendRedirect("/static/home.html");
    }
}
