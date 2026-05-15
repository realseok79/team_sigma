package com.sigma.todo.controller;

import com.sigma.todo.domain.Task;
import com.sigma.todo.dto.TaskSearchRequest;
import com.sigma.todo.event.TaskActivityEvent;
import com.sigma.todo.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 클라이언트 컨텍스트를 Query Parameter로 전달받아 필터링된 목록 반환
     */
    @GetMapping
    public List<Task> getTasks(
            @RequestParam String userId,
            TaskSearchRequest request) {
        
        return taskRepository.findExecutableTasks(userId, request.currentEnergy());
    }

    /**
     * 사용자의 작업 행동(완료/미룸 등)을 비동기로 기록
     */
    @PostMapping("/{taskId}/activity")
    public void recordActivity(
            @PathVariable Long taskId,
            @RequestParam String action) {
        
        // 메인 트랜잭션과 분리하기 위해 이벤트를 발행
        eventPublisher.publishEvent(new TaskActivityEvent(taskId, action));
    }
}
