package com.sigma.todo.listener;

import com.sigma.todo.event.TaskActivityEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TaskActivityListener {

    /**
     * @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)를 통해
     * 메인 비즈니스 트랜잭션이 성공적으로 커밋된 경우에만 비동기로 로그를 기록합니다.
     */
    @Async
    @org.springframework.transaction.event.TransactionalEventListener(phase = org.springframework.transaction.event.TransactionPhase.AFTER_COMMIT)
    public void handleTaskActivity(TaskActivityEvent event) {
        log.info("Recording User Activity: Task {} was {}", event.taskId(), event.action());
        
        // TODO: UserActivityLogRepository.save(new UserActivityLog(...))
    }
}
/**
 * [아키텍처 확장 힌트]
 * 1. AWS SQS 도입 시: TaskActivityListener에서 AmazonSQS 클라이언트를 사용해 메시지를 큐에 적재.
 * 2. 별도의 분석 마이크로서비스(Python 등)가 해당 큐를 컨슘하여 모델을 업데이트.
 */
