class Util{
    static lineChar = '\r\n';
    static getLineChar(){
        return this.lineChar;
    }

    /**
     * 生成标准约束规则
     * @param rule      规则名
     */
    static getConstraintRule(rule:string):string{
        rule = rule.toLowerCase();
        switch(rule){
            case "cascade":
                return "CASCADE";
            case "set null":
                return "SETNULL";
            case "none":
                return "NONE";
            case "restrict":
                return "RESTRICT";
        }
    }
}

export{Util}