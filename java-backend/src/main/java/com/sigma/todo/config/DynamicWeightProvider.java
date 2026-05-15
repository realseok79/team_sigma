package com.sigma.todo.config;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DynamicWeightProvider {

    private final PriorityWeights weights;

    private static final double MIN_WEIGHT = 10.0;
    private static final double MAX_WEIGHT = 10000.0;
    private static final double TARGET_SUM = 6000.0; // 전체 가중치의 합을 일정하게 유지

    public double getImportanceWeight() { 
        return applyTimeProfile(weights.getImportance()); 
    }
    
    public double getUrgencyWeight() { 
        return applyTimeProfile(weights.getUrgency()); 
    }
    
    public double getGravityWeight() { return weights.getGravity(); }
    public double getContextBoostWeight() { return weights.getContextBoost(); }

    /**
     * 시간대별 집중도 반영 (Time-of-Day Profile)
     * 오전 시간대(09:00~12:00)에 중요도/긴급도 가중치를 1.2배 부스팅
     */
    private double applyTimeProfile(double baseWeight) {
        int hour = java.time.LocalTime.now().getHour();
        if (hour >= 9 && hour <= 12) {
            return baseWeight * 1.2;
        }
        return baseWeight;
    }

    /**
     * 가중치 업데이트 (Normalization & Clipping 적용)
     */
    public void updateWeightsManually(java.util.List<com.sigma.todo.domain.UserActivityLog> recentLogs) {
        // 로그 분석: SNOOZED나 IGNORED가 많으면 Gravity 가중치 상향
        long negativeActions = recentLogs.stream()
                .filter(log -> log.getActionType().name().equals("SNOOZED") || 
                               log.getActionType().name().equals("IGNORED"))
                .count();

        if (negativeActions >= 5) {
            weights.setGravity(Math.min(MAX_WEIGHT, weights.getGravity() * 1.5));
        }

        // 1. Clipping: 최소/최대 범위 제한
        weights.setImportance(clamp(weights.getImportance()));
        weights.setUrgency(clamp(weights.getUrgency()));
        weights.setGravity(clamp(weights.getGravity()));
        weights.setContextBoost(clamp(weights.getContextBoost()));

        // 2. Normalization: 전체 합계 정규화
        normalize();
    }

    private double clamp(double value) {
        return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, value));
    }

    private void normalize() {
        double currentSum = weights.getImportance() + weights.getUrgency() + 
                            weights.getGravity() + weights.getContextBoost();
        double factor = TARGET_SUM / currentSum;

        weights.setImportance(weights.getImportance() * factor);
        weights.setUrgency(weights.getUrgency() * factor);
        weights.setGravity(weights.getGravity() * factor);
        weights.setContextBoost(weights.getContextBoost() * factor);
    }
}
