import axios from 'axios';

const api = axios.create({ 
  baseURL: "/api/chat", 
});

export const fetchChatRooms = async () => {
  try {
    const res = await api.get('/rooms');

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
  const res = await api.post('/rooms', {name});
  return res.data;
};

export const fetchMessages = async (roomId) => {
  const res = await api.get(`/rooms/${roomId}/messages`)
  return res.data;
}