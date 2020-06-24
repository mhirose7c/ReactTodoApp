import React, { useState, useEffect } from "react";
import Db, { TaskType } from "../db";
import {parseStringToNumber} from "../utils/StringUtil";

const STATUS = { TODO: "todo", DONE: "done" };
const DEFAULT_PLACEHOLDER = "タスクの追加";

interface Prop {
  category_id: number;
}

export default function Task(props: Prop) {
  const [rows, setRows] = useState<TaskType[]>([]);
  const [inputTarget, setInputTarget] = useState(-1);
  const [taskName, setTaskName] = useState("");
  const [category_id] = useState(props.category_id);

  useEffect(() => {
    const fetchData = async () => {
      const result = await Db.findByIndexKey(
        "task",
        "category_id",
        category_id
      );
      setRows(result as TaskType[]);
    };
    fetchData();
  }, [rows, category_id]);

  function handleAddData(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.currentTarget;
    if (value.length === 0) {
      return;
    }
    const newItem = Object.assign(
      {},
      {
        category_id: category_id,
        name: value,
        status: STATUS.TODO,
      }
    );
    const addData = async () => {
      const result = await Db.add("task", newItem);
      return result;
    };
    addData();
    setInputTarget(-1);
    setTaskName("");
  }

  function handleUpdateData(e: React.FocusEvent<HTMLInputElement>) {
    const id = parseStringToNumber(e.currentTarget.dataset.taskId);
    const name = e.currentTarget.value;
    var targetdata: TaskType;
    rows.forEach((item) => {
      if (item.id === id) {
        if(name.length !== 0){
          item.name = name;
        }
        targetdata = item;
      }
    });
    const updateData = async () => {
      const result = await Db.update("task", targetdata);
      return result;
    };
    updateData();
    setInputTarget(-1);
    setTaskName("");
  }
  function handleDeleteData(e: React.MouseEvent<HTMLElement>) {
    const id = parseStringToNumber(e.currentTarget.dataset.taskId);
    if (id === -1) {
      return;
    }
    const deleteData = async () => {
      await Db.delete("task", id);
    };
    deleteData();
    setInputTarget(-1);
    setTaskName("");
  }

  function handleChangeValue(e: React.ChangeEvent<HTMLInputElement>) {
    setTaskName(e.target.value);
  }

  let tasks;
  let addTask;
  // 編集時は追加のinputを非表示にする
  if (inputTarget === -1) {
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
      {rows.map((task: TaskType) => {
        if (inputTarget === task.id) {
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
              <input type="checkbox" />
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
