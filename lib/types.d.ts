// Category Type
export interface Category {
    id?: number; // Autoincrement field, may not be present when creating a new entry
    name: string;
    image: string;
    type: 'income' | 'expense';
    created_at?: string; // Optional as it's auto-generated
    updated_at?: string; // Optional as it's auto-generated
}

// Transaction Type
export interface Transaction {
    id?: number; // Autoincrement field
    uuid: string;
    category_id: number;
    amount: number;
    description?: string;
    date: string; // Date field for the transaction
    source_id?: number; // Optional foreign key
    created_at?: string; // Optional as it's auto-generated
    updated_at?: string; // Optional as it's auto-generated
}

// Source Type
export interface Source {
    id?: number; // Autoincrement field
    name: string;
    created_at?: string; // Optional as it's auto-generated
    updated_at?: string; // Optional as it's auto-generated
}

export interface Details {
    message: string,
    type: string,
    amount: number,
    date: string
}

export interface Message {
    message: string;
    sender: string;
    timestamp: number;
    [key: string]: any;
}

// General Database Operation Result Types
export interface InsertResult {
    insertId: number; // For insert operations
}

export interface UpdateResult {
    rowsAffected: number; // For update or delete operations
}

export interface SelectResult<T> {
    rows: {
        length: number;
        _array: T[]; // The result set returned by the query
        item(index: number): T; // Access a specific item
    };
}

// Promise-based utility types
export type DbResultPromise<T> = Promise<SelectResult<T>>;
export type DbExecutePromise = Promise<void | UpdateResult>;
