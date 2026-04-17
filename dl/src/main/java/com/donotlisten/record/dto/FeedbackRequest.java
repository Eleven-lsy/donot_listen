package com.donotlisten.record.dto;

import com.donotlisten.listening.FeedbackStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequest {

    @NotBlank(message = "听力ID不能为空")
    private String listeningId;

    @NotNull(message = "行号不能为空")
    private Integer lineNumber;

    @NotNull(message = "状态不能为空")
    private FeedbackStatus status;
}
