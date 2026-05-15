package com.sigma.todo.domain;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Default implementation of the Dynamic Priority Engine.
 * Incorporates Urgency, Importance, Gravity, and Effort constraints.
 */
public class DefaultDynamicPriorityStrategy implements PriorityCalculationStrategy {

    private final com.sigma.todo.config.DynamicWeightProvider weightProvider;

    public DefaultDynamicPriorityStrategy(com.sigma.todo.config.DynamicWeightProvider weightProvider) {
        this.weightProvider = weightProvider;
    }

    private static final int ZOMBIE_THRESHOLD = 5;
    private static final double ZOMBIE_PENALTY = -99999.0;
    private static final double K_STABILITY_CONSTANT = 10.0; // Prevents division by near-zero

    @Override
    public PriorityScore calculate(Task task, LocalDateTime now, long availableMinutes, java.util.Set<String> currentTags) {
        // 1. Hard Constraint: Available Time vs Estimated Effort
        if (task.getEstimatedEffortMinutes() > availableMinutes) {
            return PriorityScore.zero();
        }

        // 2. Base Components
        double importanceScore = task.getImportance() * weightProvider.getImportanceWeight();
        double urgencyScore = calculateUrgency(task, now);
        double gravityAdjustment = calculateGravityAdjustment(task);
        double contextBoost = calculateContextBoost(task, currentTags);

        // 3. Entropy (변동성 주입): 초기 데이터 부족 시 점수 겹침 방지
        double entropy = calculateEntropy(task, now);

        double total = importanceScore + urgencyScore + gravityAdjustment + contextBoost + entropy;

        // 4. Exploration (탐색): 5% 확률로 새로운 작업 제안
        String reason = determinePrimaryReason(importanceScore, urgencyScore, gravityAdjustment, contextBoost, task);
        if (Math.random() < 0.05) {
            total += 1000.0; // Exploration Boost
            reason = "새로운 패턴 탐색을 위한 AI 추천";
        }

        return PriorityScore.of(total, reason);
    }

    private double calculateEntropy(Task task, LocalDateTime now) {
        // 태스크 ID와 시간 조합으로 미세한 변동성(0.1~0.5) 생성
        long seed = task.getId() != null ? task.getId() : 0;
        return (Math.abs(seed + now.getMinute()) % 5) / 10.0;
    }

    private String determinePrimaryReason(double importance, double urgency, double gravity, double context, Task task) {
        if (urgency > importance && urgency > gravity) return "마감 임박으로 우선순위 상승";
        if (gravity > importance) return "계속 미뤄진 작업 우선 처리 권장";
        if (context > 0) return "현재 상황(태그)과 높은 관련성";
        if (task.getImportance() >= 4) return "중요도가 높은 핵심 업무";
        return "종합 분석 기반 최적 순서";
    }

    private double calculateContextBoost(Task task, java.util.Set<String> currentTags) {
        if (currentTags == null || currentTags.isEmpty() || task.getTaskTags().isEmpty()) {
            return 0.0;
        }
        
        long matchCount = task.getTaskTags().stream()
                .filter(currentTags::contains)
                .count();
        
        return matchCount * weightProvider.getContextBoostWeight();
    }

    private double calculateUrgency(Task task, LocalDateTime now) {
        long minutesLeft = Duration.between(now, task.getDueDate()).toMinutes();
        
        // Handle Overdue: treat as 0 minutes remaining to maximize urgency without infinity
        // Limit: As dt -> 0, Score -> W2 / K. This is the Upper Bound.
        long dt = Math.max(0, minutesLeft); 
        
        return weightProvider.getUrgencyWeight() / (dt + K_STABILITY_CONSTANT);
    }

    private double calculateGravityAdjustment(Task task) {
        int count = task.getDelayCount();
        
        // Piecewise Function for Zombie Task Policy
        if (count >= ZOMBIE_THRESHOLD) {
            return ZOMBIE_PENALTY;
        }
        
        // Warning phase: Score increases slightly as delay increases
        return count * weightProvider.getGravityWeight();
    }
}
