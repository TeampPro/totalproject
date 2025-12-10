package com.example.todo_caled.users.repository;

import com.example.todo_caled.users.entity.Friendship;
import com.example.todo_caled.users.entity.Friendship.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    boolean existsByRequesterIdAndReceiverIdAndStatusIn(
            String requesterId,
            String receiverId,
            Collection<Status> statuses
    );

    List<Friendship> findByReceiverIdAndStatus(String receiverId, Status status);

    @Query("""
           select f
           from Friendship f
           where (f.requesterId = :loginId or f.receiverId = :loginId)
             and f.status = 'ACCEPTED'
           """)
    List<Friendship> findAcceptedFriends(@Param("loginId") String loginId);

    Optional<Friendship> findByIdAndReceiverId(Long id, String receiverId);

    @Query("""
       select f
       from Friendship f
       where ((f.requesterId = :userId and f.receiverId = :friendId)
           or (f.requesterId = :friendId and f.receiverId = :userId))
         and f.status = 'ACCEPTED'
       """)
    Optional<Friendship> findAcceptedFriendship(
            @Param("userId") String userId,
            @Param("friendId") String friendId
    );

}
