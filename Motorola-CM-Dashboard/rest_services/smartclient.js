const express = require('express');
const router = express.Router();
const conn = require('../app_configuration/db_operations');
const response = require('../app_configuration/response');

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
      order by date_trunc('month',m.case_creation_date)`, [req.body.from_date, req.body.to_date, req.body.territory_selected, req.body.territory_data, req.body.arrival_selected, req.body.arrival_data],
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

router.post('/sc_new_cases_drilldown', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute body using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT 
      m1.customer
      ,m1.case_number
      ,m1.to_status
      ,m1.case_owner
      ,m1.case_creation_date
      ,m1.contract_start_date 
      ,m1.sts_changed_on
      ,m1.case_condition
      ,TO_CHAR(DATE (DATE_TRUNC('month',m1.case_creation_date)),'MON') || '-' ||EXTRACT(year FROM (DATE (DATE_TRUNC('month',m1.case_creation_date)))) AS byMonth
      FROM sc_case_state_master m1
      WHERE DATE (DATE_TRUNC('day',m1.case_creation_date)) >= coalesce($1::date,DATE (DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '25 months'))
      AND   DATE (DATE_TRUNC('day',m1.case_creation_date)) <=coalesce($2::date, DATE (DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '1 months'))
      and m1.sts_changed_on = ( select max(m2.sts_changed_on) from sc_case_state_master m2 where m1.case_number = m2.case_number)
      and m1.territory = ANY(CASE
        WHEN $3::boolean=false 
        THEN ARRAY[m1.territory]
        ELSE ARRAY[$4::text[]] 
        END) 
      AND   m1.arrival_type =ANY(CASE
        WHEN $5::boolean=false
        THEN ARRAY[m1.arrival_type]
        ELSE ARRAY[$6::text[]] 
        END)
      GROUP BY DATE_TRUNC('month',m1.case_creation_date),m1.customer
      ,m1.case_number
      ,m1.to_status
      ,m1.case_owner
      ,m1.case_creation_date
      ,m1.contract_start_date
      ,m1.sts_changed_on
      ,m1.case_condition
      ORDER BY DATE_TRUNC('month',m1.case_creation_date)`
      , [req.body.from_date, req.body.to_date, req.body.territory_selected, req.body.territory_data, req.body.arrival_selected, req.body.arrival_data],
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
router.post('/sc_case_by_status', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT r3.status1,
      r3.status_order,
      SUM(r3.mediandays::INTEGER) AS mediandays,
      AVG(r3.AverageDays) AverageDays,
      SUM(r3.caseperstatus) AS casecount
FROM (SELECT r2.to_status AS status,
            MEDIAN(r2.daysinstatus) AS mediandays,
            AVG(daysinstatus) AS AverageDays,
            COUNT(r2.case_number) AS caseperstatus,
            r2.territory,
            CASE
              WHEN r2.to_status = 'Open' THEN 'Open'
              WHEN r2.to_status = 'Insufficient Data' THEN 'Insufficient Data'
              WHEN r2.to_status = 'InProg' THEN 'InProg'
              WHEN r2.to_status = 'InProg Acknowledged' THEN 'InProg Acknowledged'
              WHEN r2.to_status = 'InProg Awt 3PS' THEN 'InProg Awt 3PS'
              WHEN r2.to_status = 'InProg Awt Bus Unit' THEN 'InProg Awt Bus Unit'
              WHEN r2.to_status = 'InProg Awt SSC' THEN 'InProg Awt SSC'
              WHEN r2.to_status = 'InProg Awt Credit' THEN 'InProg Awt Credit'
              WHEN r2.to_status = 'InProg Awt Resource' THEN 'InProg Awt Resource'
              ELSE 'OTHER'
            END AS status1,
            CASE
              WHEN r2.to_status = 'Open' THEN '1'
              WHEN r2.to_status = 'Insufficient Data' THEN '2'
              WHEN r2.to_status = 'InProg' THEN '3'
              WHEN r2.to_status = 'InProg Acknowledged' THEN '4'
              WHEN r2.to_status = 'InProg Awt 3PS' THEN '5'
              WHEN r2.to_status = 'InProg Awt Bus Unit' THEN '6'
              WHEN r2.to_status = 'InProg Awt SSC' THEN '7'
              WHEN r2.to_status = 'InProg Awt Credit' THEN '8'
              WHEN r2.to_status = 'InProg Awt Resource' THEN '9'
              ELSE 'OTHER'
            END AS status_order,
            r2.arrival_type
     FROM (SELECT r1.case_number,
                  r1.to_status,
                  MIN(r1.sts_changed_on),
                  r1.datemoved,
                  TO_NUMBER(TRIM(TO_CHAR(r1.datemoved -MIN(r1.sts_changed_on),'DD')),'99G999D9S') AS daysinstatus,
                  r1.territory,
                  r1.arrival_type
           FROM (SELECT a2.case_number,
                        a2.to_status,
                        a2.sts_changed_on,
                        a2.territory,
                        a2.arrival_type,
                        COALESCE((SELECT MAX(a1.sts_changed_on) FROM sc_case_state_master a1 WHERE a1.case_number = a2.case_number AND TRIM(a1.from_status) = TRIM(a2.to_status)),CURRENT_DATE) AS datemoved
                 FROM sc_case_state_master a2
                 ORDER BY a2.case_number,
                          a2.sts_changed_on) r1
           GROUP BY r1.case_number,
                    r1.to_status,
                    r1.datemoved,
                    r1.territory,
                    r1.arrival_type) r2
     GROUP BY r2.to_status,
              r2.territory,
              r2.arrival_type
     ORDER BY r2.to_status) r3
WHERE r3.territory = ANY(CASE
  WHEN $1::boolean=false 
  THEN ARRAY[r3.territory]
  ELSE ARRAY[$2::text[]] 
  END) 
AND   r3.arrival_type =ANY(CASE
  WHEN $3::boolean=false
  THEN ARRAY[r3.arrival_type]
  ELSE ARRAY[$4::text[]] 
  END)
AND   r3.status1=ANY(CASE
  WHEN $5::boolean=false
  THEN ARRAY[r3.status1]
  ELSE ARRAY[$6::text[]] 
  END) 
GROUP BY r3.status1,
        r3.status_order
ORDER BY r3.status_order`,
      [req.body.territory_selected, req.body.territory_data, req.body.arrival_selected, req.body.arrival_data, req.body.workflow_selected, req.body.workflow_data],
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

router.post('/sc_case_by_status_drilldown', (req, res, next) => {
  //call doConnect method in db_operations
  var status = req.body;
  console.log("the data rec at back is:"+JSON.stringify(status));
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT main.case_number,
      main.territory,
      main.arrival_type,
      main.customer,
      main.case_owner,
      main.case_creation_date,
      main.sts_changed_on,
      main.contract_start_date,
      main.case_condition,
      CASE
        WHEN main.to_status = 'Open' THEN 'Open'
        WHEN main.to_status = 'Insufficient Data' THEN 'Insufficient Data'
        WHEN main.to_status = 'InProg' THEN 'InProg'
        WHEN main.to_status = 'InProg Acknowledged' THEN 'InProg Acknowledged'
        WHEN main.to_status = 'InProg Awt 3PS' THEN 'InProg Awt 3PS'
        WHEN main.to_status = 'InProg Awt Bus Unit' THEN 'InProg Awt Bus Unit'
        WHEN main.to_status = 'InProg Awt SSC' THEN 'InProg Awt SSC'
        WHEN main.to_status = 'InProg Awt Credit' THEN 'InProg Awt Credit'
        WHEN main.to_status = 'InProg Awt Resource' THEN 'InProg Awt Resource'
        ELSE 'OTHER'
      END AS status
FROM (SELECT r1.case_number,
            r1.to_status,
            MIN(r1.sts_changed_on),
            r1.datemoved,
            TO_NUMBER(TRIM(TO_CHAR(r1.datemoved -MIN(r1.sts_changed_on),'DD')),'99G999D9S') AS daysinstatus,
            r1.territory,
            r1.arrival_type,
            r1.customer,
            r1.case_owner,
            r1.case_creation_date,
            r1.contract_start_date,
            r1.sts_changed_on,
            r1.case_condition
     FROM (SELECT a2.case_number,
                  a2.to_status,
                  a2.sts_changed_on,
                  a2.territory,
                  a2.arrival_type,
                  a2.customer,
                  a2.case_owner,
                  a2.case_creation_date,
                  a2.contract_start_date,
                  a2.case_condition,
                  COALESCE((SELECT MAX(a1.sts_changed_on) FROM sc_case_state_master a1 WHERE a1.case_number = a2.case_number AND TRIM(a1.from_status) = TRIM(a2.to_status)),CURRENT_DATE) AS datemoved
           FROM sc_case_state_master a2
           ORDER BY a2.case_number,
                    a2.sts_changed_on) r1
                    WHERE r1.territory = ANY(CASE
                      WHEN $1::boolean=false 
                      THEN ARRAY[r1.territory]
                      ELSE ARRAY[$2::text[]] 
                      END) 
                    AND   r1.arrival_type =ANY(CASE
                      WHEN $3::boolean=false
                      THEN ARRAY[r1.arrival_type]
                      ELSE ARRAY[$4::text[]] 
                      END)
                    AND   r1.to_status=ANY(CASE
                      WHEN $5::boolean=false
                      THEN ARRAY[r1.to_status]
                      ELSE ARRAY[$6::text[]] 
                      END)
     GROUP BY r1.case_number,
              r1.to_status,
              r1.datemoved,
              r1.territory,
              r1.arrival_type,
              r1.customer,
              r1.case_owner,
              r1.case_creation_date,
              r1.contract_start_date,
              r1.sts_changed_on,
              r1.case_condition) main`,
      [req.body.territory_selected, req.body.territory_data, req.body.arrival_selected, req.body.arrival_data, req.body.workflow_selected, req.body.workflow_data],
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

router.post('/sc_cycle_times', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute body using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT r3.status1,
      r3.status_order,
      SUM(r3.mediandays::INTEGER) AS mediandays,
      AVG(r3.AverageDays) AverageDays,
      SUM(r3.caseperstatus) AS casecount
FROM (SELECT r2.to_status AS status,
            MEDIAN(r2.daysinstatus) AS mediandays,
            AVG(daysinstatus) AS AverageDays,
            COUNT(r2.case_number) AS caseperstatus,
            r2.territory,
            CASE
              WHEN r2.to_status = 'Open' THEN 'Open'
              WHEN r2.to_status = 'Insufficient Data' THEN 'Insufficient Data'
              WHEN r2.to_status = 'InProg' THEN 'InProg'
              WHEN r2.to_status = 'InProg Acknowledged' THEN 'InProg Acknowledged'
              WHEN r2.to_status = 'InProg Awt 3PS' THEN 'InProg Awt 3PS'
              WHEN r2.to_status = 'InProg Awt Bus Unit' THEN 'InProg Awt Bus Unit'
              WHEN r2.to_status = 'InProg Awt SSC' THEN 'InProg Awt SSC'
              WHEN r2.to_status = 'InProg Awt Credit' THEN 'InProg Awt Credit'
              WHEN r2.to_status = 'InProg Awt Resource' THEN 'InProg Awt Resource'
              ELSE 'OTHER'
            END AS status1,
            CASE
              WHEN r2.to_status = 'Open' THEN '1'
              WHEN r2.to_status = 'Insufficient Data' THEN '2'
              WHEN r2.to_status = 'InProg' THEN '3'
              WHEN r2.to_status = 'InProg Acknowledged' THEN '4'
              WHEN r2.to_status = 'InProg Awt 3PS' THEN '5'
              WHEN r2.to_status = 'InProg Awt Bus Unit' THEN '6'
              WHEN r2.to_status = 'InProg Awt SSC' THEN '7'
              WHEN r2.to_status = 'InProg Awt Credit' THEN '8'
              WHEN r2.to_status = 'InProg Awt Resource' THEN '9'
              ELSE 'OTHER'
            END AS status_order,
            r2.arrival_type
     FROM (SELECT r1.case_number,
                  r1.to_status,
                  MIN(r1.sts_changed_on),
                  r1.datemoved,
                  TO_NUMBER(TRIM(TO_CHAR(r1.datemoved -MIN(r1.sts_changed_on),'DD')),'99G999D9S') AS daysinstatus,
                  r1.territory,
                  r1.arrival_type
           FROM (SELECT a2.case_number,
                        a2.to_status,
                        a2.sts_changed_on,
                        a2.territory,
                        a2.arrival_type,
                        COALESCE((SELECT MAX(a1.sts_changed_on) FROM sc_case_state_master a1 WHERE a1.case_number = a2.case_number AND TRIM(a1.from_status) = TRIM(a2.to_status)),CURRENT_DATE) AS datemoved
                 FROM sc_case_state_master a2
                 where date(date_trunc('day',a2.case_creation_date))>= coalesce( $1::date, (date_trunc('month',CURRENT_DATE) - interval '25 months')) 
                 AND date(date_trunc('day',a2.case_creation_date))<=  coalesce( $2::date,  (date_trunc('month',CURRENT_DATE) - interval '1 months'))
                 ORDER BY a2.case_number,
                          a2.sts_changed_on) r1
           GROUP BY r1.case_number,
                    r1.to_status,
                    r1.datemoved,
                    r1.territory,
                    r1.arrival_type) r2
     GROUP BY r2.to_status,
              r2.territory,
              r2.arrival_type
     ORDER BY r2.to_status) r3
WHERE r3.territory = ANY(CASE
  WHEN $3::boolean=false 
  THEN ARRAY[r3.territory]
  ELSE ARRAY[$4::text[]] 
  END) 
AND   r3.arrival_type = ANY(CASE
  WHEN $5::boolean=false
  THEN ARRAY[r3.arrival_type]
  ELSE ARRAY[$6::text[]] 
  END)
  AND r3.status1=ANY(CASE
    WHEN $7::boolean=false
    THEN ARRAY[r3.status1]
    ELSE ARRAY[$8::text[]] 
    END) 
GROUP BY r3.status1,
        r3.status_order
ORDER BY r3.status_order;
`, [req.body.from_date, req.body.to_date, req.body.territory_selected, req.body.territory_data, req.body.arrival_selected, req.body.arrival_data, req.body.workflow_selected, req.body.workflow_data], function (err, result) {
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

router.post('/sc_cycle_times_drilldown', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute body using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT main.case_number,
      main.territory,
      main.arrival_type,
      main.customer,
      main.case_owner,
      main.case_creation_date,
      main.contract_start_date,
      main.case_condition,
      CASE
        WHEN main.to_status = 'Open' THEN 'Open'
        WHEN main.to_status = 'Insufficient Data' THEN 'Insufficient Data'
        WHEN main.to_status = 'InProg' THEN 'InProg'
        WHEN main.to_status = 'InProg Acknowledged' THEN 'InProg Acknowledged'
        WHEN main.to_status = 'InProg Awt 3PS' THEN 'InProg Awt 3PS'
        WHEN main.to_status = 'InProg Awt Bus Unit' THEN 'InProg Awt Bus Unit'
        WHEN main.to_status = 'InProg Awt SSC' THEN 'InProg Awt SSC'
        WHEN main.to_status = 'InProg Awt Credit' THEN 'InProg Awt Credit'
        WHEN main.to_status = 'InProg Awt Resource' THEN 'InProg Awt Resource'
        ELSE 'OTHER'
      END AS status
FROM (SELECT r1.case_number,
            r1.to_status,
            MIN(r1.sts_changed_on),
            r1.datemoved,
            TO_NUMBER(TRIM(TO_CHAR(r1.datemoved -MIN(r1.sts_changed_on),'DD')),'99G999D9S') AS daysinstatus,
            r1.territory,
            r1.arrival_type,
            r1.customer,
            r1.case_owner,
            r1.case_creation_date,
            r1.contract_start_date,
            r1.sts_changed_on,
            r1.case_condition
     FROM (SELECT a2.case_number,
                  a2.to_status,
                  a2.sts_changed_on,
                  a2.territory,
                  a2.arrival_type,
                  a2.customer,
                  a2.case_owner,
                  a2.case_creation_date,
                  a2.contract_start_date,
                  a2.case_condition,
                  COALESCE((SELECT MAX(a1.sts_changed_on) FROM sc_case_state_master a1 WHERE a1.case_number = a2.case_number AND TRIM(a1.from_status) = TRIM(a2.to_status)),CURRENT_DATE) AS datemoved
           FROM sc_case_state_master a2
           where date(date_trunc('day',a2.case_creation_date))>= coalesce( $1::date, (date_trunc('month',CURRENT_DATE) - interval '25 months')) 
           AND date(date_trunc('day',a2.case_creation_date))<=  coalesce( $2::date,  (date_trunc('month',CURRENT_DATE) - interval '1 months'))
           ORDER BY a2.case_number,
                    a2.sts_changed_on) r1
                    WHERE r1.territory = ANY(CASE
                      WHEN $3::boolean=false 
                      THEN ARRAY[r1.territory]
                      ELSE ARRAY[$4::text[]] 
                      END) 
                    AND   r1.arrival_type =ANY(CASE
                      WHEN $5::boolean=false
                      THEN ARRAY[r1.arrival_type]
                      ELSE ARRAY[$6::text[]] 
                      END)
                    AND   r1.to_status=ANY(CASE
                      WHEN $7::boolean=false
                      THEN ARRAY[r1.to_status]
                      ELSE ARRAY[$8::text[]] 
                      END) 
     GROUP BY r1.case_number,
              r1.to_status,
              r1.datemoved,
              r1.territory,
              r1.arrival_type,
              r1.customer,
              r1.case_owner,
              r1.case_creation_date,
              r1.contract_start_date,
              r1.sts_changed_on,
              r1.case_condition) main;
;
`, [req.body.from_date, req.body.to_date, req.body.territory_selected, req.body.territory_data, req.body.arrival_selected, req.body.arrival_data, req.body.workflow_selected, req.body.workflow_data], function (err, result) {
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
