"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generator = void 0;
const mysqlgenerator_1 = require("./mysqlgenerator");
const oracleGenerator_1 = require("./oracleGenerator");
const postgresgenerator_1 = require("./postgresgenerator");
const sqlservergenerator_1 = require("./sqlservergenerator");
class Generator {
    static async gen(configPath) {
        configPath = configPath || 'config.json';
        //读文件
        const fs = require('fs');
        let data = fs.readFileSync(configPath, 'utf8');
        if (!data) {
            throw "file not exist";
        }
        let configObj;
        try {
            configObj = JSON.parse(data);
        }
        catch (e) {
            throw e;
        }
        let g;
        console.log('Relaen is generating entities...');
        switch (configObj.dialect) {
            case "oracle":
                g = new oracleGenerator_1.OracleGenerator(configObj);
                break;
            case "mssql":
                g = new sqlservergenerator_1.SqlServerGenerator(configObj);
                break;
            case "postgres":
                g = new postgresgenerator_1.PostgresGennerator(configObj);
                break;
            default: //mysql
                g = new mysqlgenerator_1.MysqlGenerator(configObj);
        }
        await g.gen();
        console.log('Relaen has generated entities successfully!');
    }
}
exports.Generator = Generator;
//# sourceMappingURL=generator.js.map