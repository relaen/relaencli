"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlGenerator = void 0;
const util_1 = require("./util");
const basegenerator_1 = require("./basegenerator");
/**
 * mysql 生成器
 */
class MysqlGenerator extends basegenerator_1.BaseGenerator {
    constructor(config) {
        super(config);
    }
    async getConn() {
        const db = require('mysql');
        return await db.createConnection(this.config.options);
    }
    /**
     * 获取表名数组
     * @param conn  数据库连接对象
     */
    async genTables(conn) {
        await this.changeDb(conn, this.config.options.database);
        let results = await new Promise((resolve, reject) => {
            conn.query("show tables", (error, results, fields) => {
                if (error) {
                    reject(error);
                }
                resolve(results);
            });
        });
        for (let r of results) {
            let props = Object.getOwnPropertyNames(r);
            let tn = r[props[0]];
            //entity name
            let en = this.genName(tn, this.config.tableSplit, this.config.tableStart, 0);
            this.tables.set(en, tn);
        }
    }
    /**
     * 获取字段数组
     * @param conn          连接
     * @param tableName     表名
     * @returns             字段对象数组
     */
    async getFields(conn, tableName) {
        let results = await new Promise((resolve, reject) => {
            conn.query("desc " + tableName, (error, results, fields) => {
                if (error) {
                    reject(error);
                }
                resolve(results);
            });
        });
        let arr = [];
        for (let r of results) {
            arr.push({
                field: r.Field,
                isPri: r.Key === 'PRI',
                type: r.Type,
                nullable: r.Null === 'YES'
            });
        }
        return arr;
    }
    /**
     * 处理关系
     * @param entityName
     */
    async genRelations(conn) {
        //切换到information系统数据库
        await this.changeDb(conn, "information_schema");
        //获取外键信息
        let sql = "select constraint_name as constraintName,table_name as tableName,column_name as columnName," +
            "referenced_table_name as refTableName,referenced_column_name as refColumnName from key_column_usage " +
            "where referenced_column_name is not null and table_schema='" + this.config.options.database + "'";
        let results = await new Promise((resolve, reject) => {
            conn.query(sql, (error, results, fields) => {
                if (error) {
                    reject(error);
                }
                resolve(results);
            });
        });
        let relArr = [];
        for (let r of results) {
            //外键delete和update规则
            sql = "select update_rule as updateRule,delete_rule as deleteRule from referential_constraints " +
                "where UNIQUE_CONSTRAINT_SCHEMA='" + this.config.options.database + "' and CONSTRAINT_NAME='" + r.constraintName + "'";
            let results1 = await new Promise((resolve, reject) => {
                conn.query(sql, (error, results, fields) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(results);
                });
            });
            if (results1.length > 0) {
                let r1 = results1[0];
                relArr.push({
                    column: r.columnName,
                    refColumn: r.refColumnName,
                    delete: util_1.Util.getConstraintRule(r1.deleteRule),
                    update: util_1.Util.getConstraintRule(r1.updateRule),
                    entity: this.getEntityByTbl(r.tableName),
                    refEntity: this.getEntityByTbl(r.refTableName)
                });
            }
        }
        this.handleRelation(relArr);
        //切换回原数据库
        await this.changeDb(conn, this.config.options.database);
    }
    /**
     * 切换数据库
     * @param conn  数据库连接对象
     * @param db    数据库名
     */
    async changeDb(conn, db) {
        await new Promise((resolve, reject) => {
            conn.query("use " + db, (error, results, fields) => {
                if (error) {
                    reject(error);
                }
                resolve(results);
            });
        });
    }
}
exports.MysqlGenerator = MysqlGenerator;
//# sourceMappingURL=mysqlgenerator.js.map