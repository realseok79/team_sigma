package com.sigma.todo.dto;

import com.sigma.todo.domain.EnergyLevel;
import java.util.Set;

/**
 * 행동 기록 시점의 컨텍스트 스냅샷
 */
public record ContextData(
    EnergyLevel energyLevel,
    Set<String> locationTags,
    long availableMinutes,
    Double dwellTimeSeconds // 선택적 필드 (의미 있는 행동 분석용)
) {}
