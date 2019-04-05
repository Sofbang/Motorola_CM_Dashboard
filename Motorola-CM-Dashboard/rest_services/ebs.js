const express = require('express');
const router = express.Router();
const conn = require('../app_configuration/db_operations');
const response = require('../app_configuration/response');

// API for ebs_territories
router.get('/ebs_territories', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT DISTINCT( territory ) 
      FROM   ebs_contracts_state_master 
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
// API for ebs_workflow_status
router.get('/ebs_workflow_status', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT DISTINCT( to_status ) 
      FROM   ebs_contracts_state_master 
      WHERE  to_status IN ( 'Generate PO', 'PO Issued', 'QA Hold', 'Modify PO' ) `, [],
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


// API for ebs_workflow_status
router.get('/ebs_dates_max_min', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      "Select TO_CHAR(MAX(contract_creation_date), 'yyyy-mm-dd') as max_date_cases, TO_CHAR(MIN(contract_creation_date), 'yyyy-mm-dd')  as min_date_cases from ebs_contracts_state_master", [],
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
// // API for arrival_type
router.get('/ebs_arrival_type', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT DISTINCT( arrival_type ) 
      FROM   ebs_contracts_state_master 
      ORDER  BY arrival_type ASC`, [],
      function (err, result) {
        if (err) {
          conn.doRelease(dbConn);
          //call error handler
          return next(err);
        }
        response.data = result.rows;
        res.json(response);
       // console.log("ebs.js arrival_type data"+result.rows);
        //release connection back to pool
        conn.doRelease(dbConn);
      });
  });
});

router.post('/ebs_cycle_times', (req, res, next) => {
  // console.log("the status passed is:"+JSON.stringify(status));
  //call doConnect method in db_operations
  var postgresql = `SELECT TO_CHAR(DATE (DATE_TRUNC('month',main.contract_creation_date)),'MON') || '-' ||EXTRACT(YEAR FROM (DATE (DATE_TRUNC('month',main.contract_creation_date)))) AS by_month,
  COUNT(DISTINCT main.contract_number||coalesce (main.contract_number_modifier,'')) AS Contract_count,
  --median(main.numofdays) AS Median_days,
  median(main.Contract_Age) AS Median_days,
  AVG(main.Contract_Age) AS Average_NumofDays
--AVG(main.numofdays) AS Average_NumofDays
  FROM (SELECT DISTINCT m.contract_number,
               m.contract_number_modifier,
               m.customer_name,
               m.contract_owner,
               m.contract_creation_date,
               m.contract_start_date AS contract_start_date,
               m.contract_status,
               m.to_status,
               EXTRACT(DAY FROM (COALESCE(DATE_TRUNC('day',m.Date_signed),CURRENT_DATE) - DATE_TRUNC('day',m.contract_creation_date))) AS Contract_Age,
               EXTRACT(DAY FROM (CURRENT_DATE- DATE_TRUNC('day',m.sts_changed_on))) NumofDays,
               TO_CHAR(DATE (DATE_TRUNC('month',m.contract_creation_date)),'MON') || '-' ||EXTRACT(YEAR FROM (DATE (DATE_TRUNC('month',m.contract_creation_date)))) AS by_Month
        FROM ebs_contracts_state_master m
        WHERE m.sts_changed_on = (SELECT MAX(m2.sts_changed_on)
                                  FROM ebs_contracts_state_master m2
                                  WHERE m2.contract_number = m.contract_number
                                  AND   COALESCE(m2.contract_number_modifier,'') = COALESCE(m.contract_number_modifier,''))
AND   DATE (DATE_TRUNC('day',m.contract_creation_date)) >= COALESCE($1::DATE,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '25 months'))
AND   DATE (DATE_TRUNC('day',m.contract_creation_date)) <= COALESCE($2::DATE,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '0 months'))
AND   m.territory = ANY (CASE WHEN $3::BOOLEAN = FALSE THEN ARRAY[m.territory] ELSE ARRAY[$4::TEXT[]] END)
AND   m.arrival_type = ANY (CASE WHEN $5::BOOLEAN = FALSE THEN ARRAY[m.arrival_type] ELSE ARRAY[$6::TEXT[]] END)) main
GROUP BY DATE_TRUNC('month',main.contract_creation_date);`;
  //console.log("the query is:"+postgresql)
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      postgresql, [req.body.from_date, req.body.to_date, req.body.territory_selected, req.body.territory_data, req.body.arrival_selected, req.body.arrival_data],
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


router.post('/ebs_contract_state', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT main.to_status AS Status,
      COUNT(DISTINCT main.contract_number||coalesce (main.contract_number_modifier,'')) AS contractscount,
      median(main.numofdays) AS mediandays /*       AVG(main.numofdays) AS Average_NumofDays */
FROM (SELECT DISTINCT m.contract_number,
            m.contract_number_modifier,
            m.customer_name,
            m.contract_owner,
            m.contract_creation_date,
            m.contract_start_date,
            m.contract_status,
            m.to_status,
            m.contract_creation_date,
            EXTRACT(DAY FROM (CURRENT_DATE- DATE_TRUNC('day',m.sts_changed_on))) NumofDays,
            TO_CHAR(DATE (DATE_TRUNC('month',m.contract_creation_date)),'MON') || '-' ||EXTRACT(YEAR FROM (DATE (DATE_TRUNC('month',m.contract_creation_date)))) AS by_Month
     FROM ebs_contracts_state_master m
     WHERE m.sts_changed_on = (SELECT MAX(m2.sts_changed_on)
                               FROM ebs_contracts_state_master m2
                               WHERE m2.contract_number = m.contract_number
                               AND   COALESCE(m2.contract_number_modifier,'') = COALESCE(m.contract_number_modifier,''))
     AND   m.to_status IN ('Generate PO','PO Issued','QA Hold','Modify PO')
    --AND   DATE (DATE_TRUNC('day',m.contract_creation_date)) >= COALESCE(NULL,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '25 months'))
    --AND   DATE (DATE_TRUNC('day',m.contract_creation_date)) <= COALESCE(NULL,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '0 months'))
    AND   m.to_status = ANY (CASE WHEN $5::BOOLEAN = FALSE THEN ARRAY['Generate PO','PO Issued','QA Hold','Modify PO'] ELSE ARRAY[$6::TEXT[]] END)
    AND   m.territory = ANY (CASE WHEN $1::BOOLEAN = FALSE THEN ARRAY[m.territory] ELSE ARRAY[$2::TEXT[]] END)
    AND   m.arrival_type = ANY (CASE WHEN $3::BOOLEAN = FALSE THEN ARRAY[m.arrival_type] ELSE ARRAY[$4::TEXT[]] END)) main
GROUP BY main.to_status
ORDER BY main.to_status;`, 
      [req.body.territory_selected,req.body.territory_data,req.body.arrival_selected,req.body.arrival_data,req.body.workflow_selected,req.body.workflow_data],
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

router.post('/ebs_contractbystatus_drilldown', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      `SELECT DISTINCT m.contract_number AS contract_number,
      m.contract_number_modifier AS contract_number_modifier,
      m.customer_name AS customer_name,
      m.contract_owner AS contract_owner,
      m.contract_creation_date AS contract_creation_date,
      m.contract_start_date AS contract_start_date,
      m.contract_status AS contract_status,
      m.to_status AS to_status,
      m.contract_creation_date AS contract_creation_date,
      EXTRACT(DAY FROM (COALESCE(DATE_TRUNC('day',m.Date_signed),CURRENT_DATE) - DATE_TRUNC('day',m.contract_creation_date))) AS Contract_Age,
      EXTRACT(DAY FROM (CURRENT_DATE- DATE_TRUNC('day',m.sts_changed_on))) AS NumofDays,
      TO_CHAR(DATE (DATE_TRUNC('month',m.contract_creation_date)),'MON') || '-' ||EXTRACT(year FROM (DATE (DATE_TRUNC('month',m.contract_creation_date)))) AS by_Month
FROM ebs_contracts_state_master m
WHERE m.sts_changed_on = (SELECT MAX(m2.sts_changed_on)
                         FROM ebs_contracts_state_master m2
                         WHERE m2.contract_number = m.contract_number
                         AND   COALESCE(m2.contract_number_modifier,'') = COALESCE(m.contract_number_modifier,''))
AND m.to_status in ( 'Generate PO', 'PO Issued', 'QA Hold', 'Modify PO')                          
--AND   DATE (DATE_TRUNC('day',m.contract_creation_date)) >= COALESCE(NULL,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '25 months'))
--AND   DATE (DATE_TRUNC('day',m.contract_creation_date)) <= COALESCE(NULL,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '0 months'))
AND   m.to_status = ANY (CASE WHEN $5::BOOLEAN = FALSE THEN ARRAY['Generate PO','PO Issued','QA Hold','Modify PO'] ELSE ARRAY[$6::TEXT[]] END)
AND   m.territory = ANY (CASE WHEN $1::BOOLEAN = FALSE THEN ARRAY[m.territory] ELSE ARRAY[$2::TEXT[]] END)
AND   m.arrival_type = ANY (CASE WHEN $3::BOOLEAN = FALSE THEN ARRAY[m.arrival_type] ELSE ARRAY[$4::TEXT[]] END);`, 
      [req.body.territory_selected,req.body.territory_data,req.body.arrival_selected,req.body.arrival_data,req.body.workflow_selected,req.body.workflow_data],
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

router.post('/ebs_cycletime_drilldown', (req, res, next) => {
  //call doConnect method in db_operations
  conn.doConnect((err, dbConn) => {
    var postgresql = `SELECT DISTINCT m.contract_number AS contract_number,
    m.contract_number_modifier AS contract_number_modifier,
    m.customer_name AS customer_name,
    m.contract_owner AS contract_owner,
    m.contract_creation_date AS contract_creation_date,
    m.contract_start_date AS contract_start_date,
    m.contract_status AS contract_status,
    m.to_status AS to_status,
    m.contract_creation_date AS contract_creation_date,
    EXTRACT(DAY FROM (COALESCE(DATE_TRUNC('day',m.Date_signed),CURRENT_DATE) - DATE_TRUNC('day',m.contract_creation_date))) AS Contract_Age,
    EXTRACT(DAY FROM (CURRENT_DATE- DATE_TRUNC('day',m.sts_changed_on))) AS NumofDays,
    TO_CHAR(DATE (DATE_TRUNC('month',m.contract_creation_date)),'MON') || '-' ||EXTRACT(year FROM (DATE (DATE_TRUNC('month',m.contract_creation_date)))) AS by_Month
FROM ebs_contracts_state_master m
WHERE m.sts_changed_on = (SELECT MAX(m2.sts_changed_on)
                       FROM ebs_contracts_state_master m2
                       WHERE m2.contract_number = m.contract_number
                       AND   COALESCE(m2.contract_number_modifier,'') = COALESCE(m.contract_number_modifier,''))
AND  DATE (DATE_TRUNC('day',m.contract_creation_date)) >= COALESCE($1::DATE,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '25 months'))
AND   DATE (DATE_TRUNC('day',m.contract_creation_date)) <= COALESCE($2::DATE,(DATE_TRUNC('month',CURRENT_DATE) -INTERVAL '0 months'))
AND   m.territory = ANY (CASE WHEN $3::BOOLEAN = FALSE THEN ARRAY[m.territory] ELSE ARRAY[$4::TEXT[]] END)
AND   m.arrival_type = ANY (CASE WHEN $5::BOOLEAN = FALSE THEN ARRAY[m.arrival_type] ELSE ARRAY[$6::TEXT[]] END);`;
    //console.log("the query for avg is:"+JSON.stringify(postgresql));
    if (err) { return next(err); }
    //execute query using using connection instance returned by doConnect method
    conn.doExecute(dbConn,
      postgresql, [req.body.from_date, req.body.to_date, req.body.territory_selected, req.body.territory_data, req.body.arrival_selected, req.body.arrival_data],
      function (err, result) {
        if (err) {
          conn.doRelease(dbConn);
          //call error handler
          //console.log("error---" + err);
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
