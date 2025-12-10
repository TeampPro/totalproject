package com.example.todo_caled.users.scheduler;

import com.example.todo_caled.users.entity.User;
import com.example.todo_caled.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * GUEST 계정 자동 정리 스케줄러.
 *
 *  - 매일 새벽 3시마다
 *  - 7일이 지난 GUEST 계정 삭제
 */
@Component
@RequiredArgsConstructor
public class GuestCleanupScheduler {

    private final UserRepository userRepository;

    // 매일 새벽 3시 (CRON: 초 분 시 일 월 요일)
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOldGuests() {
        LocalDateTime limit = LocalDateTime.now().minusDays(7);

        List<User> oldGuests = userRepository.findGuestUsersBefore(limit);
        if (oldGuests.isEmpty()) {
            return;
        }

        System.out.println("🧹 7일 지난 GUEST 계정 삭제: " + oldGuests.size() + "명");
        userRepository.deleteAll(oldGuests);
    }
}
