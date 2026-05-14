package com.sigma.todo.dto;

import com.sigma.todo.domain.EnergyLevel;
import java.util.Set;

/**
 * Client Context Injection을 위한 Request DTO
 */
public record TaskSearchRequest(
    EnergyLevel currentEnergy,
    Set<String> currentTags,
    long availableMinutes
) {
    // 팩토리 메서드나 기본값 설정 가능
    public TaskSearchRequest {
        if (currentEnergy == null) currentEnergy = EnergyLevel.MEDIUM;
        if (currentTags == null) currentTags = Set.of();
    }
}
