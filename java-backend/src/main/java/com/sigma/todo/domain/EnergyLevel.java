package com.sigma.todo.domain;

/**
 * 사용자 및 작업의 에너지 레벨을 정의하는 Enum
 */
public enum EnergyLevel {
    LOW(1),
    MEDIUM(2),
    HIGH(3);

    private final int rank;

    EnergyLevel(int rank) {
        this.rank = rank;
    }

    public int getRank() {
        return rank;
    }

    public boolean canHandle(EnergyLevel taskEnergy) {
        return this.rank >= taskEnergy.getRank();
    }
}
