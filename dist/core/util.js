"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
class Util {
    static getLineChar() {
        return this.lineChar;
    }
    /**
     * 生成标准约束规则
     * @param rule      规则名
     */
    static getConstraintRule(rule) {
        rule = rule.toLowerCase();
        switch (rule) {
            case "cascade":
                return "CASCADE";
            case "set null":
            case "set_null":
                return "SETNULL";
            case "none":
                return "NONE";
            case "restrict":
                return "RESTRICT";
            case "no action":
            case "no_action":
                return "NONE";
        }
    }
}
exports.Util = Util;
Util.lineChar = '\r\n';
//# sourceMappingURL=util.js.map