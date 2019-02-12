const express = require('express');
const router = express.Router();
const conn = require('../app_configuration/db_operations');
const response = require('../app_configuration/response');

//EBS Data implemented by Vishal Sehgal as on 8/2/2019
router.get('/contract_state', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return; }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `select status , sum (mediandays::INTEGER) as mediandays, sum(contractperstatus) as contractscount 
       from ( select to_status as Status, median(DaysInStatus) as MedianDays, 
       count(contract_number) as contractPerStatus, 
       TERRITORY from ( select contract_number, to_status, min(sts_changed_on), 
       DateMoved, to_number(trim(to_char(DateMoved - min(sts_changed_on),'DD')),'99G999D9S') as DaysInStatus, 
       TERRITORY from ( select A2.contract_number, A2.to_status, A2.sts_changed_on,TERRITORY, coalesce( ( select max(A1.sts_changed_on)
       from ebs_contracts_state_master A1 where A1.contract_number = A2.contract_number and A1.from_STATUS = A2.to_status), current_date ) as DateMoved
       from ebs_contracts_state_master A2 order by contract_number, sts_changed_on ) resultset 
       group by contract_number, to_status, DateMoved, TERRITORY )R2 
       group by to_status, TERRITORY ORDER BY TO_STATUS) R3 
       WHERE STATUS In ('GENERATE_PO','PO_ISSUED', 'QA_HOLD','MODIFY_PO')  GROUP BY STATUS ;`, [],
      function (err, result) {
        if (err) {
          conn.doRelease(dbConn);
          //call error handler
          return next(err);
        }
        response.data = result.rows;
        res.json(response);
        //release connection back to pool
        conn.doRelease(dbConn);
      });
  });
});


// API for case_territories
router.get('/case_territories', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return; }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `Select distinct(TERRITORY) from sc_case_state_master  order by territory asc;`, [],
      function (err, result) {
        if (err) {
          conn.doRelease(dbConn);
          //call error handler
          return next(err);
        }
        response.data = result.rows;
        res.json(response);
        //release connection back to pool
        conn.doRelease(dbConn);
      });
  });
});


module.exports = router;
