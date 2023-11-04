import express from "express";
import db from '../database/connect.js';

const router = express.Router();


//POST

// http://localhost:3000/inventory/brand
// {
//     "brand_name": "Royal Challengers"
// }
router.post('/brand', (req, res) => {
  const brand_name = req.body.brand_name;
  
  const query = "INSERT INTO Brand (brand_name) VALUES (?)";
  const values = [brand_name];

  db.run(query, values, function (err) {
    if (err) {
      console.error("Error inserting data:", err.message);
      return res.status(500).send("Failed to Insert Data: " + err.message);
    } else {
      console.log("Data inserted successfully.");
      return res.status(200).send("Success");
    }
  });
});

// http://localhost:3000/inventory/category
// {
//     "category_name": "beer"
// }
router.post('/category', (req, res) => {
    const category_name = req.body.category_name;
    
    const query = "INSERT INTO Category (Category_name) VALUES (?)";
    const values = [category_name];
  
    db.run(query, values, function (err) {
      if (err) {
        console.error("Error inserting data:", err.message);
        return res.status(500).send("Failed to Insert Data: " + err.message);
      } else {
        console.log("Data inserted successfully.");
        return res.status(200).send("Success");
      }
    });
  });


// http://localhost:3000/inventory/item
//   {
//     "brand_id" : 1,
//     "category_id": 1,
//     "ml": 180,
//     "unitStock": 200
//  }
  router.post('/item', (req, res) => {
    try
    {
    const { brand_id , category_id , ml , unitStock} = req.body;
    
    const query = "INSERT INTO Alcohol (brand_id , category_id , ml , Unitstock) VALUES (?,?,?,?)";
    const values = [brand_id , category_id , ml , unitStock];
  
    db.run(query, values, function (err) {
      if (err) {
        console.error("Error inserting data:", err.message);
        return res.status(500).send("Failed to Insert Data: " + err.message);
      } else {
        console.log("Data inserted successfully.");
        return res.status(200).send("Success");
      }
    });
    }
    catch
    {
       res.status(500).send("Server Error"); 
    }
    });

    // http://localhost:3000/inventory/sales
    // {
    //     "customer_name": "HOD" , 
    //     "customer_mobile_No": 2342353213, 
    //     "alcohol_id": 1 , 
    //     "quantity_sold": 10 , 
    //     "unit_price": 2000 , 
    //     "total_price": 20000 , 
    //     "payment_type":"cash"
    //  }
    router.post('/sales', (req, res) => {
     
    db.run(`INSERT INTO Transactions DEFAULT VALUES`, [], function (err) {
      if (err) {
          console.error("Error creating a new transaction:", err.message);
          return res.status(500).send("Failed to create a new transaction: " + err.message);
      }

      // Get the last inserted transaction ID
      const transaction_id = this.lastID;

      try {
          const  items  = req.body; 
          // Iterate through the items in the sales request
          items.forEach(item => {
              const { alcohol_id,customer_name, customer_mobile_No, quantity_sold, unit_price, total_price, payment_type } = item;
              const query = "INSERT INTO Sales (customer_name, customer_mobile_No, alcohol_id, transaction_id, quantity_sold, unit_price, total_price, payment_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
              const values = [customer_name, customer_mobile_No, alcohol_id, transaction_id, quantity_sold, unit_price, total_price, payment_type];

              db.run(query, values, function (err) {
                  if (err) {
                      console.error("Error inserting data:", err.message);
                      res.status(500).send("Failed to Insert Data: " + err.message);
                  } else {
                      console.log("Data inserted successfully.");
                  }
              });
          });

          return res.status(200).send("Success");
      } catch (err) {
          console.error("Server Error:", err.message);
          res.status(500).send("Server Error");
      }
   });
});
     
      //   http://localhost:3000/inventory/addstock
      //   {
      //     "alcohol_id": 1,
      //     "cases": 10,
      //     "bottle": 10,
      //     "actual_price": 160,
      //     "mrp": 180,
      //     "sales_price":220
      // }
        router.post('/addstock', async (req, res) => {
          try {

            const items = req.body;

            items.forEach((item) => {

              let { alcohol_id, cases, bottle, total_bottles, actual_price, mrp, sales_price } = item;
              total_bottles = 0;
              db.all(`
              select a.alcohol_id,c.category_name, a.ml from Alcohol a, Category c
              where a.category_id = c.category_id
              and a.alcohol_id = ?;
              `, [alcohol_id], (err,rows) => {
                if(err)
                {
                  console.log(err.message)
                }
                else
                {
                  total_bottles += bottle;

                  const { alcohol_id, category_name, ml } = rows[0];
                  if(category_name==="beer" && ml === 650)
                  {
                      total_bottles += cases * 12; 
                  } else if( category_name === "beer" && ml === 330)
                  {
                      total_bottles+= cases * 24;
                  } else if( category_name === "beer" && ml === 500)
                  {
                      total_bottles+= cases * 24;
                  
                  }
                  if(category_name === "wisky" || category_name === "rum" || category_name === "gin" || category_name === "vodka")
                  {
                    if(ml === 750)
                    {
                      total_bottles += cases * 12;
                    }else if(ml === 375)
                    {
                      total_bottles += cases * 24;
                    }else if(ml === 180)
                    {
                      total_bottles += cases * 48;
                    }else if(ml === 90)
                    {
                      total_bottles += cases * 96;
                    }else if(ml === 60)
                    {
                      total_bottles += cases * 150;
                    }else if(ml === 1000)
                    {
                      total_bottles += cases * 9;
                    }
                  }
                  if(category_name === "lab")
                  {
                    if(ml === 275)
                    {
                      total_bottles += cases * 24;
                    } 
                  }
                  
                  db.run(`
                  INSERT INTO Received_Stocks (alcohol_id, cases, bottle, total_bottles, actual_price, mrp, sales_price)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
                  [alcohol_id, cases, bottle, total_bottles, actual_price, mrp, sales_price],
                  (err) => {
                    if (err) {
                      console.error("Error inserting data:", err.message);
                      return res.status(500).send("Failed to Insert Data: " + err.message);
                    } else {
                      console.log("Data inserted successfully.");
                      return res.status(200).send("Success");
                    }
                  }
                );
        
                }
              })
              
            })

              
        
            
          } catch (err) {
              // Log the error message
              console.error("Database error:", err.message);
              res.status(500).send("Server Error");
          }
      });
      
            
        
    

export default router;
