package com.sigma.todo.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.assertj.core.api.Assertions.assertThat;

public class PriorityEngineTest {

    private final PriorityCalculationStrategy strategy = new DefaultDynamicPriorityStrategy();
    private final LocalDateTime now = LocalDateTime.of(2024, 5, 14, 12, 0);

    @Test
    @DisplayName("마감 기한이 1시간 남은 작업이 1일 남은 작업보다 점수가 높아야 한다 (Urgency)")
    void testUrgencyComparison() {
        Task urgentTask = new Task("1", "Urgent", now.plusHours(1), 3, 0, 30);
        Task relaxedTask = new Task("2", "Relaxed", now.plusDays(1), 3, 0, 30);

        PriorityScore urgentScore = strategy.calculate(urgentTask, now, 600);
        PriorityScore relaxedScore = strategy.calculate(relaxedTask, now, 600);

        assertThat(urgentScore.getValue()).isGreaterThan(relaxedScore.getValue());
    }

    @Test
    @DisplayName("중요도가 높더라도 마감 기한이 매우 멀면 순위가 밀려야 한다 (Boundary)")
    void testImportanceVsDeadline() {
        // 중요도 5, 마감 10일 후
        Task highImpLongTerm = new Task("3", "Future Important", now.plusDays(10), 5, 0, 30);
        // 중요도 2, 마감 2시간 후
        Task lowImpShortTerm = new Task("4", "Near Term Low", now.plusHours(2), 2, 0, 30);

        PriorityScore longTermScore = strategy.calculate(highImpLongTerm, now, 600);
        PriorityScore shortTermScore = strategy.calculate(lowImpShortTerm, now, 600);

        assertThat(shortTermScore.getValue()).isGreaterThan(longTermScore.getValue());
    }

    @Test
    @DisplayName("가용 시간보다 예상 소요 시간이 큰 작업은 점수가 0점이어야 한다 (Hard Constraint)")
    void testAvailableTimeConstraint() {
        Task heavyTask = new Task("5", "Heavy", now.plusHours(5), 5, 0, 120); // 120분 소요
        
        PriorityScore score = strategy.calculate(heavyTask, now, 60); // 60분 가용

        assertThat(score.getValue()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("미룬 횟수가 임계점(5회)을 넘으면 좀비 태스크로 간주하여 점수가 대폭 하락해야 한다")
    void testZombieTaskPolicy() {
        Task normalTask = new Task("6", "Normal", now.plusHours(5), 3, 4, 30);
        Task zombieTask = new Task("7", "Zombie", now.plusHours(5), 3, 5, 30);

        PriorityScore normalScore = strategy.calculate(normalTask, now, 600);
        PriorityScore zombieScore = strategy.calculate(zombieTask, now, 600);

        assertThat(zombieScore.getValue()).isEqualTo(0.0); // Penalty results in 0 (floor)
        assertThat(normalScore.getValue()).isGreaterThan(zombieScore.getValue());
    }
}
