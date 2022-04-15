const errorHandlers = require("../utils/error-handler");

describe('오류 핸들러 테스트', () => {
    const res = {
        status: jest.fn(() => res),
        json: jest.fn()
    }

    test('유저가 없다는 메세지를 전달한다', () => {
        const e = {
            message: 'NoUserError'
        };
        const result = {
            'success': false,
            'message': 'NoUserError'
        };
        errorHandlers(e, res);
        expect(res.status).toBeCalledWith(409);
        expect(res.json).toBeCalledWith(result);
    });

    test('Request Body 포맷이 잘못됐다는 메세지를 전달한다', () => {
        const e = {
            message: 'BodyFormatError'
        };
        const result = {
            'success': false,
            'message': 'Body Format is not correct'
        };
        errorHandlers(e, res);
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith(result);
    });
})