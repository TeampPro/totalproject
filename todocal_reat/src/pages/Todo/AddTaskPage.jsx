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
      console.error("? ? ?? ??:", err);
      alert(err.message || "? ?? ???? ?????.");
    }
  };

  return <AddForm onAdd={addTaskHandler} onClose={() => navigate("/")} />;
};

export default AddTaskPage;