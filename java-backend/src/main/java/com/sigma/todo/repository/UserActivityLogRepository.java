package com.sigma.todo.repository;

import com.sigma.todo.domain.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, Long> {
    
    @Query("SELECT l FROM UserActivityLog l WHERE l.timestamp >= :since ORDER BY l.timestamp DESC")
    List<UserActivityLog> findRecentLogs(LocalDateTime since);
}
