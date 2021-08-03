import { BaseGenerator } from "../basegenerator";
import { IColumn, IRelation } from "../types";

/**
 * postgres 生成器
 */
class PostgresGennerator extends BaseGenerator {

    /**
     * 获取连接
     * @returns 数据库连接对象
     */
    async getConn() {
        const pg = require("pg");
        const options = {
            user: this.config.options.user,
            host: this.config.options.host,
            database: this.config.options.database,
            password: this.config.options.password,
            port: this.config.options.port
        }
        this.config.options.schema = this.config.options.schema || "public";
        if (this.config.options.schema !== "public") {
            this.config.schema = this.config.options.schema;
        }
        let conn = new pg.Client(options);
        await conn.connect();
        return conn;
    }

    /**
     * 关闭连接
     * @param conn 数据库连接对象   
     */
    async closeConn(conn: any) {
        await conn.end();
    }

    /**
     * 生成表实体
     * @param conn 数据库连接对象
     */
    async genTables(conn: any) {
        let sql = "SELECT tablename FROM pg_tables WHERE SCHEMANAME = $1";
        let tables = await conn.query(sql, [this.config.options.schema]);
        for (let t of tables["rows"]) {
            let en: string = this.genName(t.tablename, this.config.tableSplit, this.config.tableStart, 0);
            this.tables.set(en, t.tablename);
        }
    }

    /**
     * 获取字段数组
     * @param conn          连接
     * @param tableName     表名
     * @returns             字段对象数组
     */
    async getFields(conn: any, tableName: string): Promise<IColumn[]> {
        let sql = `SELECT a.COLUMN_NAME AS NAME,a.is_nullable::bool AS NULLABLE,a.udt_name AS TYPE,
                    COALESCE (a.character_maximum_length,a.numeric_precision,-1) AS LENGTH,
                    CASE WHEN LENGTH (B.attname) > 0 THEN 1 ELSE 0 END::bool AS ispri
                FROM information_schema.COLUMNS a
                LEFT JOIN (
                    SELECT pg_attribute.attname
                    FROM pg_index,pg_class,pg_attribute
                    WHERE pg_class.oid = $1 :: regclass AND pg_index.indrelid = pg_class.oid
                    AND pg_attribute.attrelid = pg_class.oid
                    AND pg_attribute.attnum = ANY (pg_index.indkey)
                    AND pg_index.indisprimary = 't' 
                ) b ON a.COLUMN_NAME = b.attname
                WHERE a.table_schema = $2 AND a.TABLE_NAME = $3;`
        let fields = await conn.query(sql, [this.config.options.schema + "." + tableName, this.config.options.schema, tableName]);
        let arr: IColumn[] = [];
        for (let f of fields.rows) {
            let column = {
                field: f.name,
                isPri: f.ispri,
                type: f.type,
                nullable: f.nullable
            }
            if (["varchar","char"].includes(f.type)) {
                column["length"] = f.length;
            }
            arr.push(column);
        }
        return arr;
    }

    /**
     * 生成外键关系
     * @param conn 数据库连接对象
     */
    async genRelations(conn: any) {
        let sql = `SELECT tc.TABLE_NAME as table,kcu.COLUMN_NAME as column,ccu.TABLE_NAME AS reftable,ccu.COLUMN_NAME AS refcolumn,
                    CASE P .confupdtype
                    WHEN 'r' THEN 'RESTRICT'
                    WHEN 'a' THEN 'NO ACTION'
                    WHEN 'c' THEN 'CASCADE'
                    WHEN 'n' THEN 'SET NULL'
                    WHEN 'd' THEN 'SET DEFAULT'
                    END AS updateRule,
                    CASE P .confdeltype
                    WHEN 'r' THEN 'RESTRICT'
                    WHEN 'a' THEN 'NO ACTION'
                    WHEN 'c' THEN 'CASCADE'
                    WHEN 'n' THEN 'SET NULL'
                    WHEN 'd' THEN 'SET DEFAULT'
                    END AS deleteRule
                FROM
                    information_schema.table_constraints AS tc
                LEFT JOIN information_schema.key_column_usage AS kcu ON tc. CONSTRAINT_NAME = kcu. CONSTRAINT_NAME AND kcu.table_schema = $1
                LEFT JOIN information_schema.constraint_column_usage AS ccu ON ccu. CONSTRAINT_NAME = tc. CONSTRAINT_NAME AND ccu.table_schema = $1
                LEFT JOIN (select c.* from pg_constraint c, pg_catalog.pg_namespace n where	c.connamespace = n.oid AND n.nspname = $1 AND contype = 'f') P ON tc. CONSTRAINT_NAME = P.conname
                WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.constraint_schema = $1`;
        let relations = await conn.query(sql, [this.config.options.schema]);
        let arr: IRelation[] = [];
        for (let r of relations.rows) {
            arr.push({
                column: r.column,
                refColumn: r.refcolumn,
                // delete: Util.getConstraintRule(r.deleterule),
                // update: Util.getConstraintRule(r.updaterule),
                entity: this.getEntityByTbl(r.table),
                refEntity: this.getEntityByTbl(r.reftable)
            });
        }
        this.handleRelation(arr);
    }
}

export { PostgresGennerator }