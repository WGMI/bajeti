
import * as SQLite from 'expo-sqlite/legacy';

const db = SQLite.openDatabase('bajeti_app.db')

export function initializeDatabase() {
    db.transaction(tx => {
        // Create the categories table
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image TEXT NOT NULL,
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
        uuid TEXT,
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
                        `INSERT INTO categories (name, image, type, created_at, updated_at) VALUES
            ('Salary', 'case.jpg', 'income', '2024-09-01 10:00:00', '2024-09-01 10:00:00'),
            ('Freelance Work', 'cup.jpg',  'income', '2024-09-01 10:15:00', '2024-09-01 10:15:00'),
            ('Groceries', 'cup.jpg',  'expense', '2024-09-01 10:30:00', '2024-09-01 10:30:00'),
            ('Rent', 'house.jpg', 'expense', '2024-09-01 10:45:00', '2024-09-01 10:45:00'),
            ('Utilities', 'case.jpg',  'expense', '2024-09-01 11:00:00', '2024-09-01 11:00:00'),
            ('Dining Out', 'plate.jpg',  'expense', '2024-09-01 11:15:00', '2024-09-01 11:15:00');`
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

export async function getCategory(id: number) {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM categories where id = ?',
                [id],
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

export async function getCategoryByName(category: string) {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM categories where name = ?',
                [category],
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

export async function getCategoriesByType(type: string) {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM categories where type = ?',
                [type],
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


export async function addCategory(name: string, image: string, type: string) {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                'INSERT INTO categories (name, image, type) VALUES (?, ?, ?)',
                [name, image, type],
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

export async function updateCategory(id: number, name: string, image: string, type: string) {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE categories SET name = ?, image = ?, type = ? WHERE id = ?',
                [name, image, type, id],
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

// Interface for the Transaction object
export interface Transaction {
    uuid: string;
    category_id: number;
    amount: number;
    description?: string;
    date: string;
    source_id?: number;
    created_at?: string;
    updated_at?: string;
}

// Create a transaction
export const createTransaction = async (transaction: Transaction): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO transactions (uuid, category_id, amount, description, date, source_id) VALUES (?, ?, ?, ?, ?, ?)`,
                [transaction.uuid, transaction.category_id, transaction.amount, transaction.description || null, transaction.date, transaction.source_id || null],
                () => resolve(),
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        });
    });
};

// Read all transactions
export const getSevenDaysTransactions = async (): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * from transactions t join categories c on t.category_id = c.id WHERE date BETWEEN DATE('now', '-7 days') AND DATE('now') ORDER BY date, created_at DESC`,
                [],
                (_, { rows: { _array } }) => resolve(_array),
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        });
    });
};

export const getTransactions = async (): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * from transactions t join categories c on t.category_id = c.id ORDER BY date, created_at asc`,
                [],
                (_, { rows: { _array } }) => resolve(_array),
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        });
    });
};

export const getTransactionsForMonth = async (month: string): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * from transactions t join categories c on t.category_id = c.id WHERE strftime("%Y-%m", t.date) = ? ORDER BY date, created_at asc`,
                [month],
                (_, { rows: { _array } }) => resolve(_array),
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        });
    });
};

export const getTotalIncome = (month: boolean): Promise<number> => {
    return new Promise((resolve, reject) => {
        const query = `SELECT COALESCE(SUM(t.amount), 0) AS total_income FROM transactions t JOIN categories c ON t.category_id = c.id WHERE c.type = 'income' ${month ? 'AND strftime("%Y-%m", t.date) = strftime("%Y-%m", "now")' : ''};`;
        db.transaction((tx) => {
            tx.executeSql(
                query,
                [],
                (_, result) => {
                    const totalIncome = result.rows.item(0).total_income;
                    resolve(totalIncome);
                },
                (_, error) => {
                    console.error('Error running query for total income:', error);
                    reject(error);
                    return true;
                }
            );
        });
    });
};

export const getTotalExpenses = (month: boolean): Promise<number> => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COALESCE(SUM(t.amount), 0) AS total_expenses
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE c.type = 'expense' ${month ? 'AND strftime("%Y-%m", t.date) = strftime("%Y-%m", "now")' : ''};
      `;

        db.transaction((tx) => {
            tx.executeSql(
                query,
                [],
                (_, result) => {
                    const totalExpenses = result.rows.item(0).total_expenses;
                    resolve(totalExpenses);
                },
                (_, error) => {
                    console.error('Error running query for total expenses:', error);
                    reject(error);
                    return true;
                }
            );
        });
    });
};

export const getExpenditureByCategory = (): Promise<{ category: string, total_expense: number }[]> => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT c.name AS category, COALESCE(SUM(t.amount), 0) AS total_expense
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE c.type = 'expense'
        GROUP BY c.name;
      `;

        db.transaction((tx) => {
            tx.executeSql(
                query,
                [],
                (_, result) => {
                    const expenditures = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        expenditures.push(result.rows.item(i));
                    }
                    resolve(expenditures);
                },
                (_, error) => {
                    console.error('Error running query for expenditure by category:', error);
                    reject(error);
                    return true;
                }
            );
        });
    });
};

export const getIncomeByCategory = (): Promise<{ category: string, total_income: number }[]> => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT c.name AS category, COALESCE(SUM(t.amount), 0) AS total_income
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE c.type = 'income'
        GROUP BY c.name;
      `;

        db.transaction((tx) => {
            tx.executeSql(
                query,
                [],
                (_, result) => {
                    const incomes = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        incomes.push(result.rows.item(i));
                    }
                    resolve(incomes);
                },
                (_, error) => {
                    console.error('Error running query for expenditure by category:', error);
                    reject(error);
                    return true;
                }
            );
        });
    });
};

export const getDataByCategory = (): Promise<{ category: string, total_amount: number }[]> => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT c.name AS category, COALESCE(SUM(t.amount), 0) AS total_amount
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        GROUP BY c.name
        ORDER by total_amount DESC;
      `;

        db.transaction((tx) => {
            tx.executeSql(
                query,
                [],
                (_, result) => {
                    const amounts = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        amounts.push(result.rows.item(i));
                    }
                    resolve(amounts);
                },
                (_, error) => {
                    console.error('Error running query for expenditure by category:', error);
                    reject(error);
                    return true;
                }
            );
        });
    });
};



// Read a transaction by ID
export const getTransactionById = async (id: number): Promise<Transaction | null> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM transactions WHERE id = ?`,
                [id],
                (_, { rows: { length, _array } }) => {
                    resolve(length > 0 ? _array[0] : null);
                },
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        });
    });
};

export const getSummaryData = async (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `
            SELECT 
                strftime('%Y-%m', t.date) AS month, 
                SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END) AS total_income,
                SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) AS total_expenses
            FROM 
                transactions t
            JOIN 
                categories c ON t.category_id = c.id
            GROUP BY 
                strftime('%Y-%m', t.date);
            ORDER BY 
                strftime('%Y-%m', t.date) DESC;

          `,
                [],
                (_, { rows: { _array } }) => resolve(_array),
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        });
    });
};

export const updateTransaction = (uuid: string, amount: number, category_id: number, description: string, date: string) => {
    
db.transaction(tx => {
        tx.executeSql(
            `UPDATE transactions SET amount = ?, category_id = ?, description = ?, date = ?, updated_at = CURRENT_TIMESTAMP WHERE uuid = ?`,
            [amount, category_id, description, date, uuid],
            (_, result) => {
                console.log('Transaction updated successfully');
            },
            (_, error) => {
                console.log('Error updating transaction:', error);
                return false;
            }
        );
    });
};

// Delete a transaction by ID
export const deleteTransaction = async (uuid: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `DELETE FROM transactions WHERE uuid = ?`,
                [uuid],
                () => resolve(),
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        });
    });
};
