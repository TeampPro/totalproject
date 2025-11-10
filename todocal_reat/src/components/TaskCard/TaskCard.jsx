import classes from "../../styles/taskCard.module.css";

const TaskCard = ({ task }) => {
  return (
    <div className={classes.card}>
      <h3>{task.title}</h3>
      <p>{task.content}</p>
      <div className={classes.date}>
        <span>작성일: {new Date(task.createdDate).toLocaleDateString()}</span>
        <span>약속일: {new Date(task.promiseDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default TaskCard;
