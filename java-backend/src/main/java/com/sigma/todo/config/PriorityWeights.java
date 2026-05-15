package com.sigma.todo.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "sigma.priority.weights")
@Getter
@Setter
public class PriorityWeights {
    private double importance = 100.0;
    private double urgency = 5000.0;
    private double gravity = 50.0;
    private double contextBoost = 150.0;
}
