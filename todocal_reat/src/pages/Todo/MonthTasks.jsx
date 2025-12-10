import { useState, useEffect } from "react";
import TaskList from "../../components/TaskList/TaskList";

import { api } from "../../api/http";

const MonthTasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchMonthTasks = async () => {
      try {
        const data = await api.get("/api/tasks");
        const now = new Date();
        const monthLater = new Date();
        monthLater.setMonth(now.getMonth() + 1);

        const monthTasks = (data || []).filter((task) => {
          const promise = new Date(task.promiseDate);
          return promise >= now && promise <= monthLater;
        });

        setTasks(monthTasks);
      } catch (err) {
        console.error("월간 일정 조회 실패:", err);
      }
    };

    fetchMonthTasks();
  }, []);

  return <TaskList tasks={tasks} />;
};

export default MonthTasks;
