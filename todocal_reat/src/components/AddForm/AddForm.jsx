import { useState } from "react";
import classes from "../../styles/addForm.module.css";

const AddForm = ({ onAdd, onClose }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [promiseDate, setPromiseDate] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();
    if (!title) return alert("제목을 입력하세요");

    onAdd({
      title,
      content,
      promiseDate,
      createdDate: new Date().toISOString()
    });

    setTitle("");
    setContent("");
    setPromiseDate("");
  };

  return (
    <div className={classes.backdrop}>
      <form className={classes.form} onSubmit={submitHandler}>
        <input type="text" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="내용" value={content} onChange={e => setContent(e.target.value)} />
        <input type="date" value={promiseDate} onChange={e => setPromiseDate(e.target.value)} />
        <button type="submit">추가</button>
        <button type="button" onClick={onClose}>취소</button>
      </form>
    </div>
  );
};

export default AddForm;
