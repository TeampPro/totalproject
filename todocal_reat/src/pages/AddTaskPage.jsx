import AddForm from "../components/AddForm/AddForm";
import { useNavigate } from "react-router-dom";

const AddTaskPage = () => {
  const navigate = useNavigate();

  const addTaskHandler = (task) => {
    // ★ ownerId / shared 설정
    const storedUser = JSON.parse(localStorage.getItem("user"));

    const enhancedTask = {
      ...task,
      ownerId: storedUser?.id || null,
      shared: task.shared ?? false,
    };

    fetch("http://localhost:8080/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enhancedTask),
    }).then(() => {
      navigate("/"); // 추가 후 전체일정 페이지로 이동
    });
  };

  return <AddForm onAdd={addTaskHandler} onClose={() => navigate("/")} />;
};

export default AddTaskPage;
