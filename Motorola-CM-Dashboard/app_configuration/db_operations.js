module.exports = function (pool) {
    console.log("Database connection pool successfully created!")
    //////////////////////
    // GET A CONNECTION //
    //////////////////////
    var doConnect = function (callback) {
        pool.connect((err, client, done) => {
            const shouldAbort = (err) => {
              if (err) {
                console.error('Error in transaction', err.stack)
                client.query('ROLLBACK', (err) => {
                  if (err) {
                    console.error('Error rolling back client', err.stack)
                  }
                  // release the client back to the pool
                  done()
                })
              }
              return !!err
            }
            //returning connection from pool to callback of doConnect
            return callback(err,client);
          })

    }
    /////////////
    // EXECUTE //
    /////////////
    var doExecute = function (connection, sql, values, callback) {

        connection.query(sql, values, function (err, result) {

            // Something went wrong - handle the data and release the connection
            if (err) {
                console.log("ERROR: Unable to execute the SQL: ", err);
                //releaseConnection(connection);
                return callback(err);
            }

            // Return the result to the request initiator
            // console.log("INFO: Result from Database: ", result)
            return callback(err, result);

        });

    }

    ////////////
    // COMMIT //
    ////////////
    var doCommit = function (connection, callback) {
        // connection.commit(function (err) {
        //     if (err) {
        //         console.log("ERROR: Unable to COMMIT transaction: ", err);
        //     }
        //     return callback(err, connection);
        // });

        connection.query('COMMIT', (err) => {
            if (err) {
              console.error('Error committing transaction', err.stack)
            }
            // done()
            return callback(err,connection);
          })
    }
    //////////////
    // ROLLBACK //
    //////////////
    var doRollback = function (connection, callback) {
        // connection.rollback(function (err) {
        //     if (err) {
        //         console.log("ERROR: Unable to ROLLBACK transaction: ", err);
        //     }
        //     return callback(err, connection);
        // });
        connection.query('ROLLBACK', (err) => {
            if (err) {
              console.error('Error rolling back client', err.stack)
            }
            // release the client back to the pool
            // done()
            return callback(err,connection);
          })
    }

    //////////////////////////
    // RELEASE A CONNECTION //
    //////////////////////////
    var doRelease = function (connection) {

        connection.release(function (err) {
            if (err) {
                console.log("ERROR: Unable to RELEASE the connection: ", err);
            }
            return;
        });

    }

    //////////////////////////////
    // EXPORT THE FUNCTIONALITY //
    //////////////////////////////
    module.exports.doConnect = doConnect;
    module.exports.doExecute = doExecute;
    module.exports.doCommit = doCommit;
    module.exports.doRollback = doRollback;
    module.exports.doRelease = doRelease;
    // module.exports.doExecuteMany=doExecuteMany;

}