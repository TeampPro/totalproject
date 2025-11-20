import { useState } from "react";

function TodoList({ date, todos, onAddTodo }) {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (text.trim()) {
      onAddTodo(date, text);
      setText("");
    }
  };

  return (
    <div className="todo-list">
      <h3>{date}의 할 일</h3>
      <ul>
        {todos.map((todo, i) => (
          <li key={i}>{todo}</li>
        ))}
      </ul>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="할 일을 입력하세요"
      />
      <button onClick={handleAdd}>추가</button>
    </div>
  );
}

export default TodoList;
