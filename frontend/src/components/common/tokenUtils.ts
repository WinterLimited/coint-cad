function getTokenInfo() {
    const token = localStorage.getItem('token');
    return token ? JSON.parse(b64DecodeUnicode(token.split('.')[1])) : null;

}

function b64DecodeUnicode(str: string) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function getUserId() {
    const tokenInfo = getTokenInfo();
    return tokenInfo ? tokenInfo.user_id : null;
}

function getName() {
    const tokenInfo = getTokenInfo();
    return tokenInfo ? tokenInfo.name : null;
}

export {getUserId, getName};