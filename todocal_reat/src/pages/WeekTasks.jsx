import { useState, useEffect } from "react";
import TaskList from "../components/TaskList/TaskList";

const WeekTasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/tasks")
      .then(res => res.json())
      .then(data => {
        const now = new Date();
        const weekLater = new Date();
        weekLater.setDate(now.getDate() + 7);

        const weekTasks = data.filter(task => {
          const promise = new Date(task.promiseDate);
          return promise >= now && promise <= weekLater;
        });

        setTasks(weekTasks);
      });
  }, []);

  return <TaskList tasks={tasks} />;
};

export default WeekTasks;
