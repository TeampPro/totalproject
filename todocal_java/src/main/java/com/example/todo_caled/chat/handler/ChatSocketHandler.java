package com.example.todo_caled.chat.handler;

import com.example.todo_caled.chat.dto.ChatMessageDto;
import com.example.todo_caled.chat.service.ChatService;
import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatSocketHandler extends TextWebSocketHandler {

    private final ChatService chatService;
    private final Gson gson = new Gson();

    /** roomId별 세션 관리 */
    private final Map<String, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();
    /** 세션ID별 roomId */
    private final Map<String, String> sessionRoom = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // 쿼리 파라미터 추출: ws://localhost:8080/ws/chat?roomId=abc&memberName=kim
        URI uri = session.getUri();
        String query = (uri != null && uri.getQuery() != null) ? uri.getQuery() : "";
        Map<String, String> params = parseQuery(query);
        String roomId = params.get("roomId");
        String memberName = params.get("memberName");

        // 초대받은 사용자만 입장 가능하도록 검증
        if (roomId == null || memberName == null || !chatService.isMember(roomId, memberName)) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("초대받은 사용자만 입장 가능합니다."));
            log.warn("입장 거부됨: roomId={}, memberName={}", roomId, memberName);
            return;
        }

        // 정상 입장 처리
        roomSessions.computeIfAbsent(roomId, k -> Collections.synchronizedSet(new HashSet<>())).add(session);
        sessionRoom.put(session.getId(), roomId);

        log.info("WebSocket 연결됨: roomId={}, memberName={}, session={}", roomId, memberName, session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        ChatMessageDto dto = gson.fromJson(message.getPayload(), ChatMessageDto.class);
        dto.setTime(new SimpleDateFormat("yyyy/MM/dd HH:mm:ss").format(new Date()));

        String roomId = sessionRoom.get(session.getId());
        if (roomId == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("roomId 없음"));
            return;
        }

        // 멤버 검증 (보안 강화)
        if (!chatService.isMember(roomId, dto.getSender())) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("초대받은 사용자만 메시지 전송 가능"));
            return;
        }

        // DB 저장
        chatService.saveMessage(dto);

        // 같은 roomId에만 브로드캐스트
        Set<WebSocketSession> targets = roomSessions.getOrDefault(roomId, Set.of());
        for (WebSocketSession s : targets) {
            if (s.isOpen()) {
                s.sendMessage(new TextMessage(gson.toJson(dto)));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String roomId = sessionRoom.remove(session.getId());
        if (roomId != null) {
            Set<WebSocketSession> set = roomSessions.get(roomId);
            if (set != null) set.remove(session);
        }
        log.info("연결 종료: {}", session.getId());
    }

    /** 쿼리스트링 파싱 메서드 */
    private Map<String, String> parseQuery(String query) {
        Map<String, String> map = new HashMap<>();
        for (String pair : query.split("&")) {
            int idx = pair.indexOf('=');
            if (idx > 0) {
                String key = pair.substring(0, idx);
                String value = (idx + 1 < pair.length()) ? pair.substring(idx + 1) : "";
                map.put(key, value);
            }
        }
        return map;
    }
}
