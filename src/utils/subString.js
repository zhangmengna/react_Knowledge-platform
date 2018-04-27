// 截取字符串前6位
function subString(str) {
    if (str.length > 6) {
        return str.substring(0, 6) + "...";
    } else {
        return str;
    }
}
export default subString;