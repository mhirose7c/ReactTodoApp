import React, { useState, useEffect, MouseEvent } from "react";
import Db, { CategoryType, TaskType } from "../db";
import Task from "./Task";

const DEFAULT_PLACEHOLDER = "カテゴリーの追加";

export default function CategoryItems() {
  const [rows, setRows] = useState<CategoryType[]>([]);
  const [inputTarget, setInputTarget] = useState(-1);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const result = await Db.getAll("category");
      setRows(result as CategoryType[]);
    };
    fetchData();
  }, [rows]);

  function handleAddData(e: React.ChangeEvent<HTMLInputElement>) {
    const {value} = e.currentTarget
    const name: string = value;
    if (name.length == 0) {
      return;
    }
    const newItem = Object.assign({}, { name: name });
    const addData = async () => {
      const result = await Db.add("category", newItem);
      return result;
    };
    addData();
    setInputTarget(-1);
    setCategoryName("");
  }
  function parseId(target: string | undefined): number {
    return target ? parseInt(target) : -1;
  };

  function handleUpdateData(e: React.FocusEvent<HTMLInputElement>) {
    const {value, dataset} = e.currentTarget;
    const id = parseId(dataset.categoryId);
    const name = value;
    if (id == -1){
      return;
    }
    var targetdata: CategoryType;
    rows.forEach((item: CategoryType) => {
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
    setInputTarget(-1);
    setCategoryName("");
  }

  function handleDeleteData(e: React.MouseEvent<HTMLElement>) {
    const id = parseId(e.currentTarget.dataset.categoryId);
    const deleteData = async () => {
      await Db.delete("category", id);
      const tasks = await Db.findByIndexKey("task", "category_id", id) as TaskType[];
      tasks.forEach((task: TaskType) => {
        Db.delete("task", task.id);
      });
    };
    deleteData();
    setInputTarget(-1);
    setCategoryName("");
  }

  function handleChangeValue(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.currentTarget;
    setCategoryName(value);
  }

  let categoryItems;
  let addCategory;
  // 編集時はカテゴリの追加を非表示にする
  if (inputTarget === -1) {
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
      {rows.map((category: CategoryType) => {
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
            <li className="category-item" key={category.id}>
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
