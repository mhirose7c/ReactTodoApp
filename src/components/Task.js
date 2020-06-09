import React from "react";
import Db from "../db";

const STATUS = {TODO: "todo", DONE: "done"};
const DEFAULT_PLACEHOLDER = "タスクの追加";

class Task extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: [],
      inputTarget: null,
      taskName: "",
    };
    this.addTask = this.addTask.bind(this);
    this.updateTask = this.updateTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.addTaskName = this.addTaskName.bind(this);
    this.updateTaskName = this.updateTaskName.bind(this);
    this.deleteTaskItem = this.deleteTaskItem.bind(this);
    this.inputTaskName = this.inputTaskName.bind(this);
    this.targetChange = this.targetChange.bind(this);
    this.renderAllTasks();
  }
  async renderAllTasks() {
    const tasks = await Db.findByIndexKey(
      "task",
      "category_id",
      this.props.category_id
    );
    this.setState({ rows: tasks });
  }

  async addTask(task_name) {
    const newItem = Object.assign(
      {},
      { category_id: this.props.category_id, name: task_name, status: STATUS.TODO }
    );
    const id = await Db.add("task", newItem);
    newItem.id = id;
    this.state.rows.push(newItem);
    this.setState({ rows: this.state.rows });
    this.setState({ taskName: "" });
  }

  async updateTask(data) {
    await Db.update("task", data);
    this.setState({ inputTarget: null });
    this.setState({ taskName: "" });
  }

  async deleteTask(id) {
    await Db.delete("task", id);
    this.setState({ rows: [] });
    this.renderAllTasks()
    this.setState({ inputTarget: null });
    this.setState({ taskName: "" });
  }

  addTaskName(e) {
    if(e.target.value == 0) {
      return
    }
    this.addTask(e.target.value);
  }

  updateTaskName(e) {
    const id = e.target.dataset.taskId;
    const name = e.target.value;
    if(name.length == 0) {
      return
    }
    var targetdata;
    this.state.rows.forEach((item) => {
      if (item.id == id) {
        item.name = name;
        targetdata = item;
      }
    });
    this.updateTask(targetdata);
  }

  deleteTaskItem(e){
    const id = e.target.dataset.taskId;
    this.deleteTask(parseInt(id));
  }

  inputTaskName(e) {
    this.setState({ taskName: e.target.value });
  }

  targetChange(e) {
    this.setState({ inputTarget: e.target.dataset.taskId });
    this.setState({ taskName: e.target.dataset.taskName });
  }

  render() {
    let tasks;
    let addTask;
    // 編集時は追加のinputを非表示にする
    if (this.state.inputTarget === null) {
      addTask = (
        <li>
          <input
            placeholder={DEFAULT_PLACEHOLDER}
            value={this.state.taskName}
            onChange={this.inputTaskName}
            onBlur={this.addTaskName}
          />
        </li>
      );
    }
    tasks = (
      <ul>
        {this.state.rows.map((task) => {
          if (this.state.inputTarget == task.id) {
            return (
              <li>
                <input type="checkbox" />
                <input
                  type="text"
                  placeholder={DEFAULT_PLACEHOLDER}
                  value={this.state.taskName}
                  data-task-id={task.id}
                  onChange={this.inputTaskName}
                  onBlur={this.updateTaskName}
                />
              </li>
            );
          } else {
            return (
              <li>
                <input id={task.id} type="checkbox" />
                <p
                  data-task-id={task.id}
                  data-task-name={task.name}
                  onClick={this.targetChange}
                >
                  {task.name}
                  <button
                    data-task-id={task.id}
                    className="task-delete-button"
                    onClick={this.deleteTaskItem}
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
}

export default Task;
