import React, { useState, useEffect } from "react";
import Db from "../db";

const STATUS = { TODO: "todo", DONE: "done" };
const DEFAULT_PLACEHOLDER = "タスクの追加";

export default function Task(props) {
  const [rows, setRows] = useState([]);
  const [inputTarget, setInputTarget] = useState(null);
  const [taskName, setTaskName] = useState("");
  const [category_id] = useState(props.category_id);

  useEffect(() => {
    const fetchData = async () => {
      const result = await Db.findByIndexKey(
        "task",
        "category_id",
        category_id
      );
      setRows(result);
    };
    fetchData();
  }, [rows]);

  function handleAddData(e) {
    if (e.target.value.length == 0) {
      return;
    }
    const newItem = Object.assign(
      {},
      {
        category_id: category_id,
        name: e.target.value,
        status: STATUS.TODO,
      }
    );
    const addData = async () => {
      const result = await Db.add("task", newItem);
      return result;
    };
    addData();
    setInputTarget(null);
    setTaskName("");
  }

  function handleUpdateData(e) {
    const id = e.target.dataset.taskId;
    const name = e.target.value;
    if (name.length == 0) {
      return;
    }
    var targetdata;
    rows.forEach((item) => {
      if (item.id == id) {
        item.name = name;
        targetdata = item;
      }
    });
    const updateData = async () => {
      const result = await Db.update("task", targetdata);
      return result;
    };
    updateData();
    setInputTarget(null);
    setTaskName("");
  }

  function handleDeleteData(e) {
    const id = parseInt(e.target.dataset.taskId);
    const deleteData = async () => {
      await Db.delete("task", id);
    };
    deleteData();
    setInputTarget(null);
    setTaskName("");
  }

  function handleChangeValue(e) {
    setTaskName(e.target.value);
  }

  let tasks;
  let addTask;
  // 編集時は追加のinputを非表示にする
  if (inputTarget === null) {
    addTask = (
      <li>
        <input
          placeholder={DEFAULT_PLACEHOLDER}
          value={taskName}
          onChange={handleChangeValue}
          onBlur={handleAddData}
        />
      </li>
    );
  }
  tasks = (
    <ul>
      {rows.map((task) => {
        if (inputTarget == task.id) {
          return (
            <li key={task.id}>
              <input type="checkbox" />
              <input
                type="text"
                placeholder={DEFAULT_PLACEHOLDER}
                value={taskName}
                data-task-id={task.id}
                onChange={handleChangeValue}
                onBlur={handleUpdateData}
              />
            </li>
          );
        } else {
          return (
            <li key={task.id}>
              <input id={task.id} type="checkbox" />
              <p
                data-task-id={task.id}
                data-task-name={task.name}
                onClick={() => {
                  setInputTarget(task.id);
                  setTaskName(task.name);
                }}
              >
                {task.name}
                <button
                  data-task-id={task.id}
                  className="task-delete-button"
                  onClick={handleDeleteData}
                >
                  ×
                </button>
              </p>
            </li>
          );
        }
      })}
      {addTask}
    </ul>
  );
  return <div className="task-wrapper">{tasks}</div>;
}
