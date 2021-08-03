import { BaseGenerator } from "../basegenerator";
import { IColumn, IRelation } from "../types";

/**
 * oracle 生成器
 */
class OracleGenerator extends BaseGenerator {

    /**
     * 获取连接
     * @returns 数据库连接对象 
     */
    async getConn() {
        const oracledb = require("oracledb");
        let options = {
            user: this.config.options.user,
            password: this.config.options.password,
            connectString: this.config.options.host + ":" + this.config.options.port + "/" + this.config.options.database
        }
        this.config.options.schema = this.config.options.schema || this.config.options.user;
        if (this.config.options.schema !== this.config.options.user) {
            this.config.schema = this.config.options.schema;
        }
        return await oracledb.getConnection(options);
    }

    /**
     * 关闭连接
     * @param conn 数据库连接对象
     */
    async closeConn(conn: any) {
        await conn.close();
    }

    /**
     * 生成表实体
     * @param conn  数据库连接对象
     */
    async genTables(conn: any) {
        let sql = "SELECT TABLE_NAME FROM ALL_TABLES WHERE OWNER=:0";
        let tables: any = await conn.execute(sql, [this.config.options.schema]);
        // 遍历表名数组
        for (let t of tables["rows"]) {
            let table = t[0];
            let en: string = this.genName(table, this.config.tableSplit, this.config.tableStart, 0);
            this.tables.set(en, table);
        }

    }

    /**
     * 获取字段数组
     * @param conn          连接
     * @param tableName     表名
     * @returns             字段对象数组
     */
    async getFields(conn: any, tableName: string): Promise<IColumn[]> {
        // 查询每个表结构字段
        let fields = await conn.execute("select column_name,data_type,data_length,nullable from all_tab_columns where owner=:0 and table_name=:1", [this.config.options.schema, tableName]);
        let PrimaryKeys = await conn.execute("SELECT a.column_name from dba_constraints c LEFT JOIN all_cons_columns a ON a.constraint_name = c.constraint_name where c.owner=:0 and c.table_name = :1 and c.constraint_type = 'P'", [this.config.options.schema, tableName]);
        let arr: IColumn[] = [];
        for (let f of fields["rows"]) {
            let isPriKey = false;
            for (let p of PrimaryKeys.rows) {
                if (p[0] === f[0]) {
                    isPriKey = true;
                    break;
                }
            }
            let column = {
                field: f[0],
                isPri: isPriKey,
                type: f[1],
                nullable: f[3] === 'Y' ? true : false
            }
            if (["CHAR", "VARCHAR", "VARCHAR2", "NCHAR", "NVARCHAR2"].includes(f[1])) {
                column["length"] = f[2];
            }
            arr.push(column);
        }
        return arr;
    }

    /**
     * 生成外键关系
     * @param conn  数据库连接对象
     */
    async genRelations(conn: any) {
        let sql = `SELECT c.constraint_name as constraintName,l.table_name as tableName,l.column_name as columnName,r.table_name as refTableName,r.column_name as refColumnName,c.delete_rule as deleteRule
        FROM dba_constraints c LEFT JOIN all_cons_columns l ON c.constraint_name = l.constraint_name LEFT JOIN all_cons_columns r ON c.r_constraint_name = r.constraint_name
        WHERE c.constraint_type = 'R' AND c.owner=:0`;
        let relations = await conn.execute(sql, [this.config.options.schema]);
        let arr: IRelation[] = [];
        for (let r of relations["rows"]) {
            arr.push({
                column: r[2],
                refColumn: r[4],
                // delete: Util.getConstraintRule(r[5]),   // NOT ACTION/CASCADE/SET NULL
                // update: Util.getConstraintRule("none"),
                entity: this.getEntityByTbl(r[1]),
                refEntity: this.getEntityByTbl(r[3])
            });
        }
        this.handleRelation(arr);
    }

}
export { OracleGenerator }