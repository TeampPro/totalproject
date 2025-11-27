import axios from "../api/setupAxios";

export const fetchChatRooms = async () => {
  try {
    const res = await axios.get('/api/chat/rooms');

    if (res.status === 204 || Array.isArray(res.data) === false) {
      return [];
    }
    return res.data;
  } catch (err) {
    console.error('채팅방 목록 조회 실패:', err);
    return [];
  }
};

export const createChatRoom = async (name) => {
  const res = await axios.post('/api/chat/rooms', {name});
  return res.data;
};

export const fetchMessages = async (roomId) => {
  const res = await axios.get(`/api/chat/rooms/${roomId}/messages`)
  return res.data;
}
