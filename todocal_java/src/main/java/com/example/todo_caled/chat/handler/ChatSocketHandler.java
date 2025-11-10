package com.example.todo_caled.chat.handler;

import com.example.todo_caled.chat.dto.ChatMessageDto;
import com.example.todo_caled.chat.entity.ChatMessage;
import com.example.todo_caled.chat.service.ChatService;
import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatSocketHandler extends TextWebSocketHandler {

    private final ChatService chatService;
    private final Set<WebSocketSession> sessions = Collections.synchronizedSet(new HashSet<>());
    private final Gson gson = new Gson();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        log.info("WebSoket 연결됨: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        ChatMessageDto dto = gson.fromJson(message.getPayload(), ChatMessageDto.class);
        dto.setTime(new SimpleDateFormat("HH:mm:ss").format(new Date()));

        // DB 저장
        chatService.saveMessage(dto);

        // 브로드 캐스트
        for (WebSocketSession s : sessions) {
            s.sendMessage(new TextMessage(gson.toJson(dto)));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        log.info("연결종료 {}", session.getId());
    }
}
