const mysql = require("mysql");

module.exports = {
    createProduct: async (pool, productName,productTypeId,price,stock) => {
        var sql = "INSERT INTO products(product_name, product_type_id, price, stock)"

        sql = mysql.format(sql,[productName, productTypeId, price, stock]);

        return await pool.query(sql);



    }
}