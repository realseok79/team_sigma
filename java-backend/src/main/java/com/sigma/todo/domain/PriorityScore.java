package com.sigma.todo.domain;

import java.util.Objects;

/**
 * Value Object representing the calculated priority score.
 */
public final class PriorityScore implements Comparable<PriorityScore> {
    private final double value;
    private final String reason;

    private PriorityScore(double value, String reason) {
        this.value = Math.max(0, value);
        this.reason = reason != null ? reason : "기본 분석 결과";
    }

    public static PriorityScore of(double value) {
        return new PriorityScore(value, null);
    }

    public static PriorityScore of(double value, String reason) {
        return new PriorityScore(value, reason);
    }

    public static PriorityScore zero() {
        return new PriorityScore(0, "제약 조건 미달");
    }

    public double getValue() {
        return value;
    }

    public String getReason() {
        return reason;
    }

    @Override
    public int compareTo(PriorityScore o) {
        return Double.compare(this.value, o.value);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PriorityScore that = (PriorityScore) o;
        return Double.compare(that.value, value) == 0 && Objects.equals(reason, that.reason);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value, reason);
    }

    @Override
    public String toString() {
        return String.format("%.2f (%s)", value, reason);
    }
}
