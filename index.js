"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var app = express_1.default();
var port = 8080; // default port
app.use(body_parser_1.default.json());
var parseRequestData = function (version, data) {
    // Assuming data is of format <firstName>000<lastName>000<clientId>
    var delimiter = '0';
    var firstName;
    var lastName;
    var clientId;
    var length = data.length;
    var index = 0;
    var currentIndex = 0;
    var hasZeroStarted = false;
    var delimitedString = '';
    while (index < length) {
        if (hasZeroStarted && data[index] !== '0') {
            hasZeroStarted = false;
            delimitedString += data.substring(currentIndex, index) + ';';
            currentIndex = index;
        }
        else if (!hasZeroStarted && data[index] === '0') {
            hasZeroStarted = true;
        }
        index++;
    }
    delimitedString += data.substring(currentIndex, index);
    var responseArray = delimitedString.split(';');
    if (version === 1) {
        return {
            firstName: responseArray[0],
            lastName: responseArray[1],
            clientId: responseArray[2]
        };
    }
    else if (version === 2) {
        var firstName_1 = responseArray[0].substring(0, responseArray[0].indexOf('0'));
        var lastName_1 = responseArray[1].substring(0, responseArray[1].indexOf('0'));
        return {
            firstName: firstName_1,
            lastName: lastName_1,
            clientId: responseArray[2].match(/.{1,3}/g).join('-')
        };
    }
    else {
        throw new Error("Invalid version");
    }
};
app.post('/api/v1/parse', function (req, res) {
    var data = req.body.data;
    if (!data || !data.length) {
        return res.status(400).json({
            statusCode: 400,
            data: {
                error: 'Invalid body format'
            }
        });
    }
    return res.status(200).json({
        statusCode: 200,
        data: parseRequestData(1, data)
    });
});
app.post('/api/v2/parse', function (req, res) {
    var data = req.body.data;
    if (!data || !data.length) {
        return res.status(400).json({
            statusCode: 400,
            data: {
                error: 'Invalid body format'
            }
        });
    }
    return res.status(200).json({
        statusCode: 200,
        data: parseRequestData(2, data)
    });
});
app.listen(port, function () {
    console.log("Server started on localhost:" + port);
});
