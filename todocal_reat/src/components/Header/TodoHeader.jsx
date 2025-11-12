import classes from "../../styles/todoHeader.module.css";

const TodoHeader = ({ onChangeFilter, active }) => {
  return (
    <div className={classes.todoHeader}>
      <nav className={classes.todoNav}>
        <button
          className={`${classes.todoBtn} ${
            active === "all" ? classes.active : ""
          }`}
          onClick={() => onChangeFilter("all")}
        >
          일정
        </button>
        <button
          className={`${classes.todoBtn} ${
            active === "week" ? classes.active : ""
          }`}
          onClick={() => onChangeFilter("week")}
        >
          이번주
        </button>
        <button
          className={`${classes.todoBtn} ${
            active === "month" ? classes.active : ""
          }`}
          onClick={() => onChangeFilter("month")}
        >
          이번달
        </button>
        <button
          className={`${classes.todoBtn} ${
            active === "shared" ? classes.active : ""
          }`}
          onClick={() => onChangeFilter("shared")}
        >
          공유일정
        </button>
      </nav>

      <button
        className={classes.todoAddButton}
        onClick={() => (window.location.href = "/add")}
      >
        +
      </button>
    </div>
  );
};

export default TodoHeader;
