import { useState, useEffect } from "react";
import TaskList from "../../components/TaskList/TaskList";

import { api } from "../../api/http";

const WeekTasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchWeekTasks = async () => {
      try {
        const data = await api.get("/api/tasks");
        const now = new Date();
        const weekLater = new Date();
        weekLater.setDate(now.getDate() + 7);

        const weekTasks = (data || []).filter((task) => {
          const promise = new Date(task.promiseDate);
          return promise >= now && promise <= weekLater;
        });

        setTasks(weekTasks);
      } catch (err) {
        console.error("?? ?? ?? ??:", err);
      }
    };

    fetchWeekTasks();
  }, []);

  return <TaskList tasks={tasks} />;
};

export default WeekTasks;
