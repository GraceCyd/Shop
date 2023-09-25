const mysql = require("mysql");






module.exports = {
    checkPassword: async (pool, authenSignature) => {
        let sql = "SELECT a.user_id, a.user_name, a.first_name, a.last_name,"
                    +"a.email, a.role_id, b.role_name, "//a.gender_id, b.gender_name
                    +"FROM user a JOIN role  b ON a.role_id = b.role_id"
                    
                    +"WHERE MD5(CONCAT(user_name, '&', user_pwd)) = ?";

        sql = mysql.format(sql, [authenSignature]);

        return await pool.query(sql);
    }
}