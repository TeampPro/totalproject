// src/api/friendApi.js
import axios from "../api/setupAxios"; // ✅ 공통 axios 설정 사용

// 내 친구 목록
export const fetchFriends = async (userId) => {
  const res = await axios.get("/api/friends", {
    params: { userId },
  });
  return res.data;
};

// 받은 친구 요청 목록
export const fetchFriendRequests = async (userId) => {
  const res = await axios.get("/api/friends/requests", {
    params: { userId },
  });
  return res.data;
};

// 기존 이름과 호환 (FriendPage에서 fetchReceivedRequests 쓰는 경우 대비)
export const fetchReceivedRequests = fetchFriendRequests;

// 친구 요청 보내기
export const sendFriendRequest = async (fromUserId, toUserId) => {
  const res = await axios.post("/api/friends/requests", {
    requesterId: fromUserId,
    receiverId: toUserId,
  });
  return res.data;
};

// 친구 요청 수락
export const acceptFriendRequest = async (requestId, userId) => {
  const res = await axios.post(
    `/api/friends/requests/${requestId}/accept`,
    null,
    {
      params: { userId },
    }
  );
  return res.data;
};

// 친구 요청 거절
export const rejectFriendRequest = async (requestId, userId) => {
  const res = await axios.post(
    `/api/friends/requests/${requestId}/reject`,
    null,
    {
      params: { userId },
    }
  );
  return res.data;
};

// 친구 삭제
export const deleteFriend = async (userId, friendId) => {
  const res = await axios.delete("/api/friends", {
    params: { userId, friendId },
  });
  return res.data;
};

// 혹시 다른 파일에서 쓰고 있을지도 모를 이름도 같이 export
export const acceptFriend = acceptFriendRequest;
export const rejectFriend = rejectFriendRequest;
