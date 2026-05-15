package com.sigma.todo.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.assertj.core.api.Assertions.assertThat;

public class PriorityEngineTest {

    private com.sigma.todo.config.PriorityWeights weights;
    private com.sigma.todo.config.DynamicWeightProvider weightProvider;
    private PriorityCalculationStrategy strategy;
    private final LocalDateTime now = LocalDateTime.of(2024, 5, 14, 12, 0);

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        weights = new com.sigma.todo.config.PriorityWeights();
        weightProvider = new com.sigma.todo.config.DynamicWeightProvider(weights);
        strategy = new DefaultDynamicPriorityStrategy(weightProvider);
    }

    @Test
    @DisplayName("Entropy 주입으로 인해 동일 조건의 작업이라도 미세한 점수 차이가 발생해야 한다")
    void testEntropyVariation() {
        Task task1 = new Task("user1", "Same 1", now.plusHours(5), EnergyLevel.MEDIUM, 3, 0, 30);
        Task task2 = new Task("user1", "Same 2", now.plusHours(5), EnergyLevel.MEDIUM, 3, 0, 30);

        PriorityScore score1 = strategy.calculate(task1, now, 600, null);
        PriorityScore score2 = strategy.calculate(task2, now, 600, null);

        assertThat(score1.getValue()).isNotEqualTo(score2.getValue());
        assertThat(Math.abs(score1.getValue() - score2.getValue())).isLessThan(1.0);
    }

    @Test
    @DisplayName("가중치 변화(Manual Update) 전후로 작업의 우선순위 점수가 유의미하게 변해야 한다")
    void testWeightUpdateSimulation() {
        Task delayedTask = new Task("user1", "Delayed Task", now.plusHours(10), EnergyLevel.MEDIUM, 3, 4, 30);
        
        double initialScore = strategy.calculate(delayedTask, now, 600, null).getValue();

        // 시뮬레이션: 사용자가 계속 미루는 로그 5개 주입 (SNOOZED)
        java.util.List<UserActivityLog> logs = new java.util.ArrayList<>();
        for (int i = 0; i < 5; i++) {
            logs.add(new UserActivityLog(10L, ActionType.SNOOZED, null));
        }
        
        weightProvider.updateWeightsManually(logs);
        
        double updatedScore = strategy.calculate(delayedTask, now, 600, null).getValue();
        
        // Gravity 가중치가 상향되어 지연된 작업의 점수가 올라가야 함
        assertThat(updatedScore).isGreaterThan(initialScore);
    }

    @Test
    @DisplayName("Exploration 로직이 작동하여 사유(Reason)에 반영되는지 확인한다")
    void testExplorationReason() {
        Task task = new Task("user1", "Normal Task", now.plusHours(24), EnergyLevel.MEDIUM, 2, 0, 30);
        
        boolean foundExploration = false;
        for (int i = 0; i < 200; i++) {
            PriorityScore score = strategy.calculate(task, now, 600, null);
            if (score.getReason().contains("탐색")) {
                foundExploration = true;
                assertThat(score.getValue()).isGreaterThan(1000.0);
                break;
            }
        }
        assertThat(foundExploration).isTrue();
    }

    @Test
    @DisplayName("마감 기한이 1시간 남은 작업이 1일 남은 작업보다 점수가 높아야 한다 (Urgency)")
    void testUrgencyComparison() {
        Task urgentTask = new Task("user1", "Urgent", now.plusHours(1), EnergyLevel.MEDIUM, 3, 0, 30);
        Task relaxedTask = new Task("user1", "Relaxed", now.plusDays(1), EnergyLevel.MEDIUM, 3, 0, 30);

        PriorityScore urgentScore = strategy.calculate(urgentTask, now, 600, null);
        PriorityScore relaxedScore = strategy.calculate(relaxedTask, now, 600, null);

        assertThat(urgentScore.getValue()).isGreaterThan(relaxedScore.getValue());
    }

    @Test
    @DisplayName("가용 시간보다 예상 소요 시간이 큰 작업은 점수가 0점이어야 한다 (Hard Constraint)")
    void testAvailableTimeConstraint() {
        Task heavyTask = new Task("user1", "Heavy", now.plusHours(5), EnergyLevel.HIGH, 5, 0, 120);
        
        PriorityScore score = strategy.calculate(heavyTask, now, 60, null);

        assertThat(score.getValue()).isEqualTo(0.0);
        assertThat(score.getReason()).contains("제약 조건");
    }
}
