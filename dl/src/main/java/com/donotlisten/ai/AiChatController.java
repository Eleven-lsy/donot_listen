//package com.donotlisten.ai;
//
//import com.donotlisten.common.ApiResponse;
//import lombok.RequiredArgsConstructor;
//import org.springframework.ai.chat.client.ChatClient;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/api/ai")
//@RequiredArgsConstructor
//public class AiChatController {
//
//    private final ChatClient chatClient;
//
//    @GetMapping("/chat")
//    public ApiResponse<String> chat(@RequestParam String message) {
//        String response = chatClient.prompt()
//                .user(message)
//                .call()
//                .content();
//        return new ApiResponse<>(0, "success", response);
//    }
//}
