const express = require('express');
const router = express.Router();
const conn = require('../app_configuration/db_operations');
const response = require('../app_configuration/response');

//Smart Client Data implemented by Vishal Sehgal as on 11/2/2019
router.get('/sc_case_status', (req, res, next) => {
  // var sql, binds = [], territory = req.body.territory, status = req.body.status;
  // if (territory == 'all' && status=='all') {
  //   sql = "SELECT status, CASE WHEN status = 'Open' THEN '1' WHEN status = 'Insufficient Data' THEN '2' WHEN status = 'InProg' THEN '3' WHEN status = 'InProg Acknowledged' THEN '4' WHEN status = 'InProg Awt 3PS' THEN '5' WHEN status = 'InProg Awt Bus Unit' THEN '6' WHEN status = 'InProg Awt SSC' THEN '7' WHEN status = 'InProg Awt Credit' THEN '8' WHEN status = 'InProg Awt Resource' THEN '9' ELSE 'OTHER' END                         AS status_order, SUM (mediandays :: INTEGER) AS mediandays, SUM(contractperstatus)      AS contractscount FROM   (SELECT to_status            AS Status, Median(daysinstatus) AS MedianDays, Count(case_number)   AS contractPerStatus, territory FROM   (SELECT case_number, to_status, Min(sts_changed_on), datemoved, To_number(Trim(To_char(datemoved - Min(sts_changed_on), 'DD')), '99G999D9S') AS DaysInStatus, territory FROM   (SELECT A2.case_number, A2.to_status, A2.sts_changed_on, territory, Coalesce((SELECT Max(A1.sts_changed_on) FROM   sc_case_state_master A1 WHERE  A1.case_number = A2.case_number AND A1.from_status = A2.to_status), current_date) AS DateMoved FROM   sc_case_state_master A2 ORDER  BY case_number, sts_changed_on) resultset GROUP  BY case_number, to_status, datemoved, territory)R2 GROUP  BY to_status, territory ORDER  BY to_status) R3 GROUP  BY status ORDER  BY status_order";
  // } else {
  //   binds.push(territory);
  //   sql = "SELECT status, CASE WHEN status = 'Open' THEN '1' WHEN status = 'Insufficient Data' THEN '2' WHEN status = 'InProg' THEN '3' WHEN status = 'InProg Acknowledged' THEN '4' WHEN status = 'InProg Awt 3PS' THEN '5' WHEN status = 'InProg Awt Bus Unit' THEN '6' WHEN status = 'InProg Awt SSC' THEN '7' WHEN status = 'InProg Awt Credit' THEN '8' WHEN status = 'InProg Awt Resource' THEN '9' ELSE 'OTHER' END                         AS status_order, SUM (mediandays :: INTEGER) AS mediandays, SUM(contractperstatus)      AS contractscount FROM   (SELECT to_status            AS Status, Median(daysinstatus) AS MedianDays, Count(case_number)   AS contractPerStatus, territory FROM   (SELECT case_number, to_status, Min(sts_changed_on), datemoved, To_number(Trim(To_char(datemoved - Min(sts_changed_on), 'DD')), '99G999D9S') AS DaysInStatus, territory FROM   (SELECT A2.case_number, A2.to_status, A2.sts_changed_on, territory, Coalesce((SELECT Max(A1.sts_changed_on) FROM   sc_case_state_master A1 WHERE  A1.case_number = A2.case_number AND A1.from_status = A2.to_status), current_date) AS DateMoved FROM   sc_case_state_master A2 ORDER  BY case_number, sts_changed_on) resultset GROUP  BY case_number, to_status, datemoved, territory)R2 GROUP  BY to_status, territory ORDER  BY to_status) R3 WHERE  territory IN ( " + territory + " ) AND status IN (" + status + " ) GROUP  BY status ORDER  BY status_order";
  // }
  var postgreSql = `SELECT status, 
	CASE 
      WHEN status = 'Open' THEN '1' 
      WHEN status = 'Insufficient Data' THEN '2' 
      WHEN status = 'InProg' THEN '3' 
      WHEN status = 'InProg Acknowledged' THEN '4' 
      WHEN status = 'InProg Awt 3PS' THEN '5' 
      WHEN status = 'InProg Awt Bus Unit' THEN '6' 
      WHEN status = 'InProg Awt SSC' THEN '7' 
      WHEN status = 'InProg Awt Credit' THEN '8' 
      WHEN status = 'InProg Awt Resource' THEN '9' 
      ELSE 'OTHER' 
    END                         AS status_order, 
    SUM (mediandays :: INTEGER) AS mediandays, 
    SUM(contractperstatus)      AS contractscount, 
    arrival_type,
    territory 
  FROM   (SELECT to_status            AS Status, 
            Median(daysinstatus) AS MedianDays, 
            Count(case_number)   AS contractPerStatus, 
            arrival_type,
            territory 
     FROM   (SELECT case_number, 
                    to_status, 
                    Min(sts_changed_on), 
                    datemoved, 
                    To_number(Trim(To_char(datemoved - Min(sts_changed_on), 
                                   'DD')), 
                    '99G999D9S') AS 
                    DaysInStatus,
                    arrival_type, 
                    territory 
             FROM   (SELECT A2.case_number, 
                            A2.to_status, 
                            A2.sts_changed_on,
                            arrival_type, 
                            territory, 
                            Coalesce((SELECT Max(A1.sts_changed_on) 
                                      FROM   sc_case_state_master A1 
                                      WHERE  A1.case_number = A2.case_number 
                                             AND A1.from_status = 
                                                 A2.to_status), 
                            current_date) AS 
                                    DateMoved 
                     FROM   sc_case_state_master A2 
                     ORDER  BY case_number, 
                               sts_changed_on) resultset 
             GROUP  BY case_number, 
                       to_status, 
                       datemoved, 
                       territory,arrival_type)R2 
     GROUP  BY to_status, 
               territory,arrival_type 
     ORDER  BY to_status) R3 
  GROUP  BY status, 
       territory,arrival_type 
  ORDER  BY status_order`;
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute body using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      postgreSql, [],
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




// API for sc_case_territories
router.get('/sc_territories', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute body using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT DISTINCT( territory ) 
      FROM   sc_case_state_master 
      ORDER  BY territory ASC`, [],
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

// // API for sc_case_territories
router.get('/sc_arrival_type', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute body using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT DISTINCT( arrival_type ) 
      FROM   sc_case_state_master 
      ORDER  BY arrival_type ASC`, [],
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

// // API for sc_case_territories
// router.post('/sc_new_cases', (req, res, next) => {
//   //call doConnect method in db_operations
//   conn.doConnect((err, dbConn) => {
//     if (err) { return next(err); }
//     //execute body using using connection instance returned by doConnect method
//     conn.doExecute(dbConn,
//       "Select distinct case_number,case_title,current_status,from_status,to_status,territory,case_creation_date,sts_changed_on,customer,       case_owner,arrival_type  FROM sc_case_state_master   where date_trunc('day',case_creation_date)>='" + req.body.from + "' AND date_trunc('day',case_creation_date)<='" + req.body.to +"' order by case_number asc ", [],
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


// // API for sc_case_territories
router.get('/sc_cases_drilldown', (req, res, next) => {
  //call doConnect method in db_operations
  var status = req.query;
   var postgreSql;
  //console.log("the status passed is:" + JSON.stringify(status));
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute body using using connection instance returned by doConnect method
    if (status.casestatus == 'Other') {
      postgreSql = "Select distinct case_number,customer,case_owner,case_creation_date,to_status,sts_changed_on from sc_case_state_master  where to_status NOT IN ('Open','Insufficient Data','InProg Awt 3PS','InProg Awt SSC','InProg Awt Credit','InProg Awt Resource','InProg Awt 3PS','InProg Acknowledged','InProg','InProg Awt Bus Unit')"
    } else {
      postgreSql = "Select distinct case_number,customer,case_owner,case_creation_date,to_status from sc_case_state_master where to_status = '" + status.casestatus + "'";

    }
    conn.doExecute(dbConn,
      postgreSql, [],
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

// // API for sc_case_territories
router.post('/sc_cases_drilldownfilter', (req, res, next) => {
  //call doConnect method in db_operations
  var status = req.query;
  //console.log("the status passed is:" + JSON.stringify(status));
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute body using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      "Select distinct case_number,customer,case_owner,case_creation_date,current_status from sc_case_state_master where date_trunc('day',case_creation_date)  BETWEEN '" + req.body.first + "' AND '" + req.body.last + "' ", [],
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


// // API for sc_case_territories
router.get('/sc_dates_max_min', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute body using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      "Select TO_CHAR(MAX(case_creation_date), 'yyyy-mm-dd') as max_date_cases, TO_CHAR(MIN(case_creation_date), 'yyyy-mm-dd')  as min_date_cases from sc_case_state_master", [],
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



// API for sc_workflow_status
router.get('/sc_workflow_status', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute body using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT to_status, 
      CASE 
        WHEN to_status = 'Open' THEN '1' 
        WHEN to_status = 'Insufficient Data' THEN '2' 
        WHEN to_status = 'InProg' THEN '3' 
        WHEN to_status = 'InProg Acknowledged' THEN '4' 
        WHEN to_status = 'InProg Awt 3PS' THEN '5' 
        WHEN to_status = 'InProg Awt Bus Unit' THEN '6' 
        WHEN to_status = 'InProg Awt SSC' THEN '7' 
        WHEN to_status = 'InProg Awt Credit' THEN '8' 
        WHEN to_status = 'InProg Awt Resource' THEN '9' 
        ELSE 'OTHER' 
      END AS status_order 
FROM   sc_case_state_master 
GROUP  BY to_status 
ORDER  BY status_order 
`, [],
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

//sc_case_status_avg api
router.get('/sc_case_status_avg', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute body using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT status,
      CASE 
               WHEN status = 'Open' THEN '1' 
               WHEN status = 'Insufficient Data' THEN '2' 
               WHEN status = 'InProg' THEN '3' 
               WHEN status = 'InProg Acknowledged' THEN '4' 
               WHEN status = 'InProg Awt 3PS' THEN '5' 
               WHEN status = 'InProg Awt Bus Unit' THEN '6' 
               WHEN status = 'InProg Awt SSC' THEN '7' 
               WHEN status = 'InProg Awt Credit' THEN '8' 
               WHEN status = 'InProg Awt Resource' THEN '9' 
               ELSE 'OTHER' 
             END                         AS status_order,  
             Trim(To_char(Avg(daysinstatus) :: interval, 'DD')) AS AverageDays, 
             Count(case_number)                             AS contractPerStatus, 
             territory,
             arrival_type 
      FROM   (SELECT case_number, 
                     to_status as status, 
                     Min(sts_changed_on), 
                     datemoved, 
                     datemoved - Min(sts_changed_on) AS DaysInStatus, 
                     territory ,
                     arrival_type
              FROM   (SELECT A2.case_number, 
                             A2.to_status, 
                             A2.sts_changed_on, 
                             territory, 
                             arrival_type,
                             Coalesce((SELECT Max(A1.sts_changed_on) 
                                       FROM   sc_case_state_master A1 
                                       WHERE  A1.case_number = A2.case_number 
                                              AND A1.from_status = A2.to_status), 
                             current_date) AS 
                                     DateMoved 
                      FROM   sc_case_state_master A2 
                      ORDER  BY case_number, 
                                sts_changed_on) resultset 
              GROUP  BY case_number, 
                        status, 
                        datemoved, 
                        territory,arrival_type)R2 
      GROUP  BY status, 
                territory,arrival_type 
      ORDER  BY status_order
`, [],
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

//sc_case_status_med_yr filter
router.post('/sc_case_status_med_yr', (req, res, next) => {
  //console.log("---"+JSON.stringify(req.body));
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) {
      //console.log("the error is:" + err)
      return next(err);
    }
    //execute body using using connection instance returned by doConnect method
    var postgreSql = "SELECT status, CASE WHEN status = 'Open' THEN '1' WHEN status = 'Insufficient Data' THEN '2' WHEN status = 'InProg' THEN '3' WHEN status = 'InProg Acknowledged' THEN '4' WHEN status = 'InProg Awt 3PS' THEN '5' WHEN status = 'InProg Awt Bus Unit' THEN '6' WHEN status = 'InProg Awt SSC' THEN '7' WHEN status = 'InProg Awt Credit' THEN '8' WHEN status = 'InProg Awt Resource' THEN '9' ELSE 'OTHER' END AS status_order, SUM (mediandays :: INTEGER) AS mediandays, SUM(contractperstatus)      AS contractscount, territory,arrival_type FROM   (SELECT to_status            AS Status, Median(daysinstatus) AS MedianDays, Count(case_number)   AS contractPerStatus, territory,arrival_type FROM   (SELECT case_number, to_status, Min(sts_changed_on), datemoved, To_number(Trim(To_char(datemoved - Min(sts_changed_on), 'DD')), '99G999D9S') AS DaysInStatus, territory,arrival_type FROM   (SELECT A2.case_number, A2.to_status, A2.sts_changed_on, territory,arrival_type, Coalesce((SELECT Max(A1.sts_changed_on) FROM   sc_case_state_master A1 WHERE  A1.case_number = A2.case_number AND A1.from_status = A2.to_status), current_date) AS DateMoved FROM   sc_case_state_master A2 where date_trunc('day',case_creation_date)>='" + req.body.from + "' AND date_trunc('day',case_creation_date)<='" + req.body.to + "' ORDER  BY case_number, sts_changed_on) resultset GROUP  BY case_number, to_status, datemoved, territory,arrival_type)R2 GROUP  BY to_status, territory,arrival_type ORDER  BY to_status) R3  GROUP  BY status,territory,arrival_type ORDER  BY status_order";
    //console.log("postgreSql"+postgreSql)
    conn.doExecute(dbConn,
      postgreSql, [],
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

//sc_case_status_avg_yr filter
router.post('/sc_case_status_avg_yr', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute body using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      "SELECT status, CASE WHEN status = 'Open' THEN '1' WHEN status = 'Insufficient Data' THEN '2' WHEN status = 'InProg' THEN '3' WHEN status = 'InProg Acknowledged' THEN '4' WHEN status = 'InProg Awt 3PS' THEN '5' WHEN status = 'InProg Awt Bus Unit' THEN '6' WHEN status = 'InProg Awt SSC' THEN '7' WHEN status = 'InProg Awt Credit' THEN '8' WHEN status = 'InProg Awt Resource' THEN '9' ELSE 'OTHER' END                         AS status_order, Trim(To_char(Avg(daysinstatus) :: interval, 'DD')) AS AverageDays, Count(case_number)                             AS contractPerStatus, territory,arrival_type FROM   (SELECT case_number, to_status as status, Min(sts_changed_on), datemoved, datemoved - Min(sts_changed_on) AS DaysInStatus, territory,arrival_type FROM   (SELECT A2.case_number, A2.to_status, A2.sts_changed_on, territory,arrival_type, Coalesce((SELECT Max(A1.sts_changed_on) FROM   sc_case_state_master A1 WHERE  A1.case_number = A2.case_number AND A1.from_status = A2.to_status), current_date) AS DateMoved FROM   sc_case_state_master A2 where date_trunc('day',case_creation_date)>='" + req.body.from + "' AND date_trunc('day',case_creation_date)<='" + req.body.to + "' ORDER  BY case_number, sts_changed_on) resultset GROUP  BY case_number, status, datemoved, territory,arrival_type)R2 GROUP  BY status, territory,arrival_type ORDER  BY status_order", [],
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


router.post('/sc_new_cases', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute body using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `Select count (distinct m.case_number) as Case_Count
      ,to_char(date (date_trunc('month',m.case_creation_date)),'MON')||'-'|| extract (year from (date (date_trunc('month',m.case_creation_date)))) as byMonth
      FROM sc_case_state_master m
      where date(date_trunc('day',m.case_creation_date))>= coalesce( $1::date, (date_trunc('month',CURRENT_DATE) - interval '25 months')) 
      AND date(date_trunc('day',m.case_creation_date))<=  coalesce( $2::date,  (date_trunc('month',CURRENT_DATE) - interval '1 months'))
      and m.territory = ANY(CASE
        WHEN $3::boolean=false 
        THEN ARRAY[m.territory]
        ELSE ARRAY[$4::text[]] 
        END)
      and m.arrival_type = ANY(CASE
        WHEN $5::boolean=false
        THEN ARRAY[m.arrival_type]
        ELSE ARRAY[$6::text[]] 
        END)
      group by date_trunc('month',m.case_creation_date)
      order by date_trunc('month',m.case_creation_date)`, [req.body.from_date,req.body.to_date,req.body.territory_selected,req.body.territory_data,req.body.arrival_selected,req.body.arrival_data],
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
//{"OTHER","T2","T4E","T4W","T5N","T5S","T6","T7","T8","T3"}
module.exports = router;
