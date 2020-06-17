const db_constants = {
  name: "todo_db",
  version: 1,
};
const store_constants: StoreContent[] = [
  {
    name: "category",
    keyPath: "id",
    autoIncrement: true ,
    indexes: [
      { indexName: "name", unique: false },
      { indexName: "description", unique: false },
      { indexName: "limit", unique: false },
      { indexName: "color", unique: false },
    ],
  },
  {
    name: "task",
    keyPath: "id",
    autoIncrement: true ,
    indexes: [
      { indexName: "category_id", unique: false },
      { indexName: "name", unique: false },
      { indexName: "status", unique: false },
    ],
  },
];

interface StoreContent {
  name: string;
  keyPath: string;
  autoIncrement: boolean;
  indexes: IndexItem[];
}

interface IndexItem {
  indexName: string;
  unique: boolean;
}

export type CategoryType = {
  id: number;
  name: string;
  description: string;
  limit: string;
  color: string;
}

export interface TaskType {
  id: number;
  category_id: number;
  name: string;
  status: string;
}

// IndexDBに接続する
const connectIDB = (resolve: any, reject: any) => {
  const request = indexedDB.open(db_constants.name, db_constants.version);
  request.onsuccess = (event: any) => {
    resolve(event.target.result);
  };
  request.onerror = (event) => {
    reject(new Error("IndexedDBのOpenに失敗しました"));
  };
  request.onupgradeneeded = (event: any) => {
    const db = event.target.result;
    for (const constants of store_constants) {
      if (!Array.from(db.objectStoreNames).includes(constants.name)) {
        const objectStore = db.createObjectStore(
          constants.name,
          {keyPath: constants.keyPath, autoIncrement: constants.autoIncrement}
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

class todo_db extends Promise<any> {
  // 全件取得する
  getAll(table_name: string) {
    return new Promise((resolve, reject) => {
      this.then((db) => {
        const transaction = db.transaction(table_name, "readonly");
        const objectStore = transaction.objectStore(table_name);
        const request = objectStore.getAll();
        request.onsuccess = (event: Event) => {
          resolve((event.target as IDBOpenDBRequest).result);
        };
      });
    });
  }
  // indexに条件を指定して全件取得する
  findByIndexKey(table_name: string, index: string, key: number) {
    return new Promise((resolve, reject) => {
      this.then((db) => {
        const transaction = db.transaction(table_name, "readonly");
        const objectStore = transaction.objectStore(table_name);
        const tableIndex = objectStore.index(index);
        const request = tableIndex.getAll(key);
        request.onsuccess = (event: Event) => {
          resolve((event.target as IDBOpenDBRequest).result);
        };
      });
    });
  }
  add(table_name: string, data: any) {
    return new Promise((resolve, reject) => {
      this.then((db) => {
        const transaction = db.transaction(table_name, "readwrite");
        const objectStore = transaction.objectStore(table_name);
        const request = objectStore.add(data);
        request.onsuccess = (event: Event) => {
          resolve((event.target as IDBOpenDBRequest).result);
        };
      });
    });
  }
  update(table_name: string, data: any) {
    return new Promise((resolve, reject) => {
      this.then((db) => {
        const transaction = db.transaction(table_name, "readwrite");
        const objectStore = transaction.objectStore(table_name);
        const request = objectStore.put(data);
        request.onsuccess = (event: Event) => {
          resolve((event.target as IDBOpenDBRequest).result);
        };
      });
    });
  }
  delete(table_name: string, key: number) {
    return new Promise((resolve, reject) => {
      this.then((db) => {
        const transaction = db.transaction(table_name, "readwrite");
        const objectStore = transaction.objectStore(table_name);
        const request = objectStore.delete(key);
        request.onsuccess = (event: Event) => {
          resolve(event.type);
        };
      });
    });
  }
}

export default new todo_db(connectIDB);
