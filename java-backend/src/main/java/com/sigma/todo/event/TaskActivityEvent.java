package com.sigma.todo.event;

public record TaskActivityEvent(Long taskId, String action) {}
