package com.lingosync.lingo_backend.util;

public final class GamificationUtils {

    private static final double BASE_EXP = 100.0;
    private static final double EXPONENT = 1.5;

    private GamificationUtils() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    public static int calculateLevel(int totalXp) {
        if (totalXp <= 0) {
            return 1;
        }
        double progress = (double) totalXp / BASE_EXP;
        return (int) Math.floor(Math.pow(progress, 1.0 / EXPONENT)) + 1;
    }

    public static int getXpForLevel(int level) {
        if (level <= 1) {
            return 0;
        }
        return (int) Math.ceil(BASE_EXP * Math.pow(level - 1, EXPONENT));
    }

    public static int getXpRequiredForNextLevel(int currentLevel) {
        return getXpForLevel(currentLevel + 1) - getXpForLevel(currentLevel);
    }
}
