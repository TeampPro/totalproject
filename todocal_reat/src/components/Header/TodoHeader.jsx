import { NavLink, useNavigate } from "react-router-dom";
import classes from "../../styles/todoHeader.module.css"; // 별도 CSS

const TodoHeader = () => {
  const navigate = useNavigate();

  return (
    <div className={classes.todoHeader}>
      <nav className={classes.todoNav}>
        <NavLink to="/tasks" className={({ isActive }) => isActive ? classes.active : ""}>일정</NavLink>
        <NavLink to="/week" className={({ isActive }) => isActive ? classes.active : ""}>이번주</NavLink>
        <NavLink to="/month" className={({ isActive }) => isActive ? classes.active : ""}>이번달</NavLink>
        <NavLink to="/shared" className={({ isActive }) => isActive ? classes.active : ""}>공유일정</NavLink>
      </nav>
      <button className={classes.todoAddButton} onClick={() => navigate("/add")}>+</button>
    </div>
  );
};

export default TodoHeader;
