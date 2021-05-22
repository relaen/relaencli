class Dbtype{
    static mysql = {
        "tinyint":{"js":"int","ts":"number"},
        "smallint":{"js":"int","ts":"number"},
        "mediumint":{"js":"int","ts":"number"},
        "bigint":{"js":"int","ts":"number"},
        "integer":{"js":"int","ts":"number"},
        "int":{"js":"int","ts":"number"},
        "float":{"js":"float","ts":"number"},
        "double":{"js":"double","ts":"number"},
        "decimal":{"js":"double","ts":"number"},
        "number":{"js":"double","ts":"number"},
        "numeric":{"js":"double","ts":"number"},
        "real":{"js":"double","ts":"number"},
    
        "year":{"js":"date","ts":"string"},
        "datetime":{"js":"date","ts":"string"},
        "timestamp":{"js":"date","ts":"string"},
        "date":{"js":"date","ts":"string"},
        "time":{"js":"date","ts":"string"},
        
        "varchar":{"js":"string","ts":"string"},
        "char":{"js":"string","ts":"string"},
        "tinyblob":{"js":"string","ts":"string","length":256},
        "mediumblog":{"js":"string","ts":"string"},
        "longblog":{"js":"string","ts":"string"},
        "blob":{"js":"string","ts":"string"},
        "longtext":{"js":"string","ts":"string"},
        "text":{"js":"string","ts":"string"},
        
        "varbinary":{"js":"string","ts":"string"}
    }

    static oracle = {
        "NUMBER": { "js": "number", "ts": "number" },
        "INTEGER": { "js": "number", "ts": "number" },
        "INT": { "js": "number", "ts": "number" },
        "SMALLINT": { "js": "number", "ts": "number" },
        "FLOAT": { "js": "number", "ts": "number" },
        "BINARY_FLOAT": { "js": "number", "ts": "number" },
        "BINARY_DOUBLE": { "js": "number", "ts": "number" },

        "DATE": { "js": "date", "ts": "string" },
        "TIMESTAMP": { "js": "date", "ts": "string" },

        "CHAR": { "js": "string", "ts": "string" },
        "VARCHAR": { "js": "string", "ts": "string" },
        "2VARCHAR2": { "js": "string", "ts": "string" },
        "NCHAR": { "js": "string", "ts": "string" },
        "NVARCHAR2": { "js": "string", "ts": "string" },

        "LONG": { "js": "string", "ts": "string" },
        "CLOB": { "js": "string", "ts": "string" },
        "NCLOB": { "js": "string", "ts": "string" },
        "BLOB": { "js": "string", "ts": "string" },
        "BFILE": { "js": "string", "ts": "string" }
    }

    static mssql = {
        "int": { "js": "number", "ts": "number" },
        "bigint": { "js": "number", "ts": "number" },
        "decimal": { "js": "number", "ts": "number"},
        "float": { "js": "number", "ts": "number" },
        "money": { "js": "number", "ts": "number" },
        "numeric": { "js": "number", "ts": "number" },
        "smallint": { "js": "number", "ts": "number" },
        "smallmoney": { "js": "number", "ts": "number" },
        "real": { "js": "number", "ts": "number" },
        "tinyint": { "js": "number", "ts": "number" },

        "char": { "js": "string", "ts": "string" },
        "nchar": { "js": "string", "ts": "string" },
        "text": { "js": "string", "ts": "string" },
        "ntext": { "js": "string", "ts": "string" },
        "varchar": { "js": "string", "ts": "string" },
        "nvarchar": { "js": "string", "ts": "string" },
        "xml": { "js": "string", "ts": "string" },

        // "time": { "js": "string", "ts": "string" },
        "date": { "js": "string", "ts": "string" },
        "datetime": { "js": "string", "ts": "string" },
        "datetimeoffset": { "js": "string", "ts": "string" },
        "smalldatetime": { "js": "string", "ts": "string" },

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
        "int2": { "js": "number", "ts": "number" },
        "int4": { "js": "number", "ts": "number" },
        "int8": { "js": "number", "ts": "number" },
        "decimal": { "js": "number", "ts": "number" },
        "numeric": { "js": "number", "ts": "number" },
        "float4": { "js": "number", "ts": "number" },
        "float8": { "js": "number", "ts": "number" },
        "real": { "js": "number", "ts": "number" },
        "serial2": { "js": "number", "ts": "number" },
        "serial4": { "js": "number", "ts": "number" },
        "serial8": { "js": "number", "ts": "number" },
        "money": { "js": "number", "ts": "number" },

        "varchar": { "js": "string", "ts": "string" },
        "char": { "js": "string", "ts": "string" },
        "text": { "js": "string", "ts": "string" },
        "json": { "js": "string", "ts": "string" },
        "jsonb": { "js": "string", "ts": "string" },

        "timestamp": { "js": "date", "ts": "string" },
        "date": { "js": "date", "ts": "string" },
        "time": { "js": "date", "ts": "string" },
        "interval": { "js": "date", "ts": "string" },

        "bool": { "js": "boolean", "ts": "boolean" }
    }
}

export {Dbtype}