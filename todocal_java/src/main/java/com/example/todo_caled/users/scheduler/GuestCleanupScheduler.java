package com.example.todo_caled.users.scheduler;

import com.example.todo_caled.users.entity.User;
import com.example.todo_caled.users.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class GuestCleanupScheduler {

    private final UserRepository userRepository;

    public GuestCleanupScheduler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Scheduled(cron = "0 0 3 * * ?") // 매일 새벽 3시
    public void deleteOldGuestAccounts() {
        LocalDateTime limitDate = LocalDateTime.now().minusDays(7);

        List<User> oldGuests = userRepository.findGuestUsersBefore(limitDate);

        if (!oldGuests.isEmpty()) {
            userRepository.deleteAll(oldGuests);
            System.out.println("🧹 7일 지난 guest 계정 삭제: " + oldGuests.size() + "명");
        }

    }
}
