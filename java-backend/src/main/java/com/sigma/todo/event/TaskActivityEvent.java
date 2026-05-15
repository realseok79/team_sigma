package com.sigma.todo.event;

import com.sigma.todo.dto.ContextData;

public record TaskActivityEvent(Long taskId, String action, ContextData context) {}
