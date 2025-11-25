import { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "../../styles/Header/todoHeader.module.css";

const TodoHeader = ({ onChangeFilter, active, showAddButton = true }) => {
  const [addActive, setAddActive] = useState(false);
  const navigate = useNavigate();

  const handleAddClick = () => {
    setAddActive(true);
    setTimeout(() => setAddActive(false), 300);
    navigate("/todo"); // SPA 이동
  };

  return (
    <div className={classes.todoHeader}>
      <nav className={classes.todoNav}>
        <button
          className={`${classes.todoBtn} ${active === "all" ? classes.active : ""}`}
          onClick={() => onChangeFilter("all")}
        >
          일정
        </button>
        <button
          className={`${classes.todoBtn} ${active === "week" ? classes.active : ""}`}
          onClick={() => onChangeFilter("week")}
        >
          이번주
        </button>
        <button
          className={`${classes.todoBtn} ${active === "month" ? classes.active : ""}`}
          onClick={() => onChangeFilter("month")}
        >
          이번달
        </button>
        <button
          className={`${classes.todoBtn} ${active === "shared" ? classes.active : ""}`}
          onClick={() => onChangeFilter("shared")}
        >
          공유일정
        </button>
      </nav>

      {showAddButton && (
        <button
          className={`${classes.todoAddButton} ${addActive ? classes.active : ""}`}
          onClick={handleAddClick}
        >
          +
        </button>
      )}
    </div>
  );
};

export default TodoHeader;
