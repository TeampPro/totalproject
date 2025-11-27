import { useState, useEffect } from "react";
import TaskList from "../../components/TaskList/TaskList";

import { api } from "../../api/http";

const SharedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const data = await api.get("/api/tasks/shared");
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("?? ?? ?? ??:", err);
        setError(err.message);
      }
    };

    fetchShared();
  }, []);

  if (error) return <div>오류 발생: {error}</div>;

  return <TaskList tasks={tasks} />;
};

export default SharedTasks;
