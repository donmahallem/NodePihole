/**
 * @api {get} /api/data Get Summary
 * @apiName GetDataSummary
 * @apiGroup Data
 * @apiVersion 1.0.0
 * @apiPermission none
 * @apiParam (Query Parameter) {Boolean=true} summary Gets the summary
 *
 * @apiSuccess {Object} summary The object summary
 * @apiSuccess {Number} summary.adsBlockedToday Total blocked queries
 * @apiSuccess {Number} summary.dnsQueriesToday Total dns queries
 * @apiSuccess {Number} summary.adsPercentageToday Percentage of blocked requests
 * @apiSuccess {Number} summary.domainsBeingBlocked Domains being blocked in total
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "summary":{
 *         "adsBlockedToday": 10,
 *         "dnsQueriesToday": 100,
 *         "adsPercentageToday": 10.0,
 *         "domainsBeingBlocked": 1337
 *       }
 *     }
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */

/**
 * @api {get} /api/data Get topItems
 * @apiName GetDataTopItems
 * @apiGroup Data
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiParam (Query Parameter) {Boolean=true} topItems Gets the queries over time in 10 minute frames
 *
 * @apiSuccess {Object} topItems Array with query data
 * @apiSuccess {Object} overTimeData.topQueries number of ads in that timeframe
 * @apiSuccess {Object} overTimeData.topAds number of queries in that timeframe
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "topItems":{
 *         "topQueries":{
 *           "good.domain1":29,
 *           "good.domain2":39,
 *         },
 *         "topAds":{
 *           "baddomain1":29,
 *           "baddomain2":39,
 *         }
 *       }
 *     }
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */
/**
 * @api {get} /api/data Get OverTimeData
 * @apiName GetDataOverTimeData
 * @apiGroup Data
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiParam (Query Parameter) {Boolean=true} overTimeData Gets the queries over time in 10 minute frames
 * @apiParam (Query Parameter) {Number=1,10,60} [frameSize=10] Sets the overtime timeframe size in minutes
 *
 * @apiSuccess {Object[]} overTimeData Array with query data
 * @apiSuccess {Number{0-..}} overTimeData.ads number of ads in that timeframe
 * @apiSuccess {Number} overTimeData.queries number of queries in that timeframe
 * @apiSuccess {Number} overTimeData.frame the frame number
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "overTimeData":[
 *         {
 *           "ads":20,
 *           "queries":200,
 *           "frame":0
 *         },
 *         {
 *           "ads":20,
 *           "queries":200,
 *           "frame":1
 *         },
 *         {
 *           "ads":20,
 *           "queries":200,
 *           "frame":2
 *         }
 *       ]
 *     }
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */

/**
 * @api {get} /api/data Get query sources
 * @apiName GetDataQuerySources
 * @apiGroup Data
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiParam (Query Parameter) {Boolean=true} querySources Gets the query sources
 *
 * @apiSuccess {Object[]} querySources Array with query sources
 * @apiSuccess {String} querySource.ip source ip
 * @apiSuccess {String} [querySource.domain] source domain if known
 * @apiSuccess {Number} querySource.count number of queries from this source
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "querySources":[
 *         {
 *           "ip": "127.0.0.1",
 *           "domain": "localhost",
 *           "count":20
 *         },
 *         {
 *           "ip": "192.168.178.1",
 *           "count":29
 *         }
 *       ]
 *     }
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */

/**
 * @api {get} /api/taillog/ Opens an eventsource stream that tails the log file
 * @apiName GetLogLive
 * @apiGroup Log
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiUse NotAuthorized
 */
/**
 * @api {get} /api/data Get forward Destinations
 * @apiName GetDataForwardDestinations
 * @apiGroup Data
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiParam (Query Parameter) {Boolean=true} forwardDestinations forward destinations
 *
 * @apiSuccess {Object[]} forwardDestinations Array with query sources
 * @apiSuccess {String} forwardDestinations.destination name of destination
 * @apiSuccess {Number} forwardDestinations.count number of queries to this destination
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "forwardDestinations":[
 *         {
 *           "destination": "8.8.8.8",
 *           "count":20
 *         },
 *         {
 *           "destination": "8.8.4.4",
 *           "count":29
 *         }
 *       ]
 *     }
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */

/**
 * @api {get} /api/list/ Gets the white/black list
 * @apiName GetDomains
 * @apiGroup Lists
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiParam (Query Parameter) {string="white","black"} The list name
 * @apiError NotFound The <code>list</code> is unknown to the server
 * @apiUse NotAuthorized
 * @apiUse InvalidRequest
 * @apiUse ErrorNotFound
 */
