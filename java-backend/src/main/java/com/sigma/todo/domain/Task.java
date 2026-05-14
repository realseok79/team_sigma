package com.sigma.todo.domain;

import java.time.LocalDateTime;

/**
 * Task Domain Entity
 */
public class Task {
    private String id;
    private String title;
    private LocalDateTime dueDate;
    private int importance; // 1 ~ 5
    private int delayCount;
    private long estimatedEffortMinutes;

    public Task(String id, String title, LocalDateTime dueDate, int importance, int delayCount, long estimatedEffortMinutes) {
        this.id = id;
        this.title = title;
        this.dueDate = dueDate;
        this.importance = importance;
        this.delayCount = delayCount;
        this.estimatedEffortMinutes = estimatedEffortMinutes;
    }

    // Getters
    public String getId() { return id; }
    public LocalDateTime getDueDate() { return dueDate; }
    public int getImportance() { return importance; }
    public int getDelayCount() { return delayCount; }
    public long getEstimatedEffortMinutes() { return estimatedEffortMinutes; }
}
