import React, { useState, useEffect } from "react";
import Db from "../db";
import Task from "./Task";

const DEFAULT_PLACEHOLDER = "カテゴリーの追加";

export default function CategoryItems(props) {
  const [rows, setRows] = useState([]);
  const [inputTarget, setInputTarget] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const result = await Db.getAll("category");
      setRows(result);
    };
    fetchData();
  }, [rows]);

  function handleAddData(e) {
    const name = e.target.value;
    if (name.length == 0){
      return;
    }
    const newItem = Object.assign({}, { name: name });
    const addData = async () => {
      const result = await Db.add("category", newItem);
      return result;
    };
    addData();
    setInputTarget(null);
    setCategoryName("");
  }

  function handleUpdateData(e) {
    const id = e.target.dataset.categoryId;
    const name = e.target.value;
    var targetdata;
    rows.forEach((item) => {
      if (item.id == id) {
        item.name = name;
        targetdata = item;
      }
    });
    const updateData = async () => {
      const result = await Db.update("category", targetdata);
      return result;
    };
    updateData();
    setInputTarget(null);
    setCategoryName("");
  }

  function handleDeleteData(e) {
    const id = parseInt(e.target.dataset.categoryId);
    const deleteData = async () => {
      await Db.delete("category", id);
      const tasks = await Db.findByIndexKey("task", "category_id", id);
      tasks.forEach((task) => {
        Db.delete("task", task.id);
      });
    };
    deleteData();
    setInputTarget(null);
    setCategoryName("");
  }

  function handleChangeValue(e) {
    setCategoryName(e.target.value);
  }

  let categoryItems;
  let addCategory;
  // 編集時はカテゴリの追加を非表示にする
  if (inputTarget === null) {
    addCategory = (
      <li className="category-item">
        <input
          placeholder={DEFAULT_PLACEHOLDER}
          value={categoryName}
          onChange={handleChangeValue}
          onBlur={handleAddData}
        />
      </li>
    );
  }
  categoryItems = (
    <ul>
      {rows.map((category) => {
        if (inputTarget == category.id) {
          return (
            <li className="category-item" key={category.id}>
              <input
                data-category-id={category.id}
                placeholder={DEFAULT_PLACEHOLDER}
                value={categoryName}
                onChange={handleChangeValue}
                onBlur={handleUpdateData}
              />
              <Task category_id={category.id} />
            </li>
          );
        } else {
          return (
            <li className="category-item"  key={category.id}>
              <div className="category-label-wrapper">
                <div
                  data-category-id={category.id}
                  data-category-name={category.name}
                  className="category-label"
                  onClick={() => {
                    setInputTarget(category.id);
                    setCategoryName(category.name);
                  }}
                >
                  {category.name}
                  <button
                    data-category-id={category.id}
                    className="category-config-button"
                    onClick={handleDeleteData}
                  >
                    ×
                  </button>
                </div>
              </div>
              <Task category_id={category.id} />
            </li>
          );
        }
      })}
      {addCategory}
    </ul>
  );

  return <div className="category-wrapper">{categoryItems}</div>;
}
