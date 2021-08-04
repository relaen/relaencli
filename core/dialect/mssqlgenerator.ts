import { BaseGenerator } from "../basegenerator";
import { IColumn, IRelation } from "../types";

/**
 * mssql 生成器
 */
class MssqlGenerator extends BaseGenerator {

    /**
     * 获取连接
     * @returns 数据库连接对象
     */
    async getConn() {
        const db = require("mssql");
        let options = {
            user: this.config.options.user,
            password: this.config.options.password,
            server: this.config.options.host,
            port: this.config.options.port,
            database: this.config.options.database,
            options: {
                encrypt: false, // for azure
                trustServerCertificate: true // change to true for local dev / self-signed certs
            }
        }
        this.config.options.schema = this.config.options.schema || "dbo";
        if (this.config.options.schema !== "dbo") {
            this.config.schema = this.config.options.schema;
        }
        return await db.connect(options);
    }

    /**
     * 关闭连接
     * @param conn  数据库连接对象 
     */
    async closeConn(conn: any) {
        await conn.close();
    }

    /**
     * 生成表实体
     * @param conn  数据库连接对象
     */
    async genTables(conn: any) {
        let sql = "SELECT s.name as schemaName,o.name as tableName from sys.schemas s, sys.objects o where o.type ='u' and o.schema_id = s.schema_id and s.name = @0";
        let results = await conn.request().input("0", this.config.options.schema).query(sql);
        for (let r of results.recordset) {
            let table = r.tableName;
            let en: string = this.genName(table, this.config.tableSplit, this.config.tableStart, 0);
            this.tables.set(en, table);
        }
    }

    /**
     * 获取字段数组
     * @param conn          数据库连接对象
     * @param tableName     表名
     * @returns             字段对象数组
     */
    async getFields(conn: any, tableName: string): Promise<IColumn[]> {
        let results = await conn.request().input("0", tableName).input("1", this.config.options.schema).input("2", this.config.options.schema + "." + tableName)
            .query(`SELECT s.name, t.name as type, s.length, s.isnullable, p.column_name as idName FROM syscolumns s
                LEFT JOIN(SELECT k.column_name FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE k, sysobjects o, sys.objects o1, sys.schemas c 
                WHERE k.constraint_name = o.name AND o.id = o1.object_id AND o.xtype = 'PK' AND k.TABLE_SCHEMA = @1 AND k.TABLE_NAME = @0 AND o1.schema_id = c.schema_id and c.name = @1) p 
                ON s.name = p.column_name LEFT JOIN systypes t ON s.xusertype = t.xusertype WHERE id = OBJECT_ID(@2)`);
        let identitys = await conn.request().input("0", this.config.options.schema + "." + tableName).query("select name from syscolumns where id=object_id(@0) and status=0x80");
        let arr: IColumn[] = [];
        for (let f of results.recordset) {
            let column = {
                field: f.name,
                isPri: f.idName ? true : false,
                type: f.type,
                nullable: f.isnullable ? true : false,
            }
            if (["char", "nchar", "varchar", "nvarchar"].includes(f.type)) {
                column["length"] = f.length;
            }
            for (let identity of identitys.recordset) {
                if (identity.name == f.name) {
                    column["identity"] = true;
                    break;
                }
            }
            arr.push(column)
        }
        return arr;
    }

    /**
     * 生成外键关系
     * @param conn  数据库连接对象
     */
    async genRelations(conn: any) {
        let relArr: IRelation[] = [];
        let sql = `SELECT a.name AS constraintName,SCHEMA_NAME(a.schema_id) as schemaName,object_name(b.parent_object_id) AS tableName,c.name AS columnName,object_name(b.referenced_object_id) AS refTableName,d.name AS refColumnName,a.delete_referential_action_desc as deleteRule,a.update_referential_action_desc as updateRule
            FROM sys.foreign_keys A INNER JOIN sys.foreign_key_columns B ON A.object_id = b.constraint_object_id
            INNER JOIN sys.columns C ON B.parent_object_id = C.object_id AND B.parent_column_id = C.column_id
            INNER JOIN sys.columns D ON B.referenced_object_id = d.object_id AND B.referenced_column_id = D.column_id
            INNER JOIN sys.schemas s ON s.schema_id = a.schema_id and s.name = @0`;
        let result = await conn.request().input("0", this.config.options.schema).query(sql);
        for (let rel of result.recordset) {
            relArr.push({
                column: rel.columnName,
                refColumn: rel.refColumnName,
                // delete: Util.getConstraintRule(rel.deleteRule),
                // update: Util.getConstraintRule(rel.updateRule),
                entity: this.getEntityByTbl(rel.tableName),
                refEntity: this.getEntityByTbl(rel.refTableName)
            });
        }
        this.handleRelation(relArr);
    }
}

export { MssqlGenerator }