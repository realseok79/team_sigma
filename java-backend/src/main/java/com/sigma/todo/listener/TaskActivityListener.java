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
     * @Async를 통해 메인 스레드와 분리하여 비동기로 로그 기록
     * 추후 확장 시 이 부분에서 AWS SQS나 Kafka로 메시지를 전송하도록 변경 가능
     */
    @Async
    @EventListener
    public void handleTaskActivity(TaskActivityEvent event) {
        log.info("Recording User Activity: Task {} was {}", event.taskId(), event.action());
        
        // TODO: UserActivityLog 엔티티 저장 로직 구현
        // 팁: 여기서 수집된 데이터는 추후 가중치(w) 자동 조정(Feedback Loop)의 학습 데이터가 됨
    }
}
/**
 * [아키텍처 확장 힌트]
 * 1. AWS SQS 도입 시: TaskActivityListener에서 AmazonSQS 클라이언트를 사용해 메시지를 큐에 적재.
 * 2. 별도의 분석 마이크로서비스(Python 등)가 해당 큐를 컨슘하여 모델을 업데이트.
 */
