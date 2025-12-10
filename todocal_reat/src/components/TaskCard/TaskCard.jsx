import classes from "../../styles/TaskCard/taskCard.module.css";

const TaskCard = ({ task }) => {
  if (!task) return null;

  return (
    <div className={classes.card}>
      <div className={classes.header}>
        <h3 className={classes.title}>{task.title}</h3>

        {/* ✅ 공유 여부 배지 표시 */}
        <span
          className={`${classes.badge} ${
            task.shared ? classes.shared : classes.notShared
          }`}
        >
          {task.shared ? "공유됨" : "비공유"}
        </span>
      </div>

      {task.content && <p className={classes.content}>{task.content}</p>}

      <div className={classes.date}>
        {task.createdDate && (
          <span>작성일: {new Date(task.createdDate).toLocaleDateString()}</span>
        )}
        {task.promiseDate && (
          <span>약속일: {new Date(task.promiseDate).toLocaleDateString()}</span>
        )}
      </div>

      {/* ✅ 장소 및 시간 표시 */}
      <div className={classes.extraInfo}>
        {task.location && <p>📍 장소: {task.location}</p>}
        {task.promiseTime && <p>⏰ 시간: {task.promiseTime}</p>}
      </div>
    </div>
  );
};

export default TaskCard;
