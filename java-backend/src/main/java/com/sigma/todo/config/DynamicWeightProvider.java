package com.sigma.todo.config;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DynamicWeightProvider {

    private final PriorityWeights weights;

    public double getImportanceWeight() { return weights.getImportance(); }
    public double getUrgencyWeight() { return weights.getUrgency(); }
    public double getGravityWeight() { return weights.getGravity(); }
    public double getContextBoostWeight() { return weights.getContextBoost(); }
}
