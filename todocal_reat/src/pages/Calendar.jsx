import { useState, useEffect, useRef } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CalendarTodo from "./CalendarTodo";
import "../styles/Calendar.css";

function Calendar({ onTodosChange }) {
  const navigate = useNavigate();
  const [getMoment,setMoment] = useState(moment());
  const today = getMoment;
  const [holidays,setHolidays] = useState([]);
  const [todos,setTodos] = useState([]);
  const [showModal,setShowModal] = useState(false);
  const [editTodo,setEditTodo] = useState(null);
  const [selectedDate,setSelectedDate] = useState(moment());
  const [showMonthPicker,setShowMonthPicker] = useState(false);
  const [selectedYear,setSelectedYear] = useState(today.year());
  const [selectedMonth,setSelectedMonth] = useState(today.month()+1);
  const monthPickerRef = useRef(null);
  const [dayModalTodos,setDayModalTodos] = useState(null);
  const draggedTodoRef = useRef(null);

  const fetchHolidays = async (year)=>{
    try { const res = await axios.get(`http://localhost:8080/api/holidays/${year}`); setHolidays(res.data); }
    catch(err){console.error(err);}
  };

  const fetchTodos = async()=>{
    try {
      const res = await axios.get("http://localhost:8080/api/tasks");
      const mapped=res.data.map(todo=>({...todo,tDate:todo.promiseDate?moment(todo.promiseDate).format("YYYY-MM-DD"):null}));
      setTodos(mapped);
    } catch(err){console.error(err);}
  };

  useEffect(()=>{ fetchHolidays(today.year()); fetchTodos(); },[today]);

  useEffect(()=>{
    const handleClickOutside=(e)=>{ if(monthPickerRef.current && !monthPickerRef.current.contains(e.target)) setShowMonthPicker(false);}
    if(showMonthPicker) document.addEventListener("mousedown",handleClickOutside);
    return()=>document.removeEventListener("mousedown",handleClickOutside);
  },[showMonthPicker]);

  const isHoliday = date => holidays.some(h=>h.date===date.format("YYYY-MM-DD"));
  const getHolidayName = date => { const found = holidays.find(h=>h.date===date.format("YYYY-MM-DD")); return found?found.name:""; };
  const getTodosForDay = date => todos.filter(t=>t.tDate===date.format("YYYY-MM-DD"));

  const handleSave = async (savedTodo)=>{
    if(!savedTodo) return;
    const normalized = {...savedTodo,tDate:moment(savedTodo.tDate).format("YYYY-MM-DD")};
    try {
      if(normalized.deleted){ await axios.delete(`http://localhost:8080/api/tasks/${normalized.id}`); setTodos(prev=>prev.filter(t=>t.id!==normalized.id));}
      else if(normalized.id){ await axios.put(`http://localhost:8080/api/tasks/${normalized.id}`,{...normalized,promiseDate:normalized.tDate}); setTodos(prev=>prev.map(t=>t.id===normalized.id?normalized:t));}
      else{ const res=await axios.post("http://localhost:8080/api/tasks",{...normalized,promiseDate:normalized.tDate}); setTodos(prev=>[...prev,{...res.data,tDate:res.data.promiseDate}]);}
      onTodosChange&&onTodosChange();
    } catch(err){console.error(err);}
  };

  // 드래그앤드롭 날짜 변경
  const handleDrop = async (todo, newDate) => {
    try {
      const updatedTodo = {
        ...todo,
        promiseDate: `${newDate}T${moment(todo.promiseDate).format("HH:mm:ss")}`,
        tDate: newDate
      };
      await axios.put(`http://localhost:8080/api/tasks/${todo.id}`, updatedTodo);
      setTodos(prev => prev.map(t => t.id === todo.id ? updatedTodo : t));
      onTodosChange && onTodosChange();
    } catch (err) {
      console.error("드래그앤드롭 저장 실패:", err);
    }
  };

  const calendarArr=()=>{
    const startDay=today.clone().startOf("month").startOf("week");
    const endDay=today.clone().endOf("month").endOf("week");
    const day=startDay.clone();
    const calendar=[];
    while(day.isBefore(endDay,"day")){
      const current=day.clone();
      const isDiffMonth=current.month()!==today.month();
      const dayTodos=getTodosForDay(current);
      calendar.push(
        <div
          key={current.format("YYYY-MM-DD")}
          className={`day-cell ${isDiffMonth?"dimmed-date":""} ${isHoliday(current)?"holiday":""}`}
          onClick={()=>setSelectedDate(current)}
          onDragOver={e=>e.preventDefault()}
          onDrop={async()=>{
            if(draggedTodoRef.current){
              await handleDrop(draggedTodoRef.current, current.format("YYYY-MM-DD"));
              draggedTodoRef.current = null;
            }
          }}
        >
          <span className="weekday">{current.format("ddd")}</span>
          <span className="date-number">{current.format("D")}</span>
          {!isDiffMonth && isHoliday(current) && (<small className="holiday-name">{getHolidayName(current)}</small>)}
          <div className="todo-list">
            {dayTodos.slice(0,2).map(todo=>(
              <div key={todo.id} className="todo-item" draggable onDragStart={()=>draggedTodoRef.current=todo}
                onClick={e=>{e.stopPropagation(); setEditTodo(todo); setShowModal(true);}}
              >
                {todo.title}
              </div>
            ))}
            {dayTodos.length>2 && (<div className="todo-more" onClick={e=>{e.stopPropagation(); setDayModalTodos({date:current.format("YYYY-MM-DD"),list:dayTodos});}}>+{dayTodos.length-2}</div>)}
          </div>
        </div>
      );
      day.add(1,"day");
    }
    return calendar;
  };

  return (
    <>
      <div className="calendar-overlay" onClick={()=>navigate("/")}/>
      <div className="calendar-modal">
        <div className="calendar-control">
          <button onClick={()=>setMoment(today.clone().subtract(1,"month"))}>◀</button>
          <span className="thisMonth clickable" onClick={()=>setShowMonthPicker(prev=>!prev)}>{today.format("YYYY년 MM월")}</span>
          {showMonthPicker && (<div className="month-picker" ref={monthPickerRef}>
            <select value={selectedYear} onChange={e=>setSelectedYear(Number(e.target.value))}>{Array.from({length:11},(_,i)=>2020+i).map(y=><option key={y} value={y}>{y}년</option>)}</select>
            <select value={selectedMonth} onChange={e=>setSelectedMonth(Number(e.target.value))}>{Array.from({length:12},(_,i)=>i+1).map(m=><option key={m} value={m}>{m}월</option>)}</select>
            <button onClick={()=>{setMoment(moment({year:selectedYear,month:selectedMonth-1})); setShowMonthPicker(false);}}>이동</button>
          </div>)}
          <button onClick={()=>setMoment(today.clone().add(1,"month"))}>▶</button>
          <button className="right-btn" onClick={()=>{setEditTodo(null); setShowModal(true);}}>+</button>
        </div>
        <div className="calendar-grid">{calendarArr()}</div>
      </div>
      {showModal && (<CalendarTodo onClose={()=>setShowModal(false)} onSave={handleSave} editTodo={editTodo} defaultDate={selectedDate.format("YYYY-MM-DD")}/>)}
      {dayModalTodos && (<div className="todo-day-modal-overlay" onClick={()=>setDayModalTodos(null)}><div className="todo-day-modal" onClick={e=>e.stopPropagation()}><h3>{dayModalTodos.date} 일정 ({dayModalTodos.list.length}개)</h3><ul>{dayModalTodos.list.map(todo=><li key={todo.id} onClick={()=>{setEditTodo(todo); setShowModal(true); setDayModalTodos(null);}}>{todo.title}</li>)}</ul><button onClick={()=>setDayModalTodos(null)}>닫기</button></div></div>)}
    </>
  );
}

export default Calendar;
