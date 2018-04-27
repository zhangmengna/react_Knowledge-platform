// 获取url的参数
export const queryString = () => {
    let _queryString = {};
    const _query = window.location.search.substr(1);
    const _vars = _query.split('&');
    _vars.forEach((v, i) => {
        const _pair = v.split('=');
        if (!_queryString.hasOwnProperty(_pair[0])) {
            _queryString[_pair[0]] = decodeURIComponent(_pair[1]);
        } else if (typeof _queryString[_pair[0]] === 'string') {
            const _arr = [ _queryString[_pair[0]], decodeURIComponent(_pair[1])];
            _queryString[_pair[0]] = _arr;
        } else {
            _queryString[_pair[0]].push(decodeURIComponent(_pair[1]));
        }
    });
    return _queryString;
};


export const setDate = ()=>{
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    console.log(month);
    if(month === 1){
        month = 12;
        year = year - 1;
    }else {
        month = month - 1 ;
    }
    console.log(year+'-'+month);
    return year+'-'+month;
}