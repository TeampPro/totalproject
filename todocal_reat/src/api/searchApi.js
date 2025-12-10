import axios from "../api/setupAxios";

export async function searchGoogle(query) {
  const res = await axios.post("/api/search/google", {query})
  return res.data;
}