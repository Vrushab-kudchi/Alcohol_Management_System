import sqlite3 from 'sqlite3';
const sqlite3Verbose = sqlite3.verbose();

const db = new sqlite3Verbose.Database('./master.db');

// Creating Tables
db.serialize(() => {
  // Create Category Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Category (
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT
    )
  `);

  // Create Brand Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Brand (
      brand_id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_name TEXT
    )
  `);

  // Create Alcohol Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Alcohol (
      alcohol_id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_id INTEGER,
      category_id INTEGER,
      ml INTEGER,
      Unitstock INTEGER default 0,
      FOREIGN KEY (category_id) REFERENCES Category(category_id),
      FOREIGN KEY (brand_id) REFERENCES Brand(brand_id)
    )
  `);

  //Alcohol View
  db.run(`
  CREATE VIEW IF NOT EXISTS Alcohol_View AS
  SELECT a.alcohol_id, b.brand_name, c.category_name, a.ml, a.Unitstock, rs.actual_price, rs.mrp, rs.sales_price
  FROM Alcohol a, Category c, Brand b, Received_Stocks rs
  WHERE a.brand_id = b.brand_id
  AND a.category_id = c.category_id
  AND a.alcohol_id = rs.alcohol_id;
`);


  // user
  db.run(`
  CREATE TABLE IF NOT EXISTS User (
    accId INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT,
    user_type TEXT
  )
`)

  // Sales
  db.run(`
  CREATE TABLE IF NOT EXISTS Sales (
      record_id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER,
      customer_name TEXT,
      customer_mobile_No INTEGER,
      alcohol_id INTEGER,
      quantity_sold INTEGER,
      unit_price REAL,
      total_price REAL,
      payment_type TEXT,
      mrp_price_profit REAL,
      actual_price_profit REAL,
      FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id),
      FOREIGN KEY (alcohol_id) REFERENCES Alcohol(alcohol_id)
  );
`);

  // Trigger for Sales

  db.run(`-- Create a trigger to update unit_stock when a sale occurs
  CREATE TRIGGER IF NOT EXISTS update_unit_stock
  AFTER INSERT ON Sales
  BEGIN
    -- Subtract the quantity_sold from the unit_stock in the Alcohol table
    UPDATE Alcohol
    SET Unitstock = Unitstock - NEW.quantity_sold
    WHERE alcohol_id = NEW.alcohol_id;
  END;
  `)

//Sales Transaction

db.run(`CREATE TABLE IF NOT EXISTS Transactions (
  transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
`)

// Sales Transaction View

db.run(`CREATE VIEW IF NOT EXISTS Transactions_view AS
      SELECT s.transaction_id, s.customer_name, s.customer_mobile_no,a.brand_name,a.category_name,a.ml,s.quantity_sold,s.unit_price,s.total_price,s.payment_type,s.mrp_price_profit,s.actual_price_profit
      from Sales s, Alcohol_View a, Transactions t
      where s.transaction_id = t.transaction_id
      and s.alcohol_id = a.alcohol_id;`)


  // Received Stocks

  db.run(`CREATE TABLE IF NOT EXISTS Received_Stocks (
    invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
    alcohol_id INTEGER, -- Reference to the Alcohol table
    cases INTEGER,
    bottle INTEGER,
    total_bottles INTEGER, -- Total number of bottles received (cases x bottles)
    actual_price REAL,
    mrp REAL,
    sales_price REAL
  );
  `)

  // Trigger to Add Stocks To Alochol

  db.run(`-- Create a trigger to update Unitstock when new stock is received
  CREATE TRIGGER IF NOT EXISTS update_unitstock_on_stock_received
  AFTER INSERT ON Received_Stocks
  BEGIN
    -- Add the total_bottles to the Unitstock in the Alcohol table
    UPDATE Alcohol
    SET Unitstock = Unitstock + NEW.total_bottles
    WHERE alcohol_id = NEW.alcohol_id;
  END;
  `)


  // Inserts



});

export default db;
