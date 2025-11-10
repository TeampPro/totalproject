import AddForm from "../components/AddForm/AddForm";
import { useNavigate } from "react-router-dom";

const AddTaskPage = () => {
  const navigate = useNavigate();

  const addTaskHandler = (task) => {
    fetch("http://localhost:8080/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    }).then(() => {
      navigate("/"); // 추가 후 전체일정 페이지로 이동
    });
  };

  return <AddForm onAdd={addTaskHandler} onClose={() => navigate("/")} />;
};

export default AddTaskPage;
