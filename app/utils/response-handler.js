const fs = require('fs');
const dayjs = require('dayjs');

//functions to return error and success responses
exports.success_function = function (api_data) {
    var response = {
        "success": true,
        "statusCode": api_data.status,
        "data": api_data.data ? api_data.data : null,
        "message": api_data.message ? api_data.message : null
    };
    return response;
}

exports.error_function = function (api_data) {
    if (process.env.ENVIRONMENT == "development") console.log(api_data);
    let error_data = { date: dayjs().format("DD/MM/YYYY HH:mm"), error: api_data }
    fs.appendFile('./logs/api-logs.txt', JSON.stringify(error_data) + "\n", (error) => { if (error) console.log(error); });
    var response = {
        "success": false,
        "statusCode": api_data.status,
        "data": api_data.data ? api_data.data : null,
        "message": api_data.message ? (typeof api_data.message == "string" ? api_data.message : JSON.stringify(api_data.message)) : null
    };
    return response;
}