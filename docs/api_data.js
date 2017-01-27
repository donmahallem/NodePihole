define({ "api": [
  {
    "type": "get",
    "url": "/api/data",
    "title": "Query data from the log",
    "description": "<p>You can choose any combination of the following query parameters to combine those. Some need authentication(Please refer to the detailed listing of the parameters for response types and parameters)</p>",
    "name": "Data",
    "group": "Data",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Query Parameter": [
          {
            "group": "Query Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "summary",
            "defaultValue": "false",
            "description": "<p>Please refer to <a href=\"#api-Data-GetDataSummary\">summary</a></p>"
          },
          {
            "group": "Query Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "overTimeData",
            "defaultValue": "false",
            "description": "<p>Please refer to <a href=\"#api-Data-GetDataOverTimeData\">overTimeData</a></p>"
          },
          {
            "group": "Query Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "topItems",
            "defaultValue": "false",
            "description": "<p>Please refer to <a href=\"#api-Data-GetDataTopItems\">topItems</a></p>"
          },
          {
            "group": "Query Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "recentItems",
            "defaultValue": "false",
            "description": "<p>Please refer to <a href=\"#api-Data-GetDataRecentItems\">recentItems</a></p>"
          },
          {
            "group": "Query Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "queryTypes",
            "defaultValue": "false",
            "description": "<p>Please refer to <a href=\"#api-Data-GetDataQueryTypes\">queryTypes</a></p>"
          },
          {
            "group": "Query Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "forwardDestinations",
            "defaultValue": "false",
            "description": "<p>Please refer to <a href=\"#api-Data-GetDataForwardDestinations\">forwardDestinations</a></p>"
          },
          {
            "group": "Query Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "allQueries",
            "defaultValue": "false",
            "description": "<p>Please refer to <a href=\"#api-Data-GetDataAllQueries\">allQueries</a></p>"
          },
          {
            "group": "Query Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "querySources",
            "defaultValue": "false",
            "description": "<p>Please refer to <a href=\"#api-Data-GetDataQuerySources\">querySources</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "?summary&topItems",
          "type": "query"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"summary\": {...}\n  \"topItems\": {...}\n}",
          "type": "json"
        }
      ]
    },
    "filename": "server/routes/api.js",
    "groupTitle": "Data",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidRequest",
            "description": "<p>The request is malformed</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>The requester is not authorized to access this endpoint</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidRequest Response:",
          "content": "HTTP/1.1 400 Invalid Request\n{\n  \"error\":{\n    \"code\":400,\n    \"message\":\"Bad Request\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "NotAuthorized Response:",
          "content": "HTTP/1.1 401 Not Authorized\n{\n  \"error\":{\n    \"code\":401,\n    \"message\":\"Not authorized\"\n  }\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/api/data",
    "title": "Get forward Destinations",
    "name": "GetDataForwardDestinations",
    "group": "Data",
    "version": "1.0.0",
    "permission": [
      {
        "name": "admin",
        "title": "AdminUser",
        "description": "<p>A logged in user</p>"
      }
    ],
    "parameter": {
      "fields": {
        "Query Parameter": [
          {
            "group": "Query Parameter",
            "type": "Boolean",
            "allowedValues": [
              "true"
            ],
            "optional": false,
            "field": "forwardDestinations",
            "description": "<p>forward destinations</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "forwardDestinations",
            "description": "<p>Array with query sources</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "forwardDestinations.destination",
            "description": "<p>name of destination</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "forwardDestinations.count",
            "description": "<p>number of queries to this destination</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"forwardDestinations\":[\n    {\n      \"destination\": \"8.8.8.8\",\n      \"count\":20\n    },\n    {\n      \"destination\": \"8.8.4.4\",\n      \"count\":29\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "server/routes/api.js",
    "groupTitle": "Data",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidRequest",
            "description": "<p>The request is malformed</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>The requester is not authorized to access this endpoint</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidRequest Response:",
          "content": "HTTP/1.1 400 Invalid Request\n{\n  \"error\":{\n    \"code\":400,\n    \"message\":\"Bad Request\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "NotAuthorized Response:",
          "content": "HTTP/1.1 401 Not Authorized\n{\n  \"error\":{\n    \"code\":401,\n    \"message\":\"Not authorized\"\n  }\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/api/data",
    "title": "Get OverTimeData",
    "name": "GetDataOverTimeData",
    "group": "Data",
    "version": "1.0.0",
    "permission": [
      {
        "name": "admin",
        "title": "AdminUser",
        "description": "<p>A logged in user</p>"
      }
    ],
    "parameter": {
      "fields": {
        "Query Parameter": [
          {
            "group": "Query Parameter",
            "type": "Boolean",
            "allowedValues": [
              "true"
            ],
            "optional": false,
            "field": "overTimeData",
            "description": "<p>Gets the queries over time in 10 minute frames</p>"
          },
          {
            "group": "Query Parameter",
            "type": "Number",
            "allowedValues": [
              "1",
              "10",
              "60"
            ],
            "optional": true,
            "field": "frameSize",
            "defaultValue": "10",
            "description": "<p>Sets the overtime timeframe size in minutes</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "overTimeData",
            "description": "<p>Array with query data</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "size": "0-..",
            "optional": false,
            "field": "overTimeData.ads",
            "description": "<p>number of ads in that timeframe</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "overTimeData.queries",
            "description": "<p>number of queries in that timeframe</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "overTimeData.frame",
            "description": "<p>the frame number</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"overTimeData\":[\n    {\n      \"ads\":20,\n      \"queries\":200,\n      \"frame\":0\n    },\n    {\n      \"ads\":20,\n      \"queries\":200,\n      \"frame\":1\n    },\n    {\n      \"ads\":20,\n      \"queries\":200,\n      \"frame\":2\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "server/routes/api.js",
    "groupTitle": "Data",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidRequest",
            "description": "<p>The request is malformed</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>The requester is not authorized to access this endpoint</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidRequest Response:",
          "content": "HTTP/1.1 400 Invalid Request\n{\n  \"error\":{\n    \"code\":400,\n    \"message\":\"Bad Request\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "NotAuthorized Response:",
          "content": "HTTP/1.1 401 Not Authorized\n{\n  \"error\":{\n    \"code\":401,\n    \"message\":\"Not authorized\"\n  }\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/api/data",
    "title": "Get query sources",
    "name": "GetDataQuerySources",
    "group": "Data",
    "version": "1.0.0",
    "permission": [
      {
        "name": "admin",
        "title": "AdminUser",
        "description": "<p>A logged in user</p>"
      }
    ],
    "parameter": {
      "fields": {
        "Query Parameter": [
          {
            "group": "Query Parameter",
            "type": "Boolean",
            "allowedValues": [
              "true"
            ],
            "optional": false,
            "field": "querySources",
            "description": "<p>Gets the query sources</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "querySources",
            "description": "<p>Array with query sources</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "querySource.ip",
            "description": "<p>source ip</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "querySource.domain",
            "description": "<p>source domain if known</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "querySource.count",
            "description": "<p>number of queries from this source</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"querySources\":[\n    {\n      \"ip\": \"127.0.0.1\",\n      \"domain\": \"localhost\",\n      \"count\":20\n    },\n    {\n      \"ip\": \"192.168.178.1\",\n      \"count\":29\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "server/routes/api.js",
    "groupTitle": "Data",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidRequest",
            "description": "<p>The request is malformed</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>The requester is not authorized to access this endpoint</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidRequest Response:",
          "content": "HTTP/1.1 400 Invalid Request\n{\n  \"error\":{\n    \"code\":400,\n    \"message\":\"Bad Request\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "NotAuthorized Response:",
          "content": "HTTP/1.1 401 Not Authorized\n{\n  \"error\":{\n    \"code\":401,\n    \"message\":\"Not authorized\"\n  }\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/api/data",
    "title": "Get Querytypes",
    "name": "GetDataQueryTypes",
    "group": "Data",
    "version": "1.0.0",
    "permission": [
      {
        "name": "admin",
        "title": "AdminUser",
        "description": "<p>A logged in user</p>"
      }
    ],
    "parameter": {
      "fields": {
        "Query Parameter": [
          {
            "group": "Query Parameter",
            "type": "Boolean",
            "allowedValues": [
              "true"
            ],
            "optional": false,
            "field": "queryTypes",
            "description": "<p>Gets the query types</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "queryTypes",
            "description": "<p>Array with query types</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "queryTypes.type",
            "description": "<p>query type</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "queryTypes.count",
            "description": "<p>number of queries with this type</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"queryTypes\":[\n    {\n      \"type\": \"AAAA\",\n      \"count\": 299\n    },\n    {\n      \"type\": \"AA\",\n      \"count\": 100\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "server/routes/api.js",
    "groupTitle": "Data",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidRequest",
            "description": "<p>The request is malformed</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>The requester is not authorized to access this endpoint</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidRequest Response:",
          "content": "HTTP/1.1 400 Invalid Request\n{\n  \"error\":{\n    \"code\":400,\n    \"message\":\"Bad Request\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "NotAuthorized Response:",
          "content": "HTTP/1.1 401 Not Authorized\n{\n  \"error\":{\n    \"code\":401,\n    \"message\":\"Not authorized\"\n  }\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/api/data",
    "title": "Get Summary",
    "name": "GetDataSummary",
    "group": "Data",
    "version": "1.0.0",
    "permission": [
      {
        "name": "none",
        "title": "public",
        "description": "<p>This api endpoint is public</p>"
      }
    ],
    "parameter": {
      "fields": {
        "Query Parameter": [
          {
            "group": "Query Parameter",
            "type": "Boolean",
            "allowedValues": [
              "true"
            ],
            "optional": false,
            "field": "summary",
            "description": "<p>Gets the summary</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "summary",
            "description": "<p>The object summary</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "summary.adsBlockedToday",
            "description": "<p>Total blocked queries</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "summary.dnsQueriesToday",
            "description": "<p>Total dns queries</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "summary.adsPercentageToday",
            "description": "<p>Percentage of blocked requests</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "summary.domainsBeingBlocked",
            "description": "<p>Domains being blocked in total</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"summary\":{\n    \"adsBlockedToday\": 10,\n    \"dnsQueriesToday\": 100,\n    \"adsPercentageToday\": 10.0,\n    \"domainsBeingBlocked\": 1337\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "server/routes/api.js",
    "groupTitle": "Data",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidRequest",
            "description": "<p>The request is malformed</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>The requester is not authorized to access this endpoint</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidRequest Response:",
          "content": "HTTP/1.1 400 Invalid Request\n{\n  \"error\":{\n    \"code\":400,\n    \"message\":\"Bad Request\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "NotAuthorized Response:",
          "content": "HTTP/1.1 401 Not Authorized\n{\n  \"error\":{\n    \"code\":401,\n    \"message\":\"Not authorized\"\n  }\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/api/data",
    "title": "Get topItems",
    "name": "GetDataTopItems",
    "group": "Data",
    "version": "1.0.0",
    "permission": [
      {
        "name": "admin",
        "title": "AdminUser",
        "description": "<p>A logged in user</p>"
      }
    ],
    "parameter": {
      "fields": {
        "Query Parameter": [
          {
            "group": "Query Parameter",
            "type": "Boolean",
            "allowedValues": [
              "true"
            ],
            "optional": false,
            "field": "topItems",
            "description": "<p>Gets the queries over time in 10 minute frames</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "topItems",
            "description": "<p>Array with query data</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "overTimeData.topQueries",
            "description": "<p>number of ads in that timeframe</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "overTimeData.topAds",
            "description": "<p>number of queries in that timeframe</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"topItems\":{\n    \"topQueries\":{\n      \"good.domain1\":29,\n      \"good.domain2\":39,\n    },\n    \"topAds\":{\n      \"baddomain1\":29,\n      \"baddomain2\":39,\n    }\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "server/routes/api.js",
    "groupTitle": "Data",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidRequest",
            "description": "<p>The request is malformed</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>The requester is not authorized to access this endpoint</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidRequest Response:",
          "content": "HTTP/1.1 400 Invalid Request\n{\n  \"error\":{\n    \"code\":400,\n    \"message\":\"Bad Request\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "NotAuthorized Response:",
          "content": "HTTP/1.1 401 Not Authorized\n{\n  \"error\":{\n    \"code\":401,\n    \"message\":\"Not authorized\"\n  }\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/api/list/",
    "title": "Adds a domain to the specified list",
    "name": "AddDomain",
    "group": "Lists",
    "version": "1.0.0",
    "permission": [
      {
        "name": "admin",
        "title": "AdminUser",
        "description": "<p>A logged in user</p>"
      }
    ],
    "parameter": {
      "fields": {
        "Query Parameter": [
          {
            "group": "Query Parameter",
            "type": "string",
            "allowedValues": [
              "\"white\"",
              "\"black\""
            ],
            "optional": false,
            "field": "The",
            "description": "<p>list name</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotFound",
            "description": "<p>The <code>list</code> is unknown to the server</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>The requester is not authorized to access this endpoint</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidRequest",
            "description": "<p>The request is malformed</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "NotAuthorized Response:",
          "content": "HTTP/1.1 401 Not Authorized\n{\n  \"error\":{\n    \"code\":401,\n    \"message\":\"Not authorized\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "InvalidRequest Response:",
          "content": "HTTP/1.1 400 Invalid Request\n{\n  \"error\":{\n    \"code\":400,\n    \"message\":\"Bad Request\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "NotFound Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\":{\n    \"code\":404,\n    \"message\":\"Not found\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "server/routes/api.js",
    "groupTitle": "Lists"
  },
  {
    "type": "delete",
    "url": "/api/list/",
    "title": "Deletes a domain from the specified list",
    "name": "DeleteDomain",
    "group": "Lists",
    "version": "1.0.0",
    "permission": [
      {
        "name": "admin",
        "title": "AdminUser",
        "description": "<p>A logged in user</p>"
      }
    ],
    "parameter": {
      "fields": {
        "Query Parameter": [
          {
            "group": "Query Parameter",
            "type": "string",
            "allowedValues": [
              "\"white\"",
              "\"black\""
            ],
            "optional": false,
            "field": "The",
            "description": "<p>list name</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotFound",
            "description": "<p>The <code>list</code> is unknown to the server</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>The requester is not authorized to access this endpoint</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidRequest",
            "description": "<p>The request is malformed</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "NotAuthorized Response:",
          "content": "HTTP/1.1 401 Not Authorized\n{\n  \"error\":{\n    \"code\":401,\n    \"message\":\"Not authorized\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "InvalidRequest Response:",
          "content": "HTTP/1.1 400 Invalid Request\n{\n  \"error\":{\n    \"code\":400,\n    \"message\":\"Bad Request\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "NotFound Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\":{\n    \"code\":404,\n    \"message\":\"Not found\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "server/routes/api.js",
    "groupTitle": "Lists"
  },
  {
    "type": "get",
    "url": "/api/list/",
    "title": "Gets the white/black list",
    "name": "GetDomains",
    "group": "Lists",
    "version": "1.0.0",
    "permission": [
      {
        "name": "admin",
        "title": "AdminUser",
        "description": "<p>A logged in user</p>"
      }
    ],
    "parameter": {
      "fields": {
        "Query Parameter": [
          {
            "group": "Query Parameter",
            "type": "string",
            "allowedValues": [
              "\"white\"",
              "\"black\""
            ],
            "optional": false,
            "field": "The",
            "description": "<p>list name</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotFound",
            "description": "<p>The <code>list</code> is unknown to the server</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>The requester is not authorized to access this endpoint</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidRequest",
            "description": "<p>The request is malformed</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "NotAuthorized Response:",
          "content": "HTTP/1.1 401 Not Authorized\n{\n  \"error\":{\n    \"code\":401,\n    \"message\":\"Not authorized\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "InvalidRequest Response:",
          "content": "HTTP/1.1 400 Invalid Request\n{\n  \"error\":{\n    \"code\":400,\n    \"message\":\"Bad Request\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "NotFound Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\":{\n    \"code\":404,\n    \"message\":\"Not found\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "server/routes/api.js",
    "groupTitle": "Lists"
  },
  {
    "type": "post",
    "url": "/api/disable/",
    "title": "Disable Pihole",
    "name": "Disables_the_Pi_Hole",
    "group": "Status",
    "version": "1.0.0",
    "permission": [
      {
        "name": "admin",
        "title": "AdminUser",
        "description": "<p>A logged in user</p>"
      }
    ],
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "Number",
            "optional": false,
            "field": "time",
            "description": "<p>a positive number in seconds for how long to disable the pihole. 0 disables indefinitely</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>the status of the pihole</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"status\": \"disabled\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "server/routes/api.js",
    "groupTitle": "Status",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidRequest",
            "description": "<p>The request is malformed</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>The requester is not authorized to access this endpoint</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidRequest Response:",
          "content": "HTTP/1.1 400 Invalid Request\n{\n  \"error\":{\n    \"code\":400,\n    \"message\":\"Bad Request\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "NotAuthorized Response:",
          "content": "HTTP/1.1 401 Not Authorized\n{\n  \"error\":{\n    \"code\":401,\n    \"message\":\"Not authorized\"\n  }\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/api/enable/",
    "title": "Enable Pihole",
    "name": "Enables_the_Pi_Hole",
    "group": "Status",
    "version": "1.0.0",
    "permission": [
      {
        "name": "admin",
        "title": "AdminUser",
        "description": "<p>A logged in user</p>"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>the status of the pihole</p>"
          }
        ]
      }
    },
    "filename": "server/routes/api.js",
    "groupTitle": "Status",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidRequest",
            "description": "<p>The request is malformed</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>The requester is not authorized to access this endpoint</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidRequest Response:",
          "content": "HTTP/1.1 400 Invalid Request\n{\n  \"error\":{\n    \"code\":400,\n    \"message\":\"Bad Request\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "NotAuthorized Response:",
          "content": "HTTP/1.1 401 Not Authorized\n{\n  \"error\":{\n    \"code\":401,\n    \"message\":\"Not authorized\"\n  }\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/api/status/",
    "title": "Gets the status of the pihole",
    "name": "Get_Pihole_Status",
    "group": "Status",
    "version": "1.0.0",
    "permission": [
      {
        "name": "admin",
        "title": "AdminUser",
        "description": "<p>A logged in user</p>"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "temperature",
            "description": "<p>Temperature of the pi or false if couldn't be retrieved</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>Status of the pi or false if couldn't be retrieved</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "memory",
            "description": "<p>Memory usage in percent of the pi or false if couldn't be retrieved</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"temperature\": \"21.32\",\n  \"memory\": 0.242,\n  \"status\":\"active\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "server/routes/api.js",
    "groupTitle": "Status",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidRequest",
            "description": "<p>The request is malformed</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>The requester is not authorized to access this endpoint</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidRequest Response:",
          "content": "HTTP/1.1 400 Invalid Request\n{\n  \"error\":{\n    \"code\":400,\n    \"message\":\"Bad Request\"\n  }\n}",
          "type": "json"
        },
        {
          "title": "NotAuthorized Response:",
          "content": "HTTP/1.1 401 Not Authorized\n{\n  \"error\":{\n    \"code\":401,\n    \"message\":\"Not authorized\"\n  }\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/api/taillog/",
    "title": "Opens an eventsource stream that tails the log file",
    "name": "GetTaillog",
    "group": "Taillog",
    "version": "1.0.0",
    "permission": [
      {
        "name": "admin",
        "title": "AdminUser",
        "description": "<p>A logged in user</p>"
      }
    ],
    "filename": "server/routes/api.js",
    "groupTitle": "Taillog",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>The requester is not authorized to access this endpoint</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "NotAuthorized Response:",
          "content": "HTTP/1.1 401 Not Authorized\n{\n  \"error\":{\n    \"code\":401,\n    \"message\":\"Not authorized\"\n  }\n}",
          "type": "json"
        }
      ]
    }
  }
] });
