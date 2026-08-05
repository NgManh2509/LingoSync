package com.lingosync.lingo_backend.util;

import java.time.LocalDate;

public class SM2Algorithm {
    public record SM2Result(
            int newRepetitions,
            int newIntervalDays,
            double newEaseFactor,
            String newStatus,
            LocalDate nextReviewDate) {
    }

    public static SM2Result calculate(int repetitions, int intervalDays, double easeFactor, int rating) {
        int newRep = repetitions;
        int newIntervalDays = intervalDays;
        double newEF = easeFactor;

        newEF = newEF + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
        if (newEF < 1.3) {
            newEF = 1.3;
        }

        if (rating >= 3) {
            if (newRep == 0) {
                newIntervalDays = 1;
            } else if (newRep == 1) {
                newIntervalDays = 6;
            } else {
                newIntervalDays = (int) Math.round(newIntervalDays * newEF);
            }
            newRep++;

        } else {
            newRep = 0;
            newIntervalDays = 1;
        }

        String newStatus = (newRep == 0) ? "NEW"
                : (newRep == 1) ? "LEARNING" : "REVIEW";

        LocalDate nextReviewDate = LocalDate.now().plusDays(newIntervalDays);

        return new SM2Result(newRep, newIntervalDays, newEF, newStatus, nextReviewDate);
    }
}
