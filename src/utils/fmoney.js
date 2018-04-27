// 千分位的封装
function fmoney(s) {
    s = parseFloat((s + '').replace(/[^\d.-]/g, '')).toFixed(2) + '';
    var l = s.split('.')[0].split('').reverse(),
        r = s.split('.')[1];
    var t = '';
    for (var i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 === 0 && (i + 1) !== l.length ? ',' : '');
    }
    return t.split('').reverse().join('') + '.' + r;
}
export default fmoney;