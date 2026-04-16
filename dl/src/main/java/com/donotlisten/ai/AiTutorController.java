package com.donotlisten.ai;

import com.donotlisten.common.ApiResponse;
import com.donotlisten.listening.TranscriptLine;
import com.donotlisten.listening.mapper.TranscriptLineMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiTutorController {

    private final TranscriptLineMapper transcriptLineMapper;
    private final AiConfig aiConfig;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public AiTutorController(TranscriptLineMapper transcriptLineMapper, AiConfig aiConfig) {
        this.transcriptLineMapper = transcriptLineMapper;
        this.aiConfig = aiConfig;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    @GetMapping("/explain")
    public ApiResponse<String> explainSentence(@RequestParam String lineId) {
        TranscriptLine line = transcriptLineMapper.selectById(lineId);
        if (line == null) {
            return ApiResponse.error("找不到这句听力原文");
        }

        String originalSentence = line.getContent();
        String prompt = buildPrompt(originalSentence);

        try {
            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "model", aiConfig.getModel(),
                    "messages", List.of(Map.of(
                            "role", "user",
                            "content", prompt
                    )),
                    "temperature", 0.2
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(aiConfig.getBaseUrl() + "/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + aiConfig.getApiKey())
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                Map<String, Object> jsonResponse = objectMapper.readValue(response.body(), Map.class);
                List<Map<String, Object>> choices = (List<Map<String, Object>>) jsonResponse.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String aiResponse = (String) message.get("content");
                    return ApiResponse.success("获取 AI 讲解成功", aiResponse);
                }
            }

            return ApiResponse.error("AI 服务调用失败: " + response.body());
        } catch (Exception e) {
            return ApiResponse.error("AI 服务调用失败: " + e.getMessage());
        }
    }

    private String buildPrompt(String originalSentence) {
        return """
                你是一个专业、克制、准确的四六级英语听力私教。重点关注听力,你的任务是帮助学生快速听懂句子，不要卖弄，不要幽默，不要写无关比喻，不要输出废话。

                你将分析这句听力原文：
                %s

                请严格遵守以下规则：
                1. 不要重复输出原句。
                2. 输出必须使用简洁 Markdown，只能包含这两个一级小节：`【翻译】`、`【分析】`。
                3. `【翻译】`部分只给一版自然、准确、符合中文表达习惯的译文。
                4. `【分析】`部分只保留 2 条，使用有序列表 `1.` `2.`。
                5. 分析重点只允许围绕：听力难点、语音现象（连读/失爆/弱读等）、关键信号词、句子主干、易错点。
                   如果涉及语音现象，必须具体标出是怎么变的（例如：前一个词的辅音 /t/ 与后一个词的元音 /ə/ 连读；或字母 d 发生失爆不发音），绝不允许只泛泛而谈“此处有连读”。
                6. 如果涉及地名、人名、机构名、专有名词，优先按专有名词理解，不要望文生义乱翻。
                7. 如果某个词在特定语境下不是常见义，必须按语境解释，例如地理名称中的 Key 不能机械翻成“钥匙”。
                8. 不要编造背景知识；不确定时用“此处更可能指……”这类谨慎表达。
                9. 不要出现“这句话很幽默”“像什么什么一样”之类的点评。
                10. 总字数控制在 120 到 180 个中文字符之间，越精炼越好。

                输出格式示例：
                【翻译】
                ...

                【分析】
                1. ...
                2. ...
                """.formatted(originalSentence == null ? "" : originalSentence.trim());
    }
}
