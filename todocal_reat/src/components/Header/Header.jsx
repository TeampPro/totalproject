import { NavLink, useNavigate } from "react-router-dom";
import classes from "../../styles/header.module.css";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className={classes.header}>
      <nav className={classes.nav}>
        <NavLink to="/" className={({ isActive }) => isActive ? classes.active : ""}>일정</NavLink>
        <NavLink to="/week" className={({ isActive }) => isActive ? classes.active : ""}>이번주 일정</NavLink>
        <NavLink to="/month" className={({ isActive }) => isActive ? classes.active : ""}>이번달 일정</NavLink>
        <NavLink to="/shared" className={({ isActive }) => isActive ? classes.active : ""}>공유일정</NavLink>
      </nav>
      <button className={classes.addTopButton} onClick={() => navigate("/")}>+</button>
    </header>
  );
};

export default Header;
