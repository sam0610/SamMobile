var Connection = require('tedious').Connection;
var Request = require('tedious').Request

const createTable = (context) => {
    var result = "";
    context.log("start to create");

    // Create Connection object
    const connection = new Connection({
        server: process.env["db_server"],
        authentication: {
            type: 'default',
            options: {
                userName: process.env["db_user"],
                password: process.env["db_password"],
                validateBulkLoadParameters: false
            }
        },
        options: {
            database: process.env["db_database"],
            encrypt: true
        }
    });

    // Create the command to be executed
    const request = new Request("dbo.createTempEmployeeData", (err) => {
        if (err) {
            context.log.error(err);
            context.res.status = 500;
            context.res.body = "Error creating table";
        } else {
            context.log(result);
        }
        context.done();
    });

    connection.on('connect', err => {
        if (err) {
            context.log.error(err);
            context.res.status = 500;
            context.res.body = "Error connecting to Azure SQL query";
            context.done();
        }
        else {
            // Connection succeeded so execute T-SQL stored procedure
            // if you want to executer ad-hoc T-SQL code, use connection.execSql instead
            connection.callProcedure(request);
        }
    });

    // Handle result set sent back from Azure SQL
    request.on('row', columns => {
        columns.forEach(column => {
            result += column.value;
        });
        context.log(result + " row Affected");
    });
    // Connect
    connection.connect();
}


module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();

    if (myTimer.isPastDue) {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timeStamp);
    createTable(context);
    context.log('table created!');
};