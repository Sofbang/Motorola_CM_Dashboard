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
      `SELECT COUNT(DISTINCT m.case_number) AS Case_Count,
      TO_CHAR(DATE (DATE_TRUNC('month',m.case_creation_date)),'MON') || '-' ||EXTRACT(year FROM (DATE (DATE_TRUNC('month',m.case_creation_date)))) AS byMonth
FROM sc_case_state_master m
WHERE DATE (DATE_TRUNC('day',m.case_creation_date)) >= COALESCE( $1::date,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '25 months'))
AND   DATE (DATE_TRUNC('day',m.case_creation_date)) <= COALESCE($2::date,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '0 months'))
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
GROUP BY DATE_TRUNC('month',m.case_creation_date)
ORDER BY DATE_TRUNC('month',m.case_creation_date);`, [req.body.from_date, req.body.to_date, req.body.territory_selected, req.body.territory_data, req.body.arrival_selected, req.body.arrival_data],
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
      `SELECT m1.customer,
      m1.case_number,
      m1.to_status,
      m1.case_owner,
      m1.case_creation_date,
      m1.contract_start_date,
      m1.sts_changed_on,
      m1.case_condition,
      TO_CHAR(DATE (DATE_TRUNC('month',m1.case_creation_date)),'MON') || '-' ||EXTRACT(year FROM (DATE (DATE_TRUNC('month',m1.case_creation_date)))) AS byMonth
FROM sc_case_state_master m1
WHERE DATE (DATE_TRUNC('day',m1.case_creation_date)) >= COALESCE($1::DATE,DATE (DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '25 months'))
AND   DATE (DATE_TRUNC('day',m1.case_creation_date)) <= COALESCE($2::DATE,DATE (DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '1 months'))
AND   m1.sts_changed_on = (SELECT MAX(m2.sts_changed_on)
                          FROM sc_case_state_master m2
                          WHERE m1.case_number = m2.case_number)
AND   m1.territory = ANY (CASE WHEN $3::BOOLEAN = FALSE THEN ARRAY[m1.territory] ELSE ARRAY[$4::TEXT[]] END)
AND   m1.arrival_type = ANY (CASE WHEN $5::BOOLEAN = FALSE THEN ARRAY[m1.arrival_type] ELSE ARRAY[$6::TEXT[]] END)
GROUP BY DATE_TRUNC('month',m1.case_creation_date),
        m1.customer,
        m1.case_number,
        m1.to_status,
        m1.case_owner,
        m1.case_creation_date,
        m1.contract_start_date,
        m1.sts_changed_on,
        m1.case_condition
ORDER BY DATE_TRUNC('month',m1.case_creation_date);`
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
      `SELECT m.status AS status1,
      m.status_order AS status_order,
      COUNT(DISTINCT m.case_number) AS casecount,
      median(m.numofdays::INTEGER) AS mediandays,
      AVG(m.numofdays::INTEGER) AS AverageDays
FROM (SELECT DISTINCT a2.case_number AS case_number,
            a2.territory AS territory,
            a2.arrival_type AS arrival_type,
            a2.customer AS customer,
            a2.case_owner AS case_owner,
            a2.case_creation_date AS case_creation_date,
            a2.contract_start_date AS contract_start_date,
            a2.case_condition AS case_condition,
            CASE
              WHEN TRIM(a2.to_status) = 'Open' THEN 'Open'
              WHEN TRIM(a2.to_status) = 'Insufficient Data' THEN 'Insufficient Data'
              WHEN TRIM(a2.to_status) = 'InProg' THEN 'InProg'
              WHEN TRIM(a2.to_status) = 'InProg Acknowledged' THEN 'InProg Acknowledged'
              WHEN TRIM(a2.to_status) = 'InProg Awt 3PS' THEN 'InProg Awt 3PS'
              WHEN TRIM(a2.to_status) = 'InProg Awt Bus Unit' THEN 'InProg Awt Bus Unit'
              WHEN TRIM(a2.to_status) = 'InProg Awt SSC' THEN 'InProg Awt SSC'
              WHEN TRIM(a2.to_status) = 'InProg Awt Credit' THEN 'InProg Awt Credit'
              WHEN TRIM(a2.to_status) = 'InProg Awt Resource' THEN 'InProg Awt Resource'
              ELSE 'Other'
            END AS status,
            CASE
              WHEN TRIM(a2.to_status) = 'Open' THEN '1'
              WHEN TRIM(a2.to_status) = 'Insufficient Data' THEN '2'
              WHEN TRIM(a2.to_status) = 'InProg' THEN '3'
              WHEN TRIM(a2.to_status) = 'InProg Acknowledged' THEN '4'
              WHEN TRIM(a2.to_status) = 'InProg Awt 3PS' THEN '5'
              WHEN TRIM(a2.to_status) = 'InProg Awt Bus Unit' THEN '6'
              WHEN TRIM(a2.to_status) = 'InProg Awt SSC' THEN '7'
              WHEN TRIM(a2.to_status) = 'InProg Awt Credit' THEN '8'
              WHEN TRIM(a2.to_status) = 'InProg Awt Resource' THEN '9'
              ELSE 'Other'
            END AS status_order,
            a2.sts_changed_on AS sts_changed_on,
            EXTRACT(DAY FROM (CURRENT_DATE- DATE_TRUNC('day',a2.sts_changed_on))) NumofDays
     FROM sc_case_state_master a2
     WHERE a2.case_condition <> 'CLOSED'
     --AND   DATE (DATE_TRUNC('day',a2.case_creation_date)) >= COALESCE(NULL,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '25 months'))
    --AND   DATE (DATE_TRUNC('day',a2.case_creation_date)) <= COALESCE(NULL,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '0 months'))
     AND   a2.sts_changed_on = (SELECT MAX(a1.sts_changed_on)
                                FROM sc_case_state_master a1
                                WHERE a1.case_number = a2.case_number)) m
WHERE m.territory = ANY(CASE
WHEN $1::boolean=false 
THEN ARRAY[m.territory]
ELSE ARRAY[$2::text[]] 
END) 
AND   m.arrival_type =ANY(CASE
WHEN $3::boolean=false
THEN ARRAY[m.arrival_type]
ELSE ARRAY[$4::text[]] 
END)
AND   m.status=ANY(CASE
WHEN $5::boolean=false
THEN ARRAY[m.status]
ELSE ARRAY[$6::text[]] 
END) 
GROUP BY m.status,
        m.status_order
ORDER BY m.status_order;`,
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
      `SELECT DISTINCT a2.case_number AS case_number,
      a2.territory AS territory,
      a2.arrival_type AS arrival_type,
      a2.customer AS customer,
      a2.case_owner AS case_owner,
      a2.case_creation_date AS case_creation_date,
      a2.contract_start_date AS contract_start_date,
      a2.case_condition AS case_condition,
      CASE
        WHEN TRIM(a2.to_status) = 'Open' THEN 'Open'
        WHEN TRIM(a2.to_status) = 'Insufficient Data' THEN 'Insufficient Data'
        WHEN TRIM(a2.to_status) = 'InProg' THEN 'InProg'
        WHEN TRIM(a2.to_status) = 'InProg Acknowledged' THEN 'InProg Acknowledged'
        WHEN TRIM(a2.to_status) = 'InProg Awt 3PS' THEN 'InProg Awt 3PS'
        WHEN TRIM(a2.to_status) = 'InProg Awt Bus Unit' THEN 'InProg Awt Bus Unit'
        WHEN TRIM(a2.to_status) = 'InProg Awt SSC' THEN 'InProg Awt SSC'
        WHEN TRIM(a2.to_status) = 'InProg Awt Credit' THEN 'InProg Awt Credit'
        WHEN TRIM(a2.to_status) = 'InProg Awt Resource' THEN 'InProg Awt Resource'
        ELSE 'Other'
      END AS status,
      CASE
        WHEN TRIM(a2.to_status) = 'Open' THEN '1'
        WHEN TRIM(a2.to_status) = 'Insufficient Data' THEN '2'
        WHEN TRIM(a2.to_status) = 'InProg' THEN '3'
        WHEN TRIM(a2.to_status) = 'InProg Acknowledged' THEN '4'
        WHEN TRIM(a2.to_status) = 'InProg Awt 3PS' THEN '5'
        WHEN TRIM(a2.to_status) = 'InProg Awt Bus Unit' THEN '6'
        WHEN TRIM(a2.to_status) = 'InProg Awt SSC' THEN '7'
        WHEN TRIM(a2.to_status) = 'InProg Awt Credit' THEN '8'
        WHEN TRIM(a2.to_status) = 'InProg Awt Resource' THEN '9'
        ELSE 'Other'
      END AS status_order,
      a2.sts_changed_on AS sts_changed_on,
      EXTRACT(DAY FROM (CURRENT_DATE- DATE_TRUNC('day',a2.sts_changed_on))) NumofDays
FROM sc_case_state_master a2
WHERE a2.case_condition <> 'CLOSED'
--AND   DATE (DATE_TRUNC('day',a2.case_creation_date)) >= COALESCE(NULL,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '25 months'))
--AND   DATE (DATE_TRUNC('day',a2.case_creation_date)) <= COALESCE(NULL,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '0 months'))
--and trim(a2.to_status) not in ('Open','Insufficient Data','InProg', 'InProg Acknowledged','InProg Awt 3PS','InProg Awt Bus Unit','InProg Awt SSC','InProg Awt Credit', 'InProg Awt Resource')
AND   a2.sts_changed_on = (SELECT MAX(a1.sts_changed_on)
                          FROM sc_case_state_master a1
                          WHERE a1.case_number = a2.case_number)
AND   a2.territory = ANY(CASE
                    WHEN $1::boolean=false 
                    THEN ARRAY[a2.territory]
                    ELSE ARRAY[$2::text[]] 
                    END) 
                  AND   a2.arrival_type =ANY(CASE
                    WHEN $3::boolean=false
                    THEN ARRAY[a2.arrival_type]
                    ELSE ARRAY[$4::text[]] 
                    END)
                  AND   a2.to_status=ANY(CASE
                    WHEN $5::boolean=false
                    THEN ARRAY[a2.to_status]
                    ELSE ARRAY[$6::text[]] 
                    END)`,
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
      `SELECT m.status AS status1,
      m.status_order AS status_order,
      COUNT(DISTINCT m.case_number) AS casecount,
      median(m.numofdays::INTEGER) AS mediandays,
      AVG(m.numofdays::INTEGER) AS AverageDays
FROM (SELECT DISTINCT a2.case_number AS case_number,
            a2.territory AS territory,
            a2.arrival_type AS arrival_type,
            a2.customer AS customer,
            a2.case_owner AS case_owner,
            a2.case_creation_date AS case_creation_date,
            a2.contract_start_date AS contract_start_date,
            a2.case_condition AS case_condition,
            CASE
              WHEN TRIM(a2.to_status) = 'Open' THEN 'Open'
              WHEN TRIM(a2.to_status) = 'Insufficient Data' THEN 'Insufficient Data'
              WHEN TRIM(a2.to_status) = 'InProg' THEN 'InProg'
              WHEN TRIM(a2.to_status) = 'InProg Acknowledged' THEN 'InProg Acknowledged'
              WHEN TRIM(a2.to_status) = 'InProg Awt 3PS' THEN 'InProg Awt 3PS'
              WHEN TRIM(a2.to_status) = 'InProg Awt Bus Unit' THEN 'InProg Awt Bus Unit'
              WHEN TRIM(a2.to_status) = 'InProg Awt SSC' THEN 'InProg Awt SSC'
              WHEN TRIM(a2.to_status) = 'InProg Awt Credit' THEN 'InProg Awt Credit'
              WHEN TRIM(a2.to_status) = 'InProg Awt Resource' THEN 'InProg Awt Resource'
              ELSE 'Other'
            END AS status,
            CASE
              WHEN TRIM(a2.to_status) = 'Open' THEN '1'
              WHEN TRIM(a2.to_status) = 'Insufficient Data' THEN '2'
              WHEN TRIM(a2.to_status) = 'InProg' THEN '3'
              WHEN TRIM(a2.to_status) = 'InProg Acknowledged' THEN '4'
              WHEN TRIM(a2.to_status) = 'InProg Awt 3PS' THEN '5'
              WHEN TRIM(a2.to_status) = 'InProg Awt Bus Unit' THEN '6'
              WHEN TRIM(a2.to_status) = 'InProg Awt SSC' THEN '7'
              WHEN TRIM(a2.to_status) = 'InProg Awt Credit' THEN '8'
              WHEN TRIM(a2.to_status) = 'InProg Awt Resource' THEN '9'
              ELSE 'Other'
            END AS status_order,
            a2.sts_changed_on AS sts_changed_on,
            EXTRACT(DAY FROM (CURRENT_DATE- DATE_TRUNC('day',a2.sts_changed_on))) NumofDays
     FROM sc_case_state_master a2
     WHERE a2.case_condition <> 'CLOSED'
     AND   DATE (DATE_TRUNC('day',a2.case_creation_date)) >= COALESCE($1::date,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '25 months'))
     AND   DATE (DATE_TRUNC('day',a2.case_creation_date)) <= COALESCE($2::date,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '0 months'))
     AND   a2.sts_changed_on = (SELECT MAX(a1.sts_changed_on)
                                FROM sc_case_state_master a1
                                WHERE a1.case_number = a2.case_number)) m
WHERE m.territory = ANY(CASE
WHEN $3::boolean=false 
THEN ARRAY[m.territory]
ELSE ARRAY[$4::text[]] 
END) 
AND   m.arrival_type = ANY(CASE
WHEN $5::boolean=false
THEN ARRAY[m.arrival_type]
ELSE ARRAY[$6::text[]] 
END)
AND m.status=ANY(CASE
  WHEN $7::boolean=false
  THEN ARRAY[m.status]
  ELSE ARRAY[$8::text[]] 
  END) 
GROUP BY m.status,
        m.status_order
ORDER BY m.status_order;`,
 [req.body.from_date, req.body.to_date, req.body.territory_selected, req.body.territory_data, req.body.arrival_selected, req.body.arrival_data, req.body.workflow_selected, req.body.workflow_data], function (err, result) {
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
      `SELECT DISTINCT a2.case_number AS case_number,
      a2.territory AS territory,
      a2.arrival_type AS arrival_type,
      a2.customer AS customer,
      a2.case_owner AS case_owner,
      a2.case_creation_date AS case_creation_date,
      a2.contract_start_date AS contract_start_date,
      a2.case_condition AS case_condition,
      CASE
        WHEN TRIM(a2.to_status) = 'Open' THEN 'Open'
        WHEN TRIM(a2.to_status) = 'Insufficient Data' THEN 'Insufficient Data'
        WHEN TRIM(a2.to_status) = 'InProg' THEN 'InProg'
        WHEN TRIM(a2.to_status) = 'InProg Acknowledged' THEN 'InProg Acknowledged'
        WHEN TRIM(a2.to_status) = 'InProg Awt 3PS' THEN 'InProg Awt 3PS'
        WHEN TRIM(a2.to_status) = 'InProg Awt Bus Unit' THEN 'InProg Awt Bus Unit'
        WHEN TRIM(a2.to_status) = 'InProg Awt SSC' THEN 'InProg Awt SSC'
        WHEN TRIM(a2.to_status) = 'InProg Awt Credit' THEN 'InProg Awt Credit'
        WHEN TRIM(a2.to_status) = 'InProg Awt Resource' THEN 'InProg Awt Resource'
        ELSE 'Other'
      END AS status,
      CASE
        WHEN TRIM(a2.to_status) = 'Open' THEN '1'
        WHEN TRIM(a2.to_status) = 'Insufficient Data' THEN '2'
        WHEN TRIM(a2.to_status) = 'InProg' THEN '3'
        WHEN TRIM(a2.to_status) = 'InProg Acknowledged' THEN '4'
        WHEN TRIM(a2.to_status) = 'InProg Awt 3PS' THEN '5'
        WHEN TRIM(a2.to_status) = 'InProg Awt Bus Unit' THEN '6'
        WHEN TRIM(a2.to_status) = 'InProg Awt SSC' THEN '7'
        WHEN TRIM(a2.to_status) = 'InProg Awt Credit' THEN '8'
        WHEN TRIM(a2.to_status) = 'InProg Awt Resource' THEN '9'
        ELSE 'Other'
      END AS status_order,
      a2.sts_changed_on AS sts_changed_on,
      EXTRACT(DAY FROM (CURRENT_DATE- DATE_TRUNC('day',a2.sts_changed_on))) NumofDays
FROM sc_case_state_master a2
WHERE a2.case_condition <> 'CLOSED'
AND   DATE (DATE_TRUNC('day',a2.case_creation_date)) >= COALESCE($1::date,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '25 months'))
AND   DATE (DATE_TRUNC('day',a2.case_creation_date)) <= COALESCE($2::date,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '0 months'))
--and trim(a2.to_status) not in ('Open','Insufficient Data','InProg', 'InProg Acknowledged','InProg Awt 3PS','InProg Awt Bus Unit','InProg Awt SSC','InProg Awt Credit', 'InProg Awt Resource')
AND   a2.sts_changed_on = (SELECT MAX(a1.sts_changed_on)
                          FROM sc_case_state_master a1
                          WHERE a1.case_number = a2.case_number)
AND  a2.territory = ANY(CASE
                   WHEN $3::boolean=false 
                   THEN ARRAY[a2.territory]
                   ELSE ARRAY[$4::text[]] 
                   END) 
                 AND   a2.arrival_type =ANY(CASE
                   WHEN $5::boolean=false
                   THEN ARRAY[a2.arrival_type]
                   ELSE ARRAY[$6::text[]] 
                   END)
                 AND   a2.to_status=ANY(CASE
                   WHEN $7::boolean=false
                   THEN ARRAY[a2.to_status]
                   ELSE ARRAY[$8::text[]] 
                   END)
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
