'use strict';

exports.render = function(req, res) {
    res.render('index', {
        user: req.user ? JSON.stringify(req.user) : 'null'
    });
};

exports.main = function(req, res) {
  res.render('leaflet', {
    //stuff    
  });
};

exports.panel = function(req, res) {
 res.send("hello");
};