[![Typing SVG](https://readme-typing-svg.demolab.com?font=Pretendard&weight=800&size=60&duration=2500&pause=800&color=4FA3FF&center=true&vCenter=true&width=1000&height=120&lines=Planix)](https://git.io/typing-svg)

<div align="center">

<h3><b> 깔끔하고 직관적인 서비스 Planix </b></h3>
<p>친구들과의 일정 공유 시스템과 스케줄 관리/채팅/커뮤니티를 한꺼번에~ !</p>

</div>
<img width="1920" height="1080" alt="image-31" src="https://github.com/user-attachments/assets/b5776483-2f7c-498f-a9ca-155db3dca544" />

---

# 🐾 목차
### 1. [프로젝트 소개](#1)
- 1-1. [기획 배경](#1-1)
- 1-2. [대상](#1-2)
- 1-3. [기대 효과](#1-3)
- 1-4. [개발 기간](#1-4)

### 2. [주요 기능](#2)
- 2-1. [메인 / 홈](#2-1)
- 2-2. [로그인 및 회원정보 수정](#2-2)
- 2-3. [일정 및 스케줄 관리](#2-3)
- 2-4. [일정 / 공유 일정](#2-4)
- 2-5. [커뮤니티](#2-5)
- 2-6. [친구관리 / 채팅](#2-6)
- 2-7. [관리자 모드](#2-7)

### 3. [개발환경 및 기술스택](#3)
- 3-1. [Frontend](#3-1)
- 3-2. [Backend](#3-2)
- 3-3. [Collaboration & Communication](#3-3)

### 4. [화면 구성](#4)
- 4-1. [전체 플로우](#4-1)

### 5. [프로젝트 산출물](#5)
- 5-1. [ERD (DB 설계)](#5-1)
- 5-2. [협업 도구 – Sourcetree 활용](#5-2)

### 6. [컨벤션](#6)
- 6-1. [커밋 컨벤션](#6-1)
- 6-2. [백엔드 네이밍 규칙](#6-2)
- 6-3. [프론트엔드 네이밍 규칙](#6-3)
- 6-4. [기타 코드 규칙](#6-4)

### 7. [WebSocket & Chatting](#7)
- 7-1. [WebSocket 개념 정리](#7-1)
- 7-2. [Planix WebSocket 구조](#7-2)
- 7-3. [백엔드 실제 코드](#7-3)
- 7-4. [프론트엔드 실제 코드](#7-4)
- 7-5. [구현 요약](#7-5)

### 8. [Drag & Drop 일정 이동 정리 🧩](#8)
- 8-1. [Drag & Drop 개념 정리](#8-1)
- 8-2. [Planix에서의 Drag & Drop 흐름](#8-2)
- 8-3. [실제 코드 사용 사례](#8-3)
- 8-4. [버그 분석 & 해결 요약](#8-4)
- 8-5. [구현하며 배운 점](#8-5)
---

## <span id="1">1. 프로젝트 소개 📝</span>

### <span id="1-1">1-1. 📍 기획 배경</span>
- 개인 일정, 팀 일정, 할 일 관리, 채팅이 서로 다른 서비스에 흩어져 있어 한 번에 파악하기 어려운 불편함이 컸습니다.
- 스터디·프로젝트·모임에서 사용하는 캘린더, 투두 앱, 메신저를 하나로 합쳐 **“일정 · 할 일 · 채팅”을 한 화면에서 관리**할 수 있는 서비스를 만들고자 기획했습니다.

### <span id="1-2">1-2. 🎯 대상</span>
- 스터디 / 팀 프로젝트 / 동아리처럼 **함께 일정과 할 일을 공유해야 하는 소규모 그룹**
- 개인 일정과 팀 일정을 동시에 관리하면서, **채팅으로 바로 소통하고 싶은 사용자**
- 해야 할 일을 까먹지 않도록 캘린더와 Todo, 알림을 함께 활용하고 싶은 사람

### <span id="1-3">1-3. ✅ 기대 효과</span>
- 여러 앱을 왔다 갔다 할 필요 없이, **하나의 서비스에서 일정 · 할 일 · 채팅을 통합 관리**할 수 있습니다.
- 채팅에서 논의한 내용이 곧바로 일정·할 일로 이어져, **회의 내용과 실행 사항이 자연스럽게 연결**됩니다.
- 함께 보는 캘린더와 투두, 알림 기능을 통해 **구성원 간 일정 공유와 참여율을 높이고, 꾸준한 협업을 유도**할 수 있습니다.

### <span id="1-4">1-4. 📆 개발 기간</span>
- 2025.10.29 ~ 2025.12.10

---

## <span id="2">2. 주요 기능 🚀</span>

### <span id="2-1">2-1. 메인 / 홈</span>

<table>
  <tbody>
    <tr>
        <td>메인 화면</td>
        <td>API / 검색</td>
        <td>API / 날씨</td>
        <td>API / 카카오 지도</td>
    </tr>
    <tr>
        <td><img src="./assets/MainPage.gif" height="150px"/></td>
        <td><img src="./assets/Search.gif" height="150px" /></td>
        <td><img src="./assets/Weather.gif" height="150px" /></td>
        <td><img src="./assets/Map.gif" height="150px" /></td>
    </tr>
  </tbody>
</table>

### <span id="2-2">2-2. 로그인 및 회원정보 수정</span>

<table>
  <tbody>
    <tr> 
        <td>일반 로그인</td>
        <td>비회원 / 카카오톡 로그인</td>
        <td>회원가입 로그인</td>
        <td>회원정보 수정</td>
    </tr>
    <tr>
        <td><img src="./assets/N_login.gif" height="150px"/></td>
        <td><img src="./assets/B_Login.gif" height="150px" /></td>
        <td><img src="./assets/CreateLogin.gif" height="150px" /></td>
        <td><img src="./assets/Refact.gif" height="150px" /></td>
    </tr>
  </tbody>
</table>

### <span id="2-3">2-3. 일정 및 스케줄 관리</span>

<table>
  <tbody>
    <tr>
        <td>일정 생성</td>
        <td>Drag & Drop & 스케줄 반영</td>
        <td>수정 및 삭제</td>
        <td>할일 목록을 통한 완료 및 삭제</td>
    </tr>
    <tr>
        <td><img src="./assets/Add.gif" height="150px" /></td>
        <td><img src="./assets/DragDrop.gif" height="150px" /></td>
        <td><img src="./assets/Re_Del.gif" height="150px" /></td>
        <td><img src="./assets/ComCheck.gif" height="150px" /></td>
    </tr>
  </tbody>
</table>

### <span id="2-4">2-4. 일정 / 공유일정</span>

<table>
  <tbody>
    <tr>
        <td>공유 일정 생성</td>
        <td>공유된 친구의 일정 체크</td>
    </tr>
    <tr>
        <td><img src="./assets/PublicTodo.gif" height="200px" /></td>
        <td><img src="./assets/ShareTask.gif" height="200px" /></td>
    </tr>
  </tbody>
</table>

### <span id="2-5">2-5. 커뮤니티</span>

<table>
  <tbody>
    <tr>
        <td>커뮤니티 페이지</td>
        <td>일반 게시글 작성</td>
        <td>공지사항 작성</td>
    </tr>
    <tr>
        <td><img src="./assets/Community.gif" height="200px"/></td>
        <td><img src="./assets/FreeB.gif" height="200px" /></td>
        <td><img src="./assets/GongGi.gif" height="200px" /></td>
    </tr>
  </tbody>
</table>

### <span id="2-6">2-6. 친구관리 / 채팅</span>

<table>
  <tbody>
    <tr>
        <td>채팅 페이지</td>
        <td>친구추가 및 삭제</td>
        <td>일반 대화</td>
        <td>그룹 대화</td>
    </tr>
    <tr>
        <td><img src="./assets/ChatPage.gif" height="150px"/></td>
        <td><img src="./assets/AddFriends.gif" height="150px" /></td>
        <td><img src="./assets/OneChat.gif" height="150px" /></td>
        <td><img src="./assets/G_chat.gif" height="150px" /></td>
    </tr>
  </tbody>
</table>

### <span id="2-7">2-7. 관리자 모드</span>

<table>
  <tbody>
    <tr>
        <td>관리자 모드</td>
    </tr>
    <tr>
        <td><img src="./assets/Admin.gif" height="350px"/></td>
    </tr>
  </tbody>
</table>

---

## <span id="3">3. 개발환경 및 기술스택 🛠️</span>

<div align="center">

### <span id="3-1">3-1. 🧩 Frontend</span>

<img src="https://img.shields.io/badge/React-4FA3FF?style=for-the-badge&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-87CEFA?style=for-the-badge&logo=javascript&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-B3D9FF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/React%20Router-6CA6CD?style=for-the-badge&logo=reactrouter&logoColor=white" />
<img src="https://img.shields.io/badge/Axios-4F81BD?style=for-the-badge&logo=axios&logoColor=white" />
<img src="https://img.shields.io/badge/CSS3-6CA6CD?style=for-the-badge&logo=css3&logoColor=white" />

### <span id="3-2">3-2. ☘ Backend</span>

<img src="https://img.shields.io/badge/Java-4F81BD?style=for-the-badge&logo=openjdk&logoColor=white" />
<img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
<img src="https://img.shields.io/badge/Spring%20Security-4FA3FF?style=for-the-badge&logo=springsecurity&logoColor=white" />
<img src="https://img.shields.io/badge/Spring%20Data%20JPA-87CEFA?style=for-the-badge&logo=spring&logoColor=white" />
<img src="https://img.shields.io/badge/MariaDB-4479A1?style=for-the-badge&logo=mariadb&logoColor=white" />
<img src="https://img.shields.io/badge/WebSocket-B3D9FF?style=for-the-badge&logo=websocket&logoColor=white" />
<img src="https://img.shields.io/badge/JWT-2F4F4F?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
<img src="https://img.shields.io/badge/Lombok-4FA3FF?style=for-the-badge&logo=databricks&logoColor=white" />

<!-- 필요하면 기타 기술도 아래에 추가 가능 (캐시, 리트라이 등)
<img src="https://img.shields.io/badge/Caffeine%20Cache-87CEFA?style=for-the-badge" />
<img src="https://img.shields.io/badge/Resilience4j-B3D9FF?style=for-the-badge" />
-->

### <span id="3-3">3-3. 🐧 Collaboration & Communication</span>

<img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" />
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
<img src="https://img.shields.io/badge/Sourcetree-0052CC?style=for-the-badge&logo=sourcetree&logoColor=white" />
<img src="https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white" />
<img src="https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white" />

### 🦭 Deployment

<!-- 실제로 사용한 배포 환경만 남겨 주세요. 아래는 예시입니다. -->
<!--
<img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white" />
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
-->
</div>

---

## <span id="4">4. 화면 구성 💻</span>

### <span id="4-1">4-1. 📂 전체 플로우</span>

```text
비회원 / 로그인
 ├─ 비회원 모드 (제한된 기능)
 └─ 로그인 (일반 / 카카오)
      └─ 메인 대시보드
          ├─ 오늘 / 주간 일정 · 할 일 요약
          ├─ 검색 API (장소·정보 검색)
          ├─ 날씨 위젯
          └─ 카카오 지도 (위치 기반 기능)

메인 대시보드
 ├─ 캘린더 / 스케줄 관리
 │    ├─ 일정 생성 / 수정 / 삭제
 │    ├─ Drag & Drop 으로 일정 시간 변경
 │    ├─ 실시간 스케줄 반영
 │    └─ 개인 Todo 완료 / 삭제
 ├─ 일정 / 공유 일정
 │    ├─ 개인 일정 / 공유 일정 분리 생성
 │    ├─ D-Day 표시
 │    └─ 공유된 친구 일정 확인
 ├─ 커뮤니티
 │    ├─ 일반 게시글 / 공지사항 작성
 │    ├─ 게시글 조회 / 댓글
 │    └─ 게시글 수정 / 삭제
 ├─ 친구 관리 / 채팅
 │    ├─ 친구 추가 / 삭제
 │    ├─ 1:1 채팅
 │    └─ 그룹 채팅
 └─ 마이페이지 / 관리자
      ├─ 회원정보 수정 (닉네임, 비밀번호 등)
      └─ 관리자 모드 (회원 관리, 게시글 관리 등)
```

---

## <span id="5">5. 프로젝트 산출물 📦</span>

#### <span id="5-1">5-1. ERD (DB 설계)</span>

<p align="center">
  <img src="./assets/ERdia.png" alt="Planix ERD" width="900" />
</p>

#### 📘 E-R Dia 요약

- **users** : 서비스 회원 계정을 관리하는 핵심 엔티티
    - 로그인 계정(`id`, `password`)과 프로필 정보(`email`, `name`, `nickname`, `profile_image` 등)을 저장
    - `user_type`을 통해 일반회원 / 관리자 / 카카오 연동 계정을 구분

- **tasks** : 개인 및 공유 일정을 관리하는 엔티티
    - 할 일 제목과 내용(`title`, `content`), 생성일(`created_date`), 마감일(`promise_date`)을 저장
    - `owner_id`(= `users.id`)로 일정 소유자를 식별하고, `shared` / `completed`로 공유 여부와 완료 여부를 관리

- **board_post / comment** : 게시판과 댓글(대댓글)을 관리하는 엔티티
    - `board_post`는 공지·자유·Q&A 등 게시글(`category`, `title`, `content`, `writer` 등)을 관리
    - `comment`는 각 게시글에 대한 댓글을 관리하며, `parent_id`를 이용해 대댓글 계층 구조를 표현

- **chat_room / chat_room_member / chat_message** : 실시간 채팅 기능을 위한 엔티티
    - `chat_room`은 채팅방 정보(`id`, `name`, `participant_count`, 초대코드 등`)를 관리
    - `chat_room_member`는 방별 참여자 목록(`room_id`, `member_name`, `joined_at`)을 관리
    - `chat_message`는 각 방에서 주고받은 메시지(`sender`, `room_id`, `message`, `sent_at`)를 기록

- **friendships** : 사용자 간 친구 관계를 관리하는 엔티티
    - `requester_id`와 `receiver_id`(모두 `users.id`)를 통해 유저–유저 관계를 표현
    - `status`(PENDING, ACCEPTED, REJECTED 등)와 `created_at`, `responded_at`으로 친구 신청 상태를 관리

- **holiday** : 공휴일 정보를 관리하는 엔티티
    - 휴일 이름(`name`), 날짜(`date`), 공휴일 여부(`is_holiday`)를 저장하여 일정 화면에서 참고용으로 사용

**주요 관계**

- 한 명의 사용자(`users`)는 여러 일정(`tasks`), 게시글(`board_post`), 댓글(`comment`), 채팅 메시지(`chat_message`)를 가질 수 있음 (**1:N 관계**)
- `friendships`를 통해 사용자(`users`) 간 **N:N 친구 관계**를 중간 테이블로 표현
- `chat_room`과 `chat_room_member`, `chat_message`는 **1:N 관계**로 채팅방별 참여자와 메시지 이력을 관리

#### <span id="5-2">5-2. 🌳 협업 도구 – Sourcetree 활용</span>
<p align="center"> <img src="./assets/sourcetree.png" alt="Sourcetree 사용 캡처" width="700" /> </p>

Git 명령어 대신 Sourcetree GUI를 사용해 브랜치, 커밋, 머지 과정을 직관적으로 관리했습니다.

기능 단위로 커밋을 쌓고, 커밋 그래프를 통해 변경 이력과 병합 흐름을 시각적으로 확인하면서 작업했습니다.

원격 저장소(GitHub)와의 Push / Pull / Fetch 작업을 Sourcetree에서 수행하여, 팀원 간 코드 동기화를 관리했습니다.

변경 파일 비교, 커밋 메시지 작성, 간단한 충돌 해결 등도 Sourcetree 화면에서 처리해 작업 흐름을 정리했습니다.
---

## <span id="6">6. 컨벤션 📐</span>

- ### <span id="6-1">6-1. 📝 커밋 컨벤션</span>
```text
feat    : 새로운 기능 추가
fix     : 버그 수정
docs    : 문서 수정 (README 등)
style   : 코드 포맷팅, 세미콜론 누락 등 (로직 변경 없음)
refactor: 코드 리팩토링 (기능 변경 없이 구조 개선)
test    : 테스트 코드 추가 / 수정
chore   : 빌드, 패키지, 설정 파일 등의 기타 변경

```
- ### <span id="6-2">6-2. Backend (Java / Spring)</span>

```text
클래스명: 파스칼 케이스 예) UserService, ChatRoomController

메서드/변수명: 카멜 케이스 예) getUserInfo, chatRoomId

상수: 대문자 + 언더바(_) 예) DEFAULT_PAGE_SIZE

DTO

요청 DTO: SomethingRequestDto

응답 DTO: SomethingResponseDto
```

- ### <span id="6-3">6-3. Frontend (React)</span>

```text
컴포넌트: 파스칼 케이스 예) ChatPage.jsx

일반 함수/변수: 카멜 케이스 예) fetchUserList, userName

API 요청 함수: xxxReq 접미사 예) loginReq, createRoomReq

이벤트 핸들러: onXxxHandler 예) onClickLoginHandler, onChangeInputHandler
```
- ### <span id="6-4">6-4. 기타 코드 규칙</span>
```text
한 파일에는 하나의 주 책임(SRP)을 가지도록 구성

불필요한 콘솔 로그/주석은 PR 전 제거

공통 스타일 / 공통 컴포넌트는 별도 디렉토리로 분리
```

---

## <span id="7">7. WebSocket 실시간 채팅 정리 🔌</span>

### <span id="7-1">7-1. WebSocket 개념 정리</span>

- **정의**
  - 웹 브라우저와 서버 간에 **하나의 TCP 연결을 유지**하면서 양방향 통신을 할 수 있게 해주는 프로토콜.
  - HTTP처럼 요청 → 응답 후 끊는 구조가 아니라, 연결을 유지한 상태에서 **서버 → 클라이언트 푸시**가 가능함.
- **Planix에서의 역할**
  - 채팅 메시지를 **실시간으로 모든 참여자에게 전파**하기 위해 사용.
  - 새로고침, 일정 폴링(polling) 없이도 **메시지가 바로 모든 참여자 화면에 반영**되도록 구현.

---

### <span id="7-2">7-2. Planix WebSocket 구조 한눈에 보기</span>

1. **백엔드 (Spring WebSocket)**
  - `/ws/chat` 엔드포인트에 WebSocket 핸들러 등록
  - `ChatSocketHandler` 에서 연결/메시지/종료 이벤트 처리
  - `ChatService` 와 연동해서 **방 멤버 검증 + 메시지 DB 저장**
2. **프론트엔드 (React)**
  - `ChatRoom.jsx` 에서 `new WebSocket(...)` 으로 서버에 연결
  - `roomId`, `memberName` 을 쿼리 파라미터로 전송
  - `onmessage` 이벤트에서 수신 메시지를 상태에 반영
  - `sendMessage` 함수로 JSON 포맷의 메시지 전송

---

### <span id="7-3">7-3. 백엔드 실제 코드</span>

#### 7-3-1. WebSocket 설정 – `ChatWebSocketConfig`

```java
// src/main/java/com/example/todo_caled/config/ChatWebSocketConfig.java
package com.example.todo_caled.config;

import com.example.todo_caled.chat.handler.ChatSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class ChatWebSocketConfig implements WebSocketConfigurer {

    private final ChatSocketHandler chatSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatSocketHandler, "/ws/chat")
                .setAllowedOriginPatterns("*");
    }
}
```
- @EnableWebSocket : Spring WebSocket 기능 활성화.
- /ws/chat 경로로 들어오는 WebSocket 연결을 ChatSocketHandler 가 처리하도록 등록.
- CORS 문제를 피하기 위해 개발 단계에서는 setAllowedOriginPatterns("*") 로 모든 Origin 허용.

#### 7-3-2. 연결 시 로직 – ChatSocketHandler.afterConnectionEstablished
```java
// src/main/java/com/example/todo_caled/chat/handler/ChatSocketHandler.java

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

        // roomId 기준 세션 목록 가져오기 (없으면 생성)
        Set<WebSocketSession> sessions =
                roomSessions.computeIfAbsent(roomId, k -> Collections.synchronizedSet(new HashSet<>()));

        // 같은 닉네임이 이미 접속해 있다면 기존 세션 정리
        for (WebSocketSession s : new HashSet<>(sessions)) {
            String existingName = (String) s.getAttributes().get("memberName");
            if (memberName.equals(existingName)) {
                try {
                    s.close(CloseStatus.NORMAL.withReason("중복 접속으로 인한 종료"));
                } catch (Exception e) {
                    log.warn("중복 세션 종료 중 예외 발생", e);
                }
                sessions.remove(s);
            }
        }

        // 세션에 roomId / memberName 저장
        session.getAttributes().put("roomId", roomId);
        session.getAttributes().put("memberName", memberName);

        sessions.add(session);
        sessionRoom.put(session.getId(), roomId);

        // 입장 시스템 메시지 생성
        ChatMessageDto enterMsg = ChatMessageDto.builder()
                .roomId(roomId)
                .sender("SYSTEM")
                .message(memberName + "님이 입장했습니다.")
                .time(new SimpleDateFormat("yyyy/MM/dd HH:mm:ss").format(new Date()))
                .systemMessage(true)
                .build();

        // 입장 시스템 메시지 전송
        broadcast(roomId, enterMsg);

        // 참가자 목록 갱신
        broadcastMemberList(roomId);

        log.info("WebSocket 연결됨: roomId={}, memberName={}, session={}", roomId, memberName, session.getId());
    }
}
```
- 코드설명
  - 쿼리 파라미터 파싱
    roomId, memberName 을 URL 쿼리에서 직접 추출하여 어떤 방에 어떤 이름으로 들어온 건지 식별.

- 입장 권한 검증
  - chatService.isMember(roomId, memberName) 를 통해 해당 방에 초대/등록된 사용자만 접속 허용.
  - roomSessions / sessionRoom 관리
  - roomSessions : roomId → 해당 방에 접속한 WebSocketSession 목록
  - sessionRoom : sessionId → roomId (반대로도 조회 가능하게 맵 유지)

- 중복 닉네임 처리
  - 같은 방에 동일 memberName 이 이미 접속해 있으면 기존 세션을 종료하고 새 세션만 유지.
  - SYSTEM 메시지 + 참여자 목록 브로드캐스트
  - 입장 시 "OOO님이 입장했습니다." 시스템 메시지 생성 후 해당 방 전체에 전송.
  - 이어서 broadcastMemberList(roomId) 로 현재 방 참여자 리스트를 다시 내려 줘서,
  프론트에서 현재 접속 인원 UI를 최신 상태로 유지할 수 있게 함.

#### 7-3-3. 메시지 수신 처리 – handleTextMessage
```java
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
```
- 코드 설명

  - 클라이언트에서 온 JSON 페이로드를 ChatMessageDto 로 역직렬화.
  - sessionRoom 을 통해 이 세션이 어느 roomId 에 속해 있는지 확인.
  - 다시 한 번 chatService.isMember 로 보낸 사람이 실제 방 멤버인지 검증하여 악의적인 요청 방지.
  - chatService.saveMessage(dto) 로 DB에 채팅 로그 저장 → 새로고침/재접속 시 기록을 다시 조회 가능.
  - 같은 roomId 에 접속한 세션 목록에만 메시지를 브로드캐스트.

#### 7-3-4. 쿼리 파라미터 파싱 유틸 – parseQuery
```java
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
```
- 코드 설명
  - roomId=xxx&memberName=yyy 형태의 쿼리 문자열을 직접 파싱.
  - WebSocket 연결 시 roomId, memberName 을 쉽게 꺼내 쓰기 위해 별도 유틸 메서드로 분리.

### <span id="7-4">7-4. 프론트엔드 실제 코드 – ChatRoom.jsx</span>
#### 7-4-1. WebSocket 연결 – `connectWebSocket`

```jsx
// src/components/Chat/ChatRoom.jsx (발췌)

const [isConnected, setIsConnected] = useState(false);
const ws = useRef(null);
const reconnectTimer = useRef(null);
const nickname = useRef(""); // 현재 로그인한 사용자 닉네임
const WS_BASE = import.meta.env.VITE_WS_BASE_URL; // 필요 시 배포용 ws/wss 주소

const connectWebSocket = () => {
  if (ws.current && ws.current.readyState === WebSocket.OPEN) return;
  if (!roomId || !nickname.current) return;

  // ✅ dev: "/ws/..." (Vite proxy) / prod: "wss://<백엔드>/ws/..."
  const socket = new WebSocket(
    `${WS_BASE || ""}/ws/chat?roomId=${roomId}&memberName=${encodeURIComponent(
      nickname.current
    )}`
  );

  ws.current = socket;

  socket.onopen = () => {
    setIsConnected(true);
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // 🔹 방 멤버 목록 갱신 메시지 처리
    const mergeMembers = (list) => {
      if (!Array.isArray(list)) return;
      setMembers((prev) => {
        const merged = [...prev];
        const exists = new Set(prev.map((m) => getMemberKey(m)));

        list.forEach((m) => {
          const key = getMemberKey(m);
          if (key && !exists.has(key)) {
            exists.add(key);
            merged.push(m);
          }
        });

        return merged;
      });
    };

    if (data.type === "MEMBER_LIST" && Array.isArray(data.members)) {
      mergeMembers(data.members);
      return;
    }

    // 🔹 시스템 메시지 / 일반 메시지 공통 처리
    if (data.roomId === roomId) {
      setMessages((prev) => [...prev, data]);
    }
  };

  socket.onerror = (err) => {
    console.error("⚠️ WebSocket 오류:", err);
  };

  socket.onclose = () => {
    setIsConnected(false);

    // 간단한 재연결 시도
    if (!reconnectTimer.current) {
      reconnectTimer.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    }
  };
};

useEffect(() => {
  // 방 입장 시 자동 연결
  connectWebSocket();
  return () => {
    if (ws.current) {
      ws.current.close();
    }
  };
}, [roomId]);
```
- 코드 설명
    - 쿼리 파라미터로 roomId / memberName 전송
→ 백엔드 afterConnectionEstablished 에서 그대로 파싱해서 사용.
- onmessage 처리 
    - type === "MEMBER_LIST" 인 경우, 멤버 목록을 머지해서 참여자 리스트 UI 갱신.
    - 그 외에는 현재 방의 roomId 와 일치하면 메시지 배열에 추가해 채팅창에 렌더링.
- 재연결 로직 
    - onclose 시 3초 후 connectWebSocket() 을 다시 호출하는 간단한 재시도 구조.
  
#### 7-4-2. 메시지 전송 – sendMessage
```jsx
  const [msg, setMsg] = useState("");
  
  const sendMessage = () => {
    if (!msg.trim()) return;
  
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      alert("서버와 연결이 끊어졌습니다.");
      return;
    }
  
    ws.current.send(
      JSON.stringify({
        type: "chat",
        sender: nickname.current,
        message: msg,
        roomId,
      })
    );
  
    setMsg("");
  };
```
- 코드 설명
  - 비어 있는 문자열은 전송하지 않도록 trim() 체크. 
  - WebSocket 연결 상태가 OPEN 이 아닐 경우 사용자에게 알림.
  - 백엔드에서 사용 중인 ChatMessageDto 포맷에 맞춰 type, sender, message, roomId 를 JSON 으로 보내면,
handleTextMessage → chatService.saveMessage → 같은 방 세션으로 브로드캐스트 흐름이 동작.

#### <span id="7-5">7-5. WebSocket 구현 요약</span>

- ChatWebSocketConfig 로 /ws/chat 엔드포인트를 열고
- ChatSocketHandler 에서 입장 검증, 세션 관리, 시스템 메시지, 브로드캐스트, 멤버 목록 갱신을 처리하며,
- React ChatRoom.jsx 에서 실제 WebSocket 연결·재연결·메시지 전송·수신 처리를 담당.

## <span id="8">8. Drag & Drop 일정 이동 정리 🧩 </span>

#### <span id="8-1">8-1. Drag & Drop 개념 정리</span>

    - 정의
      - 사용자가 마우스로 요소를 끌어서(drag) 다른 위치에 놓는(drop) 상호작용.
      - 브라우저 기본 Drag & Drop API나,
      캘린더/보드 라이브러리(예: 드래그 이벤트 콜백)를 활용해 구현할 수 있음.

  - Planix에서의 역할
    - 캘린더에서 일정을 다른 날짜로 옮길 때 사용.
    - 일정의 시간대(시·분·초)는 유지하면서 날짜만 변경하는 UX를 목표로 함.

#### <span id="8-2">8-2. Planix에서의 Drag & Drop 활용 흐름</span>

      - 사용자가 캘린더에서 일정 카드(Event)를 다른 날짜로 드래그
      - 드롭 시점에 기존 시작/종료 시간 + 새로운 날짜 정보를 조합
      - 백엔드 /api/tasks/{id} 에 PUT 요청으로 업데이트
      - 응답으로 수정된 일정 정보를 받아 tasks 상태를 갱신
      - 캘린더·타임라인에서 새 위치에 다시 렌더링

#### <span id="8-3">8-3. 실제 코드 사용 사례 (프론트 예시)</span>

* 아래는 날짜만 변경하고 시간은 그대로 유지하기 위한 핵심 로직 예시입니다.
```jsx
// 날짜만 교체하는 유틸 함수 (예시)
const updateDateOnly = (dateTimeStr, newDateStr) => {
// "2025-12-09 10:00:00" -> ["2025-12-09", "10:00:00"]
const [oldDate, time] = dateTimeStr.split(" ");
return `${newDateStr} ${time}`; // "2025-12-11 10:00:00"
};

// 드롭 이벤트 핸들러 (예시)
const onEventDrop = async ({ event, newStartDate }) => {
// event: 기존 일정 정보, newStartDate: 사용자가 드롭한 날짜 문자열 (YYYY-MM-DD)
const updatedStart = updateDateOnly(event.startDateTime, newStartDate);
const updatedEnd = updateDateOnly(event.endDateTime, newStartDate);

const payload = {
...event,
startDateTime: updatedStart,
endDateTime: updatedEnd,
};

// 백엔드에 일정 업데이트 요청
await axios.put(`/api/tasks/${event.id}`, payload);

// 프론트 상태 갱신
setTasks((prev) =>
prev.map((task) =>
task.id === event.id ? { ...task, ...payload } : task
)
);
};

```
  - updateDateOnly 함수로 날짜 문자열만 교체하고 시간(HH:mm:ss)은 그대로 유지.
  - 이렇게 하면 Drag & Drop으로 날짜를 옮겨도
  “10시~11시 일정은 여전히 10시~11시”로 표시되면서 날짜만 바뀌는 UX를 구현 가능.

#### <span id="8-4">8-4. Drag & Drop 버그 분석 & 해결 요약</span>

* 이 부분은 실제로 발생했던 오류를 기반으로 정리한 내용입니다.

    - 문제
      - Drag & Drop 후 캘린더에서는 정상 표시되지만,
      - 타임라인에서는 일정 바가 이상한 위치/길이로 표시되는 현상.

    - 원인
      - 코드에서 startDateTime의 날짜만 새로 설정하고
      - endDateTime은 이전 날짜 그대로 두는 경우가 있음.
      - 결과적으로 시작 날짜와 종료 날짜가 서로 다른 일정이 생기면서
      타임라인 계산 로직이 꼬임.

    - 해결
      - 시작/종료 둘 다 updateDateOnly 같은 방식으로
      - 동일한 새 날짜로 재조합하도록 수정.
        - 즉, 
          - 원래: 2025-12-09 10:00:00 ~ 2025-12-09 11:00:00 
          - 이동: 2025-12-11 10:00:00 ~ 2025-12-11 11:00:00
        - 결과 
          - 타임라인에서도 막대 위치·길이가 정상적으로 계산되고,
          - 사용자가 기대하는 **“날짜만 옮기는 Drag & Drop”**이 정확히 동작.

#### <span id="8-5">8-5. Drag & Drop 구현에서 배운 점</span>
  - 단순히 화면에서만 옮긴 것처럼 보이게 하는 것이 아니라,
  - DB에 저장되는 날짜/시간 구조까지 같이 고려해야 한다는 점.
    - 특히 타임라인, D-Day 계산, 알림 등
    “시간 계산”이 많이 들어가는 기능과 연결되기 때문에
    start/end를 다룰 때 날짜·시간을 명확히 분리해서 처리하는 습관이 중요하다고 느꼈습니다.
