const userList = {
    'post': ['email', 'password', 'name', 'age', 'type_id'],
    'put' : ['password', 'name', 'age', 'type_id']
};
const customerList = ['nickname'];
const sellerList = ['bank', 'account'];

const checkUserRequest = (jsonData, type) => {
    // 유저 Body Parameter 체크
    for(const col of userList[type]) {
        // undefined, null, 공백문자를 검사한다
        if(!jsonData.body[col]) {
            console.error('Body Parameter 잘못되었다');
            return true;
        }
    }
    // 고객 Body Parameter 체크
    if(jsonData.body['type_id'] == 1) {
        for(const col of customerList) {
            if(!jsonData.body[col]) {
                console.error('Body Parameter 잘못되었다');
                return true;
            }
        }
    }
    // 셀러 Body Parameter 체크
    if(jsonData.body['type_id'] == 2) {
        for(const col of sellerList) {
            if(!jsonData.body[col]) {
                console.error('Body Parameter 잘못되었다');
                return true;
            }
        }
    }

    return false;
}

module.exports = checkUserRequest;