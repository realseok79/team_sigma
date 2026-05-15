package com.sigma.todo.repository;

import com.sigma.todo.domain.EnergyLevel;
import com.sigma.todo.domain.Task;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * N+1 문제를 방지하면서 하드 컨스트레인트(에너지 레벨)를 필터링하여 조회
     * @EntityGraph를 사용하여 taskTags를 한 번에 JOIN FETCH 함
     */
    @EntityGraph(attributePaths = {"taskTags"})
    @Query("SELECT t FROM Task t WHERE t.userId = :userId " +
           "AND t.isActive = true " + // Soft Delete 필터
           "AND t.status = 'PENDING' " +
           "AND t.requiredEnergy <= :userEnergy")
    List<Task> findExecutableTasks(String userId, EnergyLevel userEnergy);
}
