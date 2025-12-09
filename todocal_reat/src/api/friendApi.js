// src/api/friendApi.js
import axios from "./setupAxios"; // ✅ 같은 폴더 기준

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

export const fetchReceivedRequests = fetchFriendRequests;

// ✅ 아이디 또는 닉네임으로 유저 검색
export const searchUsers = async (keyword) => {
  const res = await axios.get("/api/users/search", {
    params: { keyword },
  });
  return res.data; // [{id, nickname, name, email, ...}, ...]
};

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

export const acceptFriend = acceptFriendRequest;
export const rejectFriend = rejectFriendRequest;
