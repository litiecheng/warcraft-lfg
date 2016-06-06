"use strict";

//Load dependencies
var request = require("request");
var async = require("async");
var applicationStorage = process.require("core/applicationStorage.js");

/**
 * Return the guild rank
 * @param region
 * @param realm
 * @param name
 * @param callback
 */
module.exports.getRank = function(tier,region,realm,name,callback){
    var endUrl = "ranks/"+tier+"/"+region+"/"+realm+"/"+name;
    this.request(endUrl, function (error, result) {
        callback(error, result);
    });
};

/**
 * Return the guild progress
 * @param region
 * @param realm
 * @param name
 * @param callback
 */
module.exports.getProgress = function(tier,region,realm,name,callback){
    var endUrl = "guilds/"+tier+"/"+region+"/"+realm+"/"+name;
    this.request(endUrl, function (error, result) {
        callback(error, result && result.progress && result.progress['tier_18']);
    });
};

/**
 * Request an URL and return result
 * @param url
 * @param callback
 */
module.exports.request = function (endUrl, callback) {
    var logger = applicationStorage.logger;

    var url = encodeURI("http://progress.warcraftlfg.com/api/v1/" + endUrl);

    logger.debug('GET Progress API : %s', url);

    request.get({method: "GET", uri: url, gzip: true}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(null, JSON.parse(body));
        } else if (!error) {
            logger.warn("Error HTTP " + response.statusCode + " on fetching progress api " + url);
            error = new Error("PROGRESS_HTTP_ERROR");
            error.statusCode = response.statusCode;
            callback(error);
        }
        else {
            callback(error);
        }
    });
};