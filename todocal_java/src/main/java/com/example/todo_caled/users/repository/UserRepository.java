package com.example.todo_caled.users.repository;

import com.example.todo_caled.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 로그인 아이디(String id) 기준으로 사용자 조회.
     *  - 여러 곳에서 이 메서드를 사용 중 (로그인, 프로필 조회 등).
     */
    User findById(String id);

    /**
     * 7일 지난 GUEST 계정 정리를 위한 조회.
     *  - userType = 'GUEST'
     *  - createdAt < limit
     */
    @Query("SELECT u FROM User u WHERE u.userType = 'GUEST' AND u.createdAt < :limit")
    List<User> findGuestUsersBefore(@Param("limit") LocalDateTime limit);

    User findByKakaoId(String kakaoId);
    boolean existsByKakaoId(String kakaoId);

    List<User> findByUserTypeNotIgnoreCase(String userType);

    @Query("""
       SELECT u FROM User u
       WHERE LOWER(u.id)       LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%'))
       """)
    List<User> searchByIdOrNickname(@Param("keyword") String keyword);
}
