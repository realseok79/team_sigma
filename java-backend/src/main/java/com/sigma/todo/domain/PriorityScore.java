package com.sigma.todo.domain;

import java.util.Objects;

/**
 * Value Object representing the calculated priority score.
 */
public final class PriorityScore implements Comparable<PriorityScore> {
    private final double value;

    private PriorityScore(double value) {
        // Ensure score is not negative (unless specified by policy, 
        // but here 0 is the hard constraint floor)
        this.value = Math.max(0, value);
    }

    public static PriorityScore of(double value) {
        return new PriorityScore(value);
    }

    public static PriorityScore zero() {
        return new PriorityScore(0);
    }

    public double getValue() {
        return value;
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
        return Double.compare(that.value, value) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return String.format("%.2f", value);
    }
}
