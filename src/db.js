const db_constants = {
  name: "todo_db",
  version: 1,
};
const store_constants = [
  {
    name: "category",
    storeOptions: { keyPath: "id", autoIncrement: true },
    indexes: [
      { indexName: "name", unique: false },
      { indexName: "description", unique: false },
      { indexName: "limit", unique: false },
      { indexName: "color", unique: false },
    ],
  },
  {
    name: "task",
    storeOptions: { keyPath: "id", autoIncrement: true },
    indexes: [
      { indexName: "category_id", unique: false },
      { indexName: "name", unique: false },
      { indexName: "status", unique: false },
    ],
  },
];

// IndexDBに接続する
const connectIDB = (resolve, reject) => {
  const request = indexedDB.open(db_constants.name, db_constants.version);
  request.onsuccess = (event) => {
    resolve(event.target.result);
  };
  request.onerror = (event) => {
    reject(new Error("IndexedDBのOpenに失敗しました"));
  };
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    for (const constants of store_constants) {
      if (!Array.from(db.objectStoreNames).includes(constants.name)) {
        const objectStore = db.createObjectStore(
          constants.name,
          constants.storeOptions
        );
        for (const index of constants.indexes) {
          objectStore.createIndex(index.indexName, index.indexName, {
            unique: index.unique,
          });
        }
      }
    }
  };
};

class todo_db extends Promise {
  // 全件取得する
  getAll(table_name) {
    return new Promise((resolve, reject) => {
      this.then((db) => {
        const transaction = db.transaction(table_name, "readonly");
        const objectStore = transaction.objectStore(table_name);
        const request = objectStore.getAll();
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
      });
    });
  }
  // indexに条件を指定して全件取得する
  findByIndexKey(table_name, index, key) {
    return new Promise((resolve, reject) => {
      this.then((db) => {
        const transaction = db.transaction(table_name, "readonly");
        const objectStore = transaction.objectStore(table_name);
        const tableIndex = objectStore.index(index);
        const request = tableIndex.getAll(key);
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
      });
    });
  }
  add(table_name, data) {
    return new Promise((resolve, reject) => {
      this.then((db) => {
        const transaction = db.transaction(table_name, "readwrite");
        const objectStore = transaction.objectStore(table_name);
        const request = objectStore.add(data);
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
      });
    });
  }
  update(table_name, data) {
    return new Promise((resolve, reject) => {
      this.then((db) => {
        const transaction = db.transaction(table_name, "readwrite");
        const objectStore = transaction.objectStore(table_name);
        const request = objectStore.put(data);
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
      });
    });
  }
  delete(table_name, key) {
    return new Promise((resolve, reject) => {
      this.then((db) => {
        const transaction = db.transaction(table_name, "readwrite");
        const objectStore = transaction.objectStore(table_name);
        const request = objectStore.delete(key);
        request.onsuccess = (event) => {
          resolve(event.type);
        };
      });
    });
  }
}

export default new todo_db(connectIDB);
