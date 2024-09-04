
import * as SQLite from 'expo-sqlite/legacy';

const db = SQLite.openDatabase('bajeti-app.db')

export function initializeDatabase() {
  db.transaction(tx => {
    // Create the categories table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // Create the sources table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // Create the transactions table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        source_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (source_id) REFERENCES sources(id)
      );`
    );

    // Seed the categories table if it is empty
    tx.executeSql(
      `SELECT COUNT(*) as count FROM categories;`,
      [],
      (_, result) => {
        const count = result.rows.item(0).count;
        if (count === 0) {
          tx.executeSql(
            `INSERT INTO categories (name, type, created_at, updated_at) VALUES
            ('Salary', 'income', '2024-09-01 10:00:00', '2024-09-01 10:00:00'),
            ('Freelance Work', 'income', '2024-09-01 10:15:00', '2024-09-01 10:15:00'),
            ('Groceries', 'expense', '2024-09-01 10:30:00', '2024-09-01 10:30:00'),
            ('Rent', 'expense', '2024-09-01 10:45:00', '2024-09-01 10:45:00'),
            ('Utilities', 'expense', '2024-09-01 11:00:00', '2024-09-01 11:00:00'),
            ('Dining Out', 'expense', '2024-09-01 11:15:00', '2024-09-01 11:15:00');`
          );
        }
      },
      (_, error) => {
        console.log('Error checking categories table:', error);
        return false;
      }
    );
  }, (error) => {
    console.log('Transaction error:', error);
  }, () => {
    console.log('Database initialized successfully');
  });
}


export async function getCategories() {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM categories',
                [],
                (_, results) => {
                    resolve(results.rows._array);
                },
                (_, error) => {
                    reject(error);
                    return true;
                }
            );
        }, (transactionError) => {
            reject(transactionError);
        });
    });
}


export async function addCategory(name: string, type: string) {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                'INSERT INTO categories (name, type) VALUES (?, ?)',
                [name, type],
                (tx, results) => {
                    resolve(results.insertId);
                },
                (tx, error) => {
                    reject(error);
                    return true
                }
            );
        });
    });
}

export async function updateCategory(id: number, name: string, type: string) {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE categories SET name = ?, type = ? WHERE id = ?',
                [name, type, id],
                (tx, results) => {
                    resolve(results.rowsAffected);
                },
                (tx, error) => {
                    reject(error);
                    return true
                }
            );
        });
    });
}

export async function deleteCategory(id: number) {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                'DELETE FROM categories WHERE id = ?',
                [id],
                (tx,
                    results) => {
                    resolve(results.rowsAffected);
                },
                (tx, error) => {
                    reject(error);
                    return true
                }
            );
        });
    });
}

export async function deleteCategories() {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                'DELETE FROM categories',
                [],
                (tx,
                    results) => {
                    resolve(results.rowsAffected);
                },
                (tx, error) => {
                    reject(error);
                    return true
                }
            );
        });
    });
}