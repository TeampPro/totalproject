package com.example.todo_caled.chat.scheduler;

import com.example.todo_caled.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatCleanupScheduler {

    private final ChatService chatService;

    @Scheduled(cron = "0 0 3 * * *")
    public void sheduledCleanup() {
        chatService.cleanupOldMessages();
        log.info("30일 지난 채팅 메시지 자동 삭제 완료");
    }

}
