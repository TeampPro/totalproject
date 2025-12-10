import AddForm from "../../components/AddForm/AddForm";
import { useNavigate } from "react-router-dom";

import { api } from "../../api/http";

const AddTaskPage = () => {
  const navigate = useNavigate();

  const addTaskHandler = async (task) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    const enhancedTask = {
      ...task,
      ownerId: storedUser?.id || null,
      shared: task.shared ?? false,
    };

    try {
      await api.post("/api/tasks", enhancedTask);
      navigate("/");
    } catch (err) {
      console.error("작업 추가 중 오류 발생:", err);
      alert(err.message || "오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return <AddForm onAdd={addTaskHandler} onClose={() => navigate("/")} />;
};

export default AddTaskPage;
