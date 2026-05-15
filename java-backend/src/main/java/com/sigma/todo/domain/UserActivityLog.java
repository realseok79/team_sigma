package com.sigma.todo.domain;

import com.sigma.todo.converter.JsonAttributeConverter;
import com.sigma.todo.dto.ContextData;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_activity_logs")
@Getter
@NoArgsConstructor
public class UserActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long taskId;

    @Enumerated(EnumType.STRING)
    private ActionType actionType;

    private LocalDateTime timestamp;

    @Convert(converter = JsonAttributeConverter.class)
    @Column(columnDefinition = "TEXT")
    private ContextData contextSnapshot;

    public UserActivityLog(Long taskId, ActionType actionType, ContextData contextSnapshot) {
        this.taskId = taskId;
        this.actionType = actionType;
        this.contextSnapshot = contextSnapshot;
        this.timestamp = LocalDateTime.now();
    }
}

enum ActionType {
    COMPLETED, 
    SNOOZED, 
    IGNORED, 
    LOGGED_IN_VIEW, // 리스트 진입
    TASK_CLICKED    // 특정 작업 상세 클릭
}
