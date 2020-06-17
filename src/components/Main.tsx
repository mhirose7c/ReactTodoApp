import React from "react";
import Category from "./Category";

class Main extends React.Component {
  render() {
    return (
      <div className="main-wrapper">
        <div className="main">
          <div className="copy-container">
            <h1>Todo</h1>
            <h2>カテゴリー別にタスクを管理する</h2>
          </div>
          <div className="category-continer">
            <Category />
          </div>
        </div>
      </div>
    );
  }
}

export default Main;
