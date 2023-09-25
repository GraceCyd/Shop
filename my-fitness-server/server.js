
const SECRET_KEY = "MySecretKey";

const express = require("express");
var mysql = require("mysql");

//เรียกใช้ jsonwebtoken
const jwt = require("jsonwebtoken");
console.log(jwt);

//สร้าง server
const app = express();
console.log(app);
const bodyParser = require("body-parser");
console.log(bodyParser);
const util = require('util');
console.log(util);
const User = require("./libs/User");
const User = require("./libs/Product");
const { error } = require("console");
const Product = require("./libs/Product");
console.log(User);
const port = 3000;
console.log(port);



app.use(bodyParser.urlencoded({ extends: false }));
app.use(bodyParser.json());

var pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "1234",
    database: "my_fisness"
});

pool.query = util.promisify(pool.query);

// pool.getConnection((err, connection) => {
//     if (err) {
//         console.error('Error getting connection from pool:', err.message);
//         return;
//     }
//     connection.query('SELECT * FROM  user', (err, results) => {
//         // Release the connection back to the pool after the query is executed
//         connection.release();

//         if (err) {
//             console.error('Error executing query:', err.message);
//             return;
//         }

//         console.log('Query results:', results);
//     });

// });

// Example: executing a query using the pool
// pool.getConnection((err, connection) => {
//     if (err) {
//         console.error('Error getting connection from pool:', err.message);
//         return;
//     }

//     connection.query('INSERT INTO your_table (column1, column2) VALUES (?, ?)', ['value1', 'value2'], (err, result) => {
//         connection.release();

//         if (err) {
//             console.error('Error executing query:', err.message);
//             return;
//         }

//         console.log('Inserted row:', result.insertId);
//     });
// });



//เรียกใช้ express

app.post("/api/access_request", async (req, res) => {
    const authenSignature = req.body.auth_signature;
    console.log(authenSignature);
    const authToken = req.body.auth_token;
    console.log(authToken);

    var decoded = jwt.verify(authToken, SECRET_KEY);
    console.log(decoded);

    if (decoded) {
        let  result = await User.checkPassword(pool, authenSignature);

        console.log(result);


        if (result.length >0 ) {
            var data = result[0];

            var payload = {
                user_id: data.user_id, username: data.username, first_name: data.first_name,
                last_name: data.last_name, email: data.email,
                role_id: data.role_id, role_name: data.role_name
            };

            const accessToken = jwt.sign(payload, SECRET_KEY);
            console.log(accessToken);

            res.json({
                result: true,
                access_token: accessToken,
                data: payload
            });

        } else {
            res.json({
                result: false,
                message: "Username หรือ Password ไม่ถูกต้อง"
            });
        }
    } else {
        res.json({
            result: false,
            message: "Usernsme  หรือ Password ไม่ถูกต้อง"
        });

    }
});


app.post("/api/authen_request", (req, res) => {
    const username = req.body.username;
    //console.log("222222");
    const sql = "SELECT * FROM user WHERE MD5(user_name) = ? ";
    pool.query(sql, [username], (error, result) => {

        //ถ้าเกิด error จะส่งข้อมูลรายละเอียดข้อผิดพลาดไปยัง client
        if (error) {
            res.json({
                result: false,
                message: error.message
            })
        } else {
            // ตรวจสอบค่า มีข้อมูล username ที่ส่งมาในฐานข้อมูลหรือไม่
            // ตรวจสอบโดยนับจำนวนแถวของข้อมูลที่ได้รับจากรากฐานข้อมูล
            // ถ้า results.length (จำนวนแถว) เป็น 0 แปลว่าไม่พบข้อมูลในฐษนข้อมูล
            if (result.length >0) {

                //สร้างตัวแปร payload เพื่อเก็บข้อมูลที่จะทำให้ authenToken
                var payload = { username: username };

                //สร้าง authenToken โดยใช้ function ของ jwt 
                const authToken = jwt.sign(payload, SECRET_KEY);

                //ส่ง authenToken กลับไปยัง client 
                res.json({
                    result: true,
                    auth_token: authToken
                });


            } else {
                res.json({
                    result: false,
                    message: "ไม่พบข้อมูลผู้ใช้"
                });

            }
        }
    });


});

app.post("/api/product/add", checkAuth, async (req, res) => {
    const input = req.body;

    try {
        var result = await Product.createProduct(pool,
            input.product_name, input.product_type_id,
            input.price, input.stock);

        res.json({
            result: true
        });
    } catch (ex) {
        res.json({
            result: false,
            message: ex.message
        });
    }
});

app.listen(port, () => {
console.log(listen);

});

app.get("/api/product_types",checkAuth,(req,res) => {
    const query = "SELECT * FROM product_types";

    pool.query(query,(error,result) => {
        if (error){
            res.json({
                result: false,
                message: error.message
            })
        } else {
            res.json({
                result: true,
                data: results
            });

        }
    });
});

app.post("/create", async (req, res) => {
    const { email, name, password } = req.body;

    try {
        connection.query(
            "INSERT INTO users(email, fullname, password) VALUES(?, ?, ?)",
            [email, name, password],
            (err, results, fields) => {
                if (err) {
                    console.log("Error while inserting a user into the database", err);
                    return res.status(400).send();
                }
                return res.status(201).json({ message: "New user successfully created!"});
            }
        )
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

// READ
app.get("/read", async (req, res) => {
    try {
        connection.query("SELECT * FROM users", (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            res.status(200).json(results)
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

// READ single users from db
app.get("/read/single/:email", async (req, res) => {
    const email = req.params.email;

    try {
        connection.query("SELECT * FROM users WHERE email = ?", [email], (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            res.status(200).json(results)
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

// UPDATE data
app.patch("/update/:email", async (req, res) => {
    const email = req.params.email;
    const newPassword = req.body.newPassword;

    try {
        connection.query("UPDATE users SET password = ? WHERE email = ?", [newPassword, email], (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            res.status(200).json({ message: "User password updated successfully!"});
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

// DELETE
app.delete("/delete/:email", async (req, res) => {
    const email = req.params.email;

    try {
        connection.query("DELETE FROM users WHERE email = ?", [email], (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "No user with that email!"});
            }
            return res.status(200).json({ message: "User deleted successfully!"});
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

app.listen(3000, () => console.log('Server is running on port 3000'));