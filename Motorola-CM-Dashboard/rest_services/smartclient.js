const express = require('express');
const router = express.Router();
const conn = require('../app_configuration/db_operations');
const response = require('../app_configuration/response');

//Smart Client Data implemented by Vishal Sehgal as on 11/2/2019
router.get('/case_status', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return; }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `select status ,CASE WHEN status = 'Open' THEN '0'  
       WHEN status = 'Insufficient Data' THEN '1'      
       WHEN status = 'InProg' THEN '2' 
       WHEN status = 'InProg Acknow' THEN '3' 
       when status='InProg Awt 3PS' Then '4' 
       WHEN status ='InProg Awt Credit' Then '5' 
       When status ='InProg Awt Resource' then '6'
       ELSE 'OTHER' END AS status_order,
       sum (mediandays::INTEGER) as mediandays, 
       sum(contractperstatus) as contractscount
       from ( select to_status as Status,
       median(DaysInStatus) as MedianDays, 
       count(case_number) as contractPerStatus, 
       TERRITORY from
       ( select case_number, to_status, min(sts_changed_on), DateMoved, to_number(trim(to_char(DateMoved - min(sts_changed_on),'DD')),'99G999D9S') as DaysInStatus, TERRITORY from ( select A2.case_number, A2.to_status, A2.sts_changed_on,TERRITORY, coalesce( ( select max(A1.sts_changed_on) from sc_case_state_master A1 where A1.case_number = A2.case_number and A1.from_STATUS = A2.to_status), current_date ) as DateMoved from sc_case_state_master A2 order by case_number, sts_changed_on ) resultset group by case_number, to_status, DateMoved, TERRITORY )R2 group by to_status, TERRITORY ORDER BY TO_STATUS) R3 Group by status ORDER BY status_order  ;`, [],
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

// router.get('/territories', (req, res, next) => {
//   //call doConnect method in db_operations
//   conn.doConnect((err, dbConn) => {
//     if (err) { return; }
//     //execute query using using connection instance returned by doConnect method
//     conn.doExecute(dbConn,
//       `select distinct(territory) from ebs_contracts_state_master order by territory  asc;`, [],
//       function (err, result) {
//         if (err) {
//           conn.doRelease(dbConn);
//           //call error handler
//           return next(err);
//         }
//         response.data = result.rows;
//         res.json(response);
//         //release connection back to pool
//         conn.doRelease(dbConn);
//       });
//   });
// });


module.exports = router;
