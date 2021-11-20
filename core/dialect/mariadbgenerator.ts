import { IRelation, IColumn } from "../types";
import { BaseGenerator } from "../basegenerator";

/**
 * mariadb 生成器
 */
class MariadbGenerator extends BaseGenerator {

    /**
     * 获取连接
     * @returns 数据库连接对象 
     */
    async getConn() {
        const db = require("mariadb");
        return await db.createConnection(this.config.options);
    }

    /**
     * 关闭连接
     * @param conn  数据库连接对象 
     */
    async closeConn(conn: any) {
        await conn.end();
    }

    /**
     * 生成表实体
     * @param conn  数据库连接对象
     */
    async genTables(conn: any) {
        await this.changeDb(conn, this.config.options.database);
        let results: Array<any> = await conn.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'", [this.config.options.database]);
        for (let r of results) {
            let props = Object.getOwnPropertyNames(r);
            let tn = r[props[0]];
            let en: string = this.genName(tn, this.config.tableSplit, this.config.tableStart, 0);
            this.tables.set(en, tn);
        }
    }

    /**
     * 获取字段数组
     * @param conn          数据库连接对象
     * @param tableName     表名
     * @returns             字段对象数组
     */
    async getFields(conn: any, tableName: string): Promise<IColumn[]> {
        let results: Array<any> = await conn.query("desc " + tableName);
        let arr: IColumn[] = [];
        for (let r of results) {
            arr.push({
                field: r.Field,
                isPri: r.Key === "PRI",
                type: r.Type,
                nullable: r.Null === "YES"
            })
        }
        return arr;
    }

    /**
     * 生成外键关系
     * @param conn          数据库连接对象 
     */
    async genRelations(conn: any) {
        //切换到information系统数据库
        await this.changeDb(conn, "information_schema");
        //获取外键信息
        let sql: string = `select constraint_name as constraintName,table_name as tableName,column_name as columnName,
            referenced_table_name as refTableName,referenced_column_name as refColumnName from key_column_usage 
            where referenced_column_name is not null and table_schema=?`;
        let results: Array<any> = await conn.query(sql,[this.config.options.database]);
        let relArr: IRelation[] = [];
        for (let r of results) {
            //外键delete和update规则
            sql = `select update_rule as updateRule,delete_rule as deleteRule from referential_constraints 
                where UNIQUE_CONSTRAINT_SCHEMA=? and CONSTRAINT_NAME=?`;
            let results1: Array<any> = await conn.query(sql,[this.config.options.database,r.constraintName]);
            if (results1.length > 0) {
                let r1 = results1[0];
                relArr.push({
                    column: r.columnName, //字段名
                    refColumn: r.refColumnName,//引用字段名
                    // delete: Util.getConstraintRule(r1.deleteRule),
                    // update: Util.getConstraintRule(r1.updateRule),
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
    async changeDb(conn: any, db: string) {
        await conn.query("use " + db);
    }
}

export { MariadbGenerator };