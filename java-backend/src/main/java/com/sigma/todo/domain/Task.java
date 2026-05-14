package com.sigma.todo.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Task Domain Entity (JPA Version)
 */
@Entity
@Table(name = "tasks", indexes = {
    @Index(name = "idx_task_user_status_energy", columnList = "userId, status, requiredEnergy")
})
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;
    private String title;
    private LocalDateTime dueDate;
    
    @Enumerated(EnumType.STRING)
    private EnergyLevel requiredEnergy;
    
    private int importance; // 1 ~ 5
    private int delayCount;
    private long estimatedEffortMinutes;
    
    @Enumerated(EnumType.STRING)
    private TaskStatus status; // PENDING, COMPLETED, SNOOZED

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "task_tags", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "tag_name")
    @BatchSize(size = 100) // N+1 문제 방지: 태그 조회 시 100개씩 묶어서 가져옴
    private Set<String> taskTags = new HashSet<>();

    protected Task() {} // JPA Proxy용

    public Task(String userId, String title, LocalDateTime dueDate, EnergyLevel requiredEnergy, 
                int importance, int delayCount, long estimatedEffortMinutes) {
        this.userId = userId;
        this.title = title;
        this.dueDate = dueDate;
        this.requiredEnergy = requiredEnergy;
        this.importance = importance;
        this.delayCount = delayCount;
        this.estimatedEffortMinutes = estimatedEffortMinutes;
        this.status = TaskStatus.PENDING;
    }

    // Getters
    public Long getId() { return id; }
    public String getUserId() { return userId; }
    public EnergyLevel getRequiredEnergy() { return requiredEnergy; }
    public int getImportance() { return importance; }
    public int getDelayCount() { return delayCount; }
    public long getEstimatedEffortMinutes() { return estimatedEffortMinutes; }
    public Set<String> getTaskTags() { return taskTags; }
    public TaskStatus getStatus() { return status; }
}

enum TaskStatus {
    PENDING, COMPLETED, SNOOZED
}
