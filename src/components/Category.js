import React from "react";
import Db from "../db";
import Task from "./Task";

const DEFAULT_PLACEHOLDER = "カテゴリーの追加";

class CategoryItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: [],
      inputTarget: null,
      categoryName: "",
    };
    this.add = this.add.bind(this);
    this.update = this.updateCategory.bind(this);
    this.delete = this.delete.bind(this);
    this.addCategory = this.addCategory.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.inputCategoryName = this.inputCategoryName.bind(this);
    this.targetChange = this.targetChange.bind(this);
    this.renderAllCategories();
  }
  async renderAllCategories() {
    const categories = await Db.getAll("category");
    this.setState({ rows: categories });
  }

  async add(category_name) {
    const newItem = Object.assign({}, { name: category_name });
    const id = await Db.add("category", newItem);
    newItem.id = id;
    this.state.rows.push(newItem);
    this.setState({ rows: this.state.rows });
    this.setState({ categoryName: "" });
  }

  async update(data) {
    await Db.update("category", data);
    this.setState({ rows: this.state.rows });
    this.setState({ inputTarget: null });
    this.setState({ categoryName: "" });
  }

  async delete(id) {
    Db.delete("category", id);
    // 付随するタスクを全て削除

    const tasks = await Db.findByIndexKey("task", "category_id", id);
    tasks.forEach((task) => {
      Db.delete("task", task.id);
    });
    this.setState({ rows: [] });
    this.renderAllCategories();
  }

  addCategory(e) {
    this.add(e.target.value);
  }

  updateCategory(e) {
    const id = e.target.dataset.categoryId;
    const name = e.target.value;
    var targetdata;
    this.state.rows.forEach((item) => {
      if (item.id == id) {
        item.name = name;
        targetdata = item;
      }
    });
    this.update(targetdata);
  }

  deleteCategory(e) {
    const id = e.target.dataset.categoryId;
    this.delete(parseInt(id));
  }

  inputCategoryName(e) {
    this.setState({ categoryName: e.target.value });
  }

  targetChange(e) {
    this.setState({ inputTarget: e.target.dataset.categoryId });
    this.setState({ categoryName: e.target.dataset.categoryName });
  }

  render() {
    let categoryItems;
    let addCategory;
    // 編集時はカテゴリの追加を非表示にする
    if (this.state.inputTarget === null) {
      addCategory = (
        <li className="category-item">
          <input
            placeholder={DEFAULT_PLACEHOLDER}
            value={this.state.categoryName}
            onChange={this.inputCategoryName}
            onBlur={this.addCategory}
          />
        </li>
      );
    }
    categoryItems = (
      <ul>
        {this.state.rows.map((category) => {
          if (this.state.inputTarget == category.id) {
            return (
              <li className="category-item">
                <input
                  data-category-id={category.id}
                  placeholder={DEFAULT_PLACEHOLDER}
                  value={this.state.categoryName}
                  onChange={this.inputCategoryName}
                  onBlur={this.updateCategory}
                />
                <Task category_id={category.id} />
              </li>
            );
          } else {
            return (
              <li className="category-item">
                <p className="category-label-wrapper">
                  <p
                    data-category-id={category.id}
                    data-category-name={category.name}
                    className="category-label"
                    onClick={this.targetChange}
                  >
                    {category.name}
                    <button
                      data-category-id={category.id}
                      className="category-config-button"
                      onClick={this.deleteCategory}
                    >
                      ×
                    </button>
                  </p>
                </p>
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
}

export default CategoryItems;
