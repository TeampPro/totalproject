<<<<<<< HEAD
import { useState } from "react";
import classes from "../../styles/todoHeader.module.css";

const TodoHeader = ({ onChangeFilter, active }) => {
  const [addActive, setAddActive] = useState(false);

  const handleAddClick = () => {
    setAddActive(true);
    setTimeout(() => setAddActive(false), 300); // 클릭 효과 짧게
    window.location.href = "/add";
  };

=======
import classes from "../../styles/todoHeader.module.css";

const TodoHeader = ({ onChangeFilter, active }) => {
>>>>>>> origin/feature/todolist
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

<<<<<<< HEAD
      {/* ✅ 추가 버튼 */}
      <button
        className={`${classes.todoAddButton} ${
          addActive ? classes.active : ""
        }`}
        onClick={handleAddClick}
=======
      <button
        className={classes.todoAddButton}
        onClick={() => (window.location.href = "/add")}
>>>>>>> origin/feature/todolist
      >
        +
      </button>
    </div>
  );
};

export default TodoHeader;
