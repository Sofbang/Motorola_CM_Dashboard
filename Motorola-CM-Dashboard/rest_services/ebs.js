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
        //release connection back to pool
        conn.doRelease(dbConn);
      });
  });
});

router.post('/ebs_cycle_times', (req, res, next) => {
  // console.log("the status passed is:"+JSON.stringify(status));
  //call doConnect method in db_operations
  var postgresql = `select count(distinct main.contract_number||coalesce(main.contract_number_modifier,' ')) Contract_count
  --main.contract_number, coalesce(main.contract_number_modifier,'A')
  --select count(main.contract_modifier_number)Contract_count
    ,to_char(date (date_trunc('month',main.contract_creation_date)),'MON')||'-'|| extract (year from (date (date_trunc('month',main.contract_creation_date)))) as by_Month
    ,median(main.numofdays) Median_days
    ,avg(main.numofdays)Average_NumofDays
    from
    (
    select m.*
    ,extract(day from coalesce(m.date_signed,CURRENT_DATE) - date_trunc('day',m.contract_creation_date)) NumofDays,m.territory,m.arrival_type
    from ebs_contracts_state_master m
    where m.sts_changed_on = (select max(m2.sts_changed_on) from ebs_contracts_state_master m2 where m2.contract_number = m.contract_number)
    and date(date_trunc('day',m.contract_creation_date))>= coalesce(  $1::date, (date_trunc('month',CURRENT_DATE) - interval '25 months')) 
    AND date(date_trunc('day',m.contract_creation_date))<=  coalesce( $2::date,  (date_trunc('month',CURRENT_DATE) - interval '1 months'))
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
    ) main
    Group by date_trunc('month',main.contract_creation_date)`;
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
      `SELECT
      r3.status
    , SUM( r3.mediandays::INTEGER) AS mediandays
    , SUM(r3.contractperstatus) AS contractscount
   FROM 
           (SELECT r2.to_status AS status
              , MEDIAN(r2.daysinstatus) AS mediandays
              , COUNT(r2.contract_number) AS contractperstatus
              , r2.territory
              , r2.arrival_type 
            FROM    
                  ( SELECT r1.contract_number
                  , r1.contract_number_modifier
                  , r1.to_status
                  , MIN(r1.sts_changed_on)
                  , r1.datemoved
                  , to_number(TRIM(to_char(r1.datemoved - MIN(r1.sts_changed_on),'DD')),'99G999D9S') AS daysinstatus
                  , r1.territory 
                  , r1.arrival_type
                    FROM   ( SELECT a2.contract_number
                             , a2.contract_number_modifier
                            , a2.to_status
                            , a2.sts_changed_on
                            , a2.territory
                            , a2.arrival_type
                            , COALESCE(   ( SELECT MAX(a1.sts_changed_on) 
                                                       FROM ebs_contracts_state_master a1 
                                                       WHERE a1.contract_number = a2.contract_number 
                                                       AND a1.from_status = a2.to_status), current_date ) AS datemoved 
                                 FROM ebs_contracts_state_master a2 
                                 ORDER BY contract_number, sts_changed_on ) r1
                    GROUP BY r1.contract_number,  r1.contract_number_modifier ,r1.to_status, r1.datemoved, r1.territory, r1.arrival_type) r2
              GROUP BY r2.to_status, r2.territory ,r2.arrival_type  
              ORDER BY r2.to_status) r3
    WHERE r3.status = ANY(CASE
              WHEN $5::boolean=false
              THEN ARRAY['Generate PO', 'PO Issued', 'QA Hold', 'Modify PO']
              ELSE ARRAY[$6::text[]] 
              END) 
      AND r3.territory = ANY(CASE
              WHEN $1::boolean=false 
              THEN ARRAY[r3.territory]
              ELSE ARRAY[$2::text[]] 
              END)
      AND r3.arrival_type =ANY(CASE
              WHEN $3::boolean=false
              THEN ARRAY[r3.arrival_type]
              ELSE ARRAY[$4::text[]] 
              END)
   GROUP
       BY r3.status`, 
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
      `SELECT r1.contract_number
      , r1.to_status
      , r1.datemoved
      , r1.territory 
      , r1.arrival_type
      , (select distinct s1.customer_name from ebs_contracts_state_master s1 where s1.contract_number = r1.contract_number  limit 1 )
      , (select distinct s1.contract_owner from ebs_contracts_state_master s1 where s1.contract_number = r1.contract_number limit 1 )
      , (select distinct s1.contract_creation_date from ebs_contracts_state_master s1 where s1.contract_number = r1.contract_number limit 1 )
FROM   ( SELECT a2.contract_number
         , a2.contract_number_modifier
                , a2.to_status
                , a2.sts_changed_on
                , a2.territory
                , a2.arrival_type
                , customer_name
                , contract_owner
                , contract_creation_date
                , COALESCE(   ( SELECT MAX(a1.sts_changed_on) 
                                           FROM ebs_contracts_state_master a1 
                                           WHERE a1.contract_number = a2.contract_number 
                                           AND a1.from_status = a2.to_status), current_date ) AS datemoved 
                     FROM ebs_contracts_state_master a2 
                     ORDER BY contract_number, sts_changed_on ) r1
where r1.to_status =ANY(CASE
WHEN $5::boolean=false
THEN ARRAY['Generate PO', 'PO Issued', 'QA Hold', 'Modify PO']
ELSE ARRAY[$6::text[]] 
END) 
and r1.territory = ANY(CASE
WHEN $1::boolean=false 
THEN ARRAY[r1.territory]
ELSE ARRAY[$2::text[]] 
END)
and r1.arrival_type =ANY(CASE
WHEN $3::boolean=false
THEN ARRAY[r1.arrival_type]
ELSE ARRAY[$4::text[]] 
END)
GROUP BY r1.contract_number
,r1.contract_number_modifier
, r1.to_status
, r1.datemoved
, r1.territory
, r1.arrival_type`, 
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
    var postgresql = `select distinct m.contract_number
    , m.contract_number_modifier
    , m.customer_name
    , m.contract_owner
    , m.contract_creation_date
    , m.contract_status
    , m.to_status
    , m.contract_creation_date
    ,to_char(date (date_trunc('month',m.contract_creation_date)),'MON')||'-'|| extract (year from (date (date_trunc('month',m.contract_creation_date)))) as by_Month
    from ebs_contracts_state_master m
    where m.sts_changed_on = (select max(m2.sts_changed_on) from ebs_contracts_state_master m2 where m2.contract_number = m.contract_number)
    and date(date_trunc('day',m.contract_creation_date))>= coalesce( $1::date, (date_trunc('month',CURRENT_DATE) - interval '25 months')) 
    AND date(date_trunc('day',m.contract_creation_date))<=  coalesce( $2::date,  (date_trunc('month',CURRENT_DATE) - interval '1 months'))
    and m.territory =ANY(CASE
          WHEN $3::boolean=false 
          THEN ARRAY[m.territory]
          ELSE ARRAY[$4::text[]] 
          END)
        and m.arrival_type =ANY(CASE
          WHEN $5::boolean=false
          THEN ARRAY[m.arrival_type]
          ELSE ARRAY[$6::text[]] 
          END) 
    Group by date_trunc('month',m.contract_creation_date)
    ,m.contract_number
    , m.contract_number_modifier
    , m.customer_name
    , m.contract_owner
    , m.contract_creation_date
    , m.contract_status
    , m.to_status
    , m.contract_creation_date`;
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
