package com.sigma.todo.domain;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Default implementation of the Dynamic Priority Engine.
 * Incorporates Urgency, Importance, Gravity, and Effort constraints.
 */
public class DefaultDynamicPriorityStrategy implements PriorityCalculationStrategy {

    // Weights (Can be moved to configuration/properties)
    private static final double W1_IMPORTANCE = 100.0;
    private static final double W2_URGENCY = 5000.0;
    private static final double W3_GRAVITY = 50.0;
    
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
        double importanceScore = task.getImportance() * W1_IMPORTANCE;
        double urgencyScore = calculateUrgency(task, now);
        double gravityAdjustment = calculateGravityAdjustment(task);
        double contextBoost = calculateContextBoost(task, currentTags);

        double total = importanceScore + urgencyScore + gravityAdjustment + contextBoost;

        // 3. Final Score (Value Object handles max(0, total))
        return PriorityScore.of(total);
    }

    private double calculateContextBoost(Task task, java.util.Set<String> currentTags) {
        if (currentTags == null || currentTags.isEmpty() || task.getTaskTags().isEmpty()) {
            return 0.0;
        }
        
        long matchCount = task.getTaskTags().stream()
                .filter(currentTags::contains)
                .count();
        
        return matchCount * 150.0; // 태그 하나당 150점 가산 (임시 가중치)
    }

    private double calculateUrgency(Task task, LocalDateTime now) {
        long minutesLeft = Duration.between(now, task.getDueDate()).toMinutes();
        
        // Handle Overdue: treat as 0 minutes remaining to maximize urgency without infinity
        // Limit: As dt -> 0, Score -> W2 / K. This is the Upper Bound.
        long dt = Math.max(0, minutesLeft); 
        
        return W2_URGENCY / (dt + K_STABILITY_CONSTANT);
    }

    private double calculateGravityAdjustment(Task task) {
        int count = task.getDelayCount();
        
        // Piecewise Function for Zombie Task Policy
        if (count >= ZOMBIE_THRESHOLD) {
            return ZOMBIE_PENALTY;
        }
        
        // Warning phase: Score increases slightly as delay increases
        return count * W3_GRAVITY;
    }
}
