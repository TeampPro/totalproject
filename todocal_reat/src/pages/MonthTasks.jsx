import { useState, useEffect } from "react";
import TaskList from "../components/TaskList/TaskList";

const MonthTasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/tasks")
      .then(res => res.json())
      .then(data => {
        const now = new Date();
        const monthLater = new Date();
        monthLater.setMonth(now.getMonth() + 1);

        const monthTasks = data.filter(task => {
          const promise = new Date(task.promiseDate);
          return promise >= now && promise <= monthLater;
        });

        setTasks(monthTasks);
      });
  }, []);

  return <TaskList tasks={tasks} />;
};

export default MonthTasks;
