'use strict';

let co = require('co');
let scraper = require('../../utils/scrapers');
let models = require('../../models');
let logger = require('../../utils/logger');

module.exports = function(target, date) {
  return co(function *() {
    let d;
    if (date) {
      d = new Date(date);
      if (isNaN(d.valueOf())) {
        logger.error('Invalid Date: %s', date);
        return;
      }
    } else {
      // yesterday if empty
      d = new Date;
      d.setDate(d.getDate() - 1);
    }
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    switch (target) {
      case 'win':
        yield updateWinRanking(d);
    }
  });
};

function updateWinRanking(date) {
  return co(function *() {
    // get ranking
    let rankings = yield getWinRankingWithDate(date);
    // get servant map to convert servant id
    let map = yield getServantMap();

    let data = [];
    for (let r of rankings) {
      data.push({
        date: date,
        servant_id: map[r.tribe][Number(r.id)],
        seq: r.seq,
        rank: r.rank,
        rate: r.score
      });
    }

    if (!data) {
      logger.error('Ranking Data is Nothing');
      return;
    }

    // delete
    logger.info('Delete Ranking: date = %s', date+'');
    yield deleteWinRanking({date: date});

    // insert
    logger.info('Insert Ranking');
    for (let d of data) {
      yield insertWinRanking(d);
    }
  });
}

function getServantMap(args) {
  return co(function *() {
    let servants = yield models.servant.find({}).exec();
    let map = {};
    for (let servant of servants) {
      let tribeName = getTribeName(servant.tribe_id);
      if (!map[tribeName]) {
        map[tribeName] = {};
      }
      map[tribeName][servant.tribe_code] = servant._id;
    }
    return map;
  });
}

function getTribeName(tribeId) {
  return [, 'bst', 'hly', 'dvl', 'sea', 'und'][tribeId];
}

function deleteWinRanking(args) {
  return models.servantwinranking.remove(args).exec();
}

function insertWinRanking(args) {
  return models.servantwinranking.update(args, args, {upsert: true}).exec();
}

function getWinRankingWithDate(date) {
  return co(function *() {
    let body = (yield scraper.fetchServantWinRanking(date)).body;
    return JSON.parse(body.match(/^\w+\((.*)\);$/i)[1]);
  });
}