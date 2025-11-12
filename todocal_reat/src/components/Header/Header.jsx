<<<<<<< HEAD
import { useState } from "react";
import classes from "../../styles/todoHeader.module.css";
=======
// src/components/Header/Header.jsx
import { NavLink, useNavigate } from "react-router-dom";
import classes from "../../styles/header.module.css";
>>>>>>> origin/feature/todolist

const TodoHeader = ({ onChangeFilter, active }) => {
  const [addActive, setAddActive] = useState(false);

  const handleAddClick = () => {
    setAddActive(true);
    setTimeout(() => setAddActive(false), 300); // 클릭 효과 짧게
    window.location.href = "/add";
  };

  return (
<<<<<<< HEAD
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

      {/* ✅ 추가 버튼 */}
      <button
        className={`${classes.todoAddButton} ${
          addActive ? classes.active : ""
        }`}
        onClick={handleAddClick}
      >
        +
      </button>
    </div>
=======
    <header className={classes.header}>
      <nav className={classes.nav}>
        <NavLink to="/tasks" className={({ isActive }) => isActive ? classes.active : ""}>
          일정
        </NavLink>
        <NavLink to="/week" className={({ isActive }) => isActive ? classes.active : ""}>
          이번주 일정
        </NavLink>
        <NavLink to="/month" className={({ isActive }) => isActive ? classes.active : ""}>
          이번달 일정
        </NavLink>
        <NavLink to="/shared" className={({ isActive }) => isActive ? classes.active : ""}>
          공유일정
        </NavLink>
      </nav>
      <button className={classes.addTopButton} onClick={() => navigate("/add")}>
        +
      </button>
    </header>
>>>>>>> origin/feature/todolist
  );
};

export default TodoHeader;
