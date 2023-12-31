var express = require("express");
var router = express.Router();
var url = require("url");
var config = require("../config");

const URL = "https://raw.githubusercontent.com";
const ORG = "jk-techsolutions";
const REPO = "master-data";
const BRANCH = "master";
const { asyncMiddleware } = require("../middlewares/asyncMiddleware");
const { throwError, sendResponse } = require("../utils");
const { httpRequest } = require("../api/request");
const { log } = require("console");
const { query } = require("../database");

// https://raw.githubusercontent.com/jk-techsolutions/master-data/raw/master/data/in/ka/test/sample.json
router.post(
  "/getLocalization",
  asyncMiddleware(async function (req, res, next) {
    var tenantId = req.query.tenantId;
    var module = req.query.module;
    var locale = req.query.locale;

    // if(!locResponse|| !locResponse?.messages || locResponse?.messages?.length==0){
    //   throwError("LOCALISATION NOT FOUND","LOCALISATION NOT FOUND",400)
    // }
    await query("SELECT * from company", (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        sendResponse(res, { searchResponse:response?.rows,count : response?.rows?.length }, req);

      }
    });

    // let messages={}
    // locResponse.messages.map(message=>{messages[message.code]=message.message})

    // let messages=locResponse.messages.map(message=>({code:message.code,message:message.message}))
   
  })
);

router.post(
  "/v1/_search",
  asyncMiddleware(async function (req, res, next) {
    // var module = req.query.module;
    // var master = req.query.master;
    const MdmsCriteria = req?.body?.MdmsCriteria;
    const { tenantId, moduleDetails } = MdmsCriteria;
    const { moduleName, masterDetails } = moduleDetails?.[0] || {};
    const { name } = masterDetails?.[0] || {};
    // const names = await httpRequest('https://raw.githubusercontent.com/jeanphorn/wordlist/master/usernames.txt',{},{});

    const mdmsResponse = await httpRequest(
      `${URL}/${ORG}/${REPO}/${BRANCH}/data/${tenantId?.replace(
        ".",
        "/"
      )}/${moduleName}/${name}.json`,
      {},
      {},
      "get"
    );
    const response = {};
    response[moduleName] = {
      [name]: mdmsResponse?.[name],
    };
    sendResponse(
      res,
      {
        MdmsRes: {
          ...response,
        },
      },
      req
    );
  })
);

module.exports = router;
