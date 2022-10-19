class Dbtype {
    static mysql = {
        // 数值类型
        "tinyint": { "js": "int", "ts": "number" },
        "smallint": { "js": "int", "ts": "number" },
        "mediumint": { "js": "int", "ts": "number" },
        "bigint": { "js": "int", "ts": "number" },
        "integer": { "js": "int", "ts": "number" },
        "int": { "js": "int", "ts": "number" },
        "float": { "js": "float", "ts": "number" },
        "double": { "js": "double", "ts": "number" },
        "decimal": { "js": "double", "ts": "number" },
        "number": { "js": "double", "ts": "number" },
        "numeric": { "js": "double", "ts": "number" },
        "real": { "js": "double", "ts": "number" },
        // 日期时间类型
        "year": { "js": "date", "ts": "string" },
        "datetime": { "js": "date", "ts": "string" },
        "timestamp": { "js": "date", "ts": "string" },
        "date": { "js": "date", "ts": "string" },
        "time": { "js": "date", "ts": "string" },
        // 字符串类型
        "varchar": { "js": "string", "ts": "string" },
        "char": { "js": "string", "ts": "string" },
        "blob": { "js": "string", "ts": "string" },
        "text": { "js": "string", "ts": "string" },
        "tinyblob": { "js": "string", "ts": "string", "length": 256 },
        "tinytext": { "js": "string", "ts": "string" },
        "mediumblob": { "js": "string", "ts": "string" },
        "mediumtext": { "js": "string", "ts": "string" },
        "longblob": { "js": "string", "ts": "string" },
        "longtext": { "js": "string", "ts": "string" },
        "binary": { "js": "string", "ts": "string" },
        "varbinary": { "js": "string", "ts": "string" },
        "json": { "js": "string", "ts": "string" },
        "enum": { "js": "string", "ts": "string" },
        "set": { "js": "string", "ts": "string" },
        "bit": { "js": "string", "ts": "string" },
        "bool": { "js": "boolean", "ts": "boolean" }
    }

    static oracle = {
        // 数值类型
        "NUMBER": { "js": "double", "ts": "number" },
        "INT": { "js": "int", "ts": "number" },
        "INTEGER": { "js": "int", "ts": "number" },
        "SMALLINT": { "js": "int", "ts": "number" },
        "FLOAT": { "js": "float", "ts": "number" },
        "BINARY_FLOAT": { "js": "float", "ts": "number" },
        "BINARY_DOUBLE": { "js": "double", "ts": "number" },
        // 日期类型
        "DATE": { "js": "date", "ts": "string" },
        "TIMESTAMP": { "js": "date", "ts": "string" },
        // 字符串类型
        "CHAR": { "js": "string", "ts": "string" },
        "VARCHAR": { "js": "string", "ts": "string" },
        "VARCHAR2": { "js": "string", "ts": "string" },
        "NCHAR": { "js": "string", "ts": "string" },
        "NVARCHAR2": { "js": "string", "ts": "string" },
        "LONG": { "js": "string", "ts": "string" },
        "CLOB": { "js": "string", "ts": "string" },
        "NCLOB": { "js": "string", "ts": "string" },
        "BLOB": { "js": "string", "ts": "string" },
        "BFILE": { "js": "string", "ts": "string" },
        "RAW": { "js": "string", "ts": "string" },
    }

    static mssql = {
        // 数值类型
        "tinyint": { "js": "int", "ts": "number" },
        "smallint": { "js": "int", "ts": "number" },
        "int": { "js": "int", "ts": "number" },
        "bigint": { "js": "int", "ts": "number" },
        "decimal": { "js": "double", "ts": "number" },
        "numeric": { "js": "double", "ts": "number" },
        "float": { "js": "float", "ts": "number" },
        "smallmoney": { "js": "double", "ts": "number" },
        "money": { "js": "double", "ts": "number" },
        "real": { "js": "double", "ts": "number" },
        // 日期时间类型
        "date": { "js": "date", "ts": "string" },
        "time": { "js": "date", "ts": "string" },
        "datetime": { "js": "date", "ts": "string" },
        "datetime2": { "js": "date", "ts": "string" },
        "smalldatetime": { "js": "date", "ts": "string" },
        "datetimeoffset": { "js": "date", "ts": "string" },
        "timestamp": { "js": "date", "ts": "string" },
        // 字符串类型
        "char": { "js": "string", "ts": "string" },
        "nchar": { "js": "string", "ts": "string" },
        "varchar": { "js": "string", "ts": "string" },
        "nvarchar": { "js": "string", "ts": "string" },
        "text": { "js": "string", "ts": "string" },
        "ntext": { "js": "string", "ts": "string" },
        "xml": { "js": "string", "ts": "string" },
        "uniqueidentifier": { "js": "string", "ts": "string" },
        "variant": { "js": "string", "ts": "string" },
        "binary": { "js": "string", "ts": "string" },
        "varbinary": { "js": "string", "ts": "string" },
        "image": { "js": "string", "ts": "string" },
        "udt": { "js": "string", "ts": "string" },
        "geography": { "js": "string", "ts": "string" },
        "geometry": { "js": "string", "ts": "string" }
    }

    static postgres = {
        // 数值类型
        "int2": { "js": "int", "ts": "number" },
        "int4": { "js": "int", "ts": "number" },
        "int8": { "js": "int", "ts": "number" },
        "decimal": { "js": "double", "ts": "number" },
        "numeric": { "js": "double", "ts": "number" },
        "float4": { "js": "float", "ts": "number" },
        "float8": { "js": "float", "ts": "number" },
        "real": { "js": "number", "ts": "number" },
        "serial2": { "js": "int", "ts": "number" },
        "serial4": { "js": "int", "ts": "number" },
        "serial8": { "js": "int", "ts": "number" },
        "money": { "js": "double", "ts": "number" },
        // 日期时间类型
        "timestamp": { "js": "date", "ts": "string" },
        "date": { "js": "date", "ts": "string" },
        "time": { "js": "date", "ts": "string" },
        "interval": { "js": "date", "ts": "string" },
        // 字符串类型
        "varchar": { "js": "string", "ts": "string" },
        "char": { "js": "string", "ts": "string" },
        "text": { "js": "string", "ts": "string" },
        "json": { "js": "string", "ts": "string" },
        "jsonb": { "js": "string", "ts": "string" },
        "bytea": { "js": "string", "ts": "string" },
        "bool": { "js": "boolean", "ts": "boolean" }
    }

    static sqlite = {
        "INTEGER": { "js": "int", "ts": "number" },
        "REAL": { "js": "double", "ts": "number" },
        "TEXT": { "js": "string", "ts": "string" },
        "BLOB": { "js": "string", "ts": "string" },
        "integer": { "js": "int", "ts": "number" },
        "real": { "js": "double", "ts": "number" },
        "text": { "js": "string", "ts": "string" },
        "blob": { "js": "string", "ts": "string" }
    }

    static mariadb = {
        // 数值类型
        "tinyint": { "js": "int", "ts": "number" },
        "smallint": { "js": "int", "ts": "number" },
        "mediumint": { "js": "int", "ts": "number" },
        "bigint": { "js": "int", "ts": "number" },
        "integer": { "js": "int", "ts": "number" },
        "int": { "js": "int", "ts": "number" },
        "float": { "js": "float", "ts": "number" },
        "double": { "js": "double", "ts": "number" },
        "decimal": { "js": "double", "ts": "number" },
        "number": { "js": "double", "ts": "number" },
        "numeric": { "js": "double", "ts": "number" },
        "real": { "js": "double", "ts": "number" },
        // 日期时间类型
        "year": { "js": "date", "ts": "string" },
        "datetime": { "js": "date", "ts": "string" },
        "timestamp": { "js": "date", "ts": "string" },
        "date": { "js": "date", "ts": "string" },
        "time": { "js": "date", "ts": "string" },
        // 字符串类型
        "varchar": { "js": "string", "ts": "string" },
        "char": { "js": "string", "ts": "string" },
        "blob": { "js": "string", "ts": "string" },
        "text": { "js": "string", "ts": "string" },
        "tinyblob": { "js": "string", "ts": "string", "length": 256 },
        "tinytext": { "js": "string", "ts": "string" },
        "mediumblob": { "js": "string", "ts": "string" },
        "mediumtext": { "js": "string", "ts": "string" },
        "longblob": { "js": "string", "ts": "string" },
        "longtext": { "js": "string", "ts": "string" },
        "binary": { "js": "string", "ts": "string" },
        "varbinary": { "js": "string", "ts": "string" },
        "json": { "js": "string", "ts": "string" },
        "enum": { "js": "string", "ts": "string" },
        "set": { "js": "string", "ts": "string" },
        "bit": { "js": "string", "ts": "string" },
        "bool": { "js": "boolean", "ts": "boolean" }
    }
}

export { Dbtype }