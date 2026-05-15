package com.sigma.todo.service;

import com.sigma.todo.config.DynamicWeightProvider;
import com.sigma.todo.config.PriorityWeights;
import com.sigma.todo.domain.UserActivityLog;
import com.sigma.todo.repository.UserActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * [Zero Configuration] 백그라운드 가중치 학습 엔진
 * 사용자의 행동 로그를 분석하여 자정마다 가중치를 조용히(Invisibly) 업데이트합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdaptiveWeightEngine {

    private final UserActivityLogRepository logRepository;
    private final PriorityWeights weights;
    private final DynamicWeightProvider weightProvider;

    private static final double SMOOTHING_FACTOR = 0.2; // [Weight Smoothing] 20%만 반영

    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정 실행
    @Transactional
    public void dailyWeightLearning() {
        log.info("자정 가중치 학습 시작...");
        
        // 1. 최근 24시간 로그 조회
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        List<UserActivityLog> recentLogs = logRepository.findRecentLogs(yesterday);
        
        if (recentLogs.isEmpty()) {
            log.info("분석할 로그가 없어 학습을 건너뜁니다.");
            return;
        }

        // 2. 가중치 후보 계산 (Negative Feedback 분석)
        // 예: SNOOZED나 IGNORED가 많으면 미루는 작업에 대한 Gravity(패널티) 가중치 상향 제안
        long negativeCount = recentLogs.stream()
                .filter(l -> isNegativeAction(l.getActionType().name()))
                .count();

        double targetGravity = weights.getGravity();
        if (negativeCount >= 5) {
            targetGravity *= 1.2; // 20% 상향 제한 없이 계산
        }

        // 3. Weight Smoothing (이동 평균 적용하여 급격한 변화 방지)
        double smoothedGravity = (targetGravity * SMOOTHING_FACTOR) + (weights.getGravity() * (1 - SMOOTHING_FACTOR));
        
        // 4. 안전장치 적용 (Clipping & Normalization)
        // 기존 Provider의 로직을 재사용하여 안전하게 업데이트
        weights.setGravity(smoothedGravity);
        weightProvider.updateWeightsManually(recentLogs); 

        log.info("자정 가중치 학습 완료. 새로운 Gravity 가중치: {}", weights.getGravity());
    }

    private boolean isNegativeAction(String actionType) {
        return actionType.equals("SNOOZED") || 
               actionType.equals("IGNORED") || 
               actionType.equals("ARCHIVE_SUGGESTION_REJECTED");
    }
}
