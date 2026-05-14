package com.sigma.todo.domain;

import java.time.LocalDateTime;

/**
 * Strategy interface for priority calculation.
 */
public interface PriorityCalculationStrategy {
    /**
     * Calculates the priority score for a given task.
     * 
     * @param task The task to evaluate
     * @param now Current reference time
     * @param availableMinutes User's current available time (Hard constraint)
     * @return Calculated PriorityScore
     * 
     * [Performance Note]
     * In a production environment, this result can be cached in Redis with a TTL.
     * For high-volume tasks, consider a @Scheduled batch job to pre-calculate
     * scores every 15-30 minutes to reduce real-time computation overhead.
     */
    PriorityScore calculate(Task task, LocalDateTime now, long availableMinutes, java.util.Set<String> currentTags);
}
