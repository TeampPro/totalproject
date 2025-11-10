import { useState, useEffect } from "react";
import TaskList from "../components/TaskList/TaskList";

const AllTasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/tasks")
      .then(res => res.json())
      .then(data => setTasks(data));
  }, []);

  return <TaskList tasks={tasks} />;
};

export default AllTasks;
