import TaskCard from "../TaskCard/TaskCard";
import classes from "../../styles/taskList.module.css";

const TaskList = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return <div className={classes.empty}>일정이 없습니다.</div>;
  }

  return (
    <div className={classes.taskList}>
      {tasks.map(task => <TaskCard key={task.id} task={task} />)}
    </div>
  );
};

export default TaskList;
