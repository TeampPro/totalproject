import { useState, useEffect } from "react";
import TaskList from "../components/TaskList/TaskList";

const SharedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/tasks/shared")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => setTasks(data))
      .catch(err => {
        console.error("❌ Fetch error:", err);
        setError(err.message);
      });
  }, []);

  if (error) return <div>오류 발생: {error}</div>;

  return <TaskList tasks={tasks} />;
};

export default SharedTasks;
