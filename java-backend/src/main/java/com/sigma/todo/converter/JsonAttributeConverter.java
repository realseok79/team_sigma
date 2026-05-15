package com.sigma.todo.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sigma.todo.dto.ContextData;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Converter
@Component
@RequiredArgsConstructor
public class JsonAttributeConverter implements AttributeConverter<ContextData, String> {

    private final ObjectMapper objectMapper;

    @Override
    public String convertToDatabaseColumn(ContextData attribute) {
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON serialization error", e);
        }
    }

    @Override
    public ContextData convertToEntityAttribute(String dbData) {
        try {
            return objectMapper.readValue(dbData, ContextData.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON deserialization error", e);
        }
    }
}
