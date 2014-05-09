var express = require("express");
var http = require("http");
var mime = require("mime");
var bodyParser = require('body-parser');
var torrentStream = require('torrent-stream');
var fs = require('fs');
var opensubtitles = require("opensubtitles-client");
var app = express();
app.use(bodyParser());
app.use(express.static(__dirname + '/'));






/*  TORRENT STREAMING  */
app.post('/watch',function(req,res){
	var url = req.body.torrent;
	var indexOfMovie;
	if(url=="close"){
		res.sendfile('index.html');
		engine.remove();
		console.log("page closed");
	}else{
		var engine = torrentStream(url,{
			path: 'tmp'
		});
		
		engine.on('ready', function() {
			engine.remove();
			engine.files.forEach(function(file) {
				var lookresult = mime.lookup(file.name);
				console.log('filename:', file.name);
				if(lookresult=="video/x-matroska"||lookresult=="video/mp4"||lookresult=="video/x-msvideo"||lookresult=="audio/mpeg"||lookresult=="video/x-ms-wmv"){
					var data = engine.files;
					var index = data.map(function(d) { return d['name']; }).indexOf(file.name);
					indexOfMovie = index;
					res.sendfile('cinema.html');
				}else{
					return false;
				}
			});

	
			var server = http.createServer(function(req, res) {
					if(url!="close"){
						server.on("listening", function () { server.close(); });
						var file = engine.files[indexOfMovie];
						res.setHeader('Content-Length', file.length);
						file.createReadStream().pipe(res);
					}
			});
			server.listen('2020');
			
		});	
	}
	engine.on('download', function(index) {
		console.log("download - " + index);
	});
	engine.on('upload', function(index, offset, length) {
		console.log("upload - " + index);
	});
	engine.on('error',function(err,info){
		console.log(err,info);
	});
});
app.get('/watch', function(req,res){
	res.sendfile('cinema.html');
});
/* END OF TORRENT STREAMING  */




// TODO - Add shows compatibility
app.post("/shows", function(req, res) {
	var showname = req.body.showname;
	var showseason = req.body.showseason;
	var showepisode = req.body.showepisode;
	var showsearcher = require('showsearcher');
	showsearcher({name: showname,season: showseason, episode:showepisode, quality: '720p'}, function(err, result){ if(!err){res.json(result); }else{ console.log(err);}});

});











/* STARTING THE WEBSERVER */
/* serves main page */
app.get("/", function(req, res) {
	res.sendfile('index.html');
	engine.remove();
	console.log("page closed");
});
/* serves all the static files */
app.get(/^(.+)$/, function(req, res){ 
	res.sendfile( __dirname + req.params[0]); 
});
var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});
/* END OF WEBSERVER */
















/*

var readTorrent = require('read-torrent');
	readTorrent(uri, function(err, torrent) {
		try{
			console.log('info hash: '+torrent.infoHash);
			console.log('created:   '+torrent.created);
			console.log('pieces:    '+torrent.pieces.length);
			console.log('name:      '+torrent.name);
			console.log('files:     '+torrent.files[0].name+ ' ('+torrent.files[0].length+')');
			for (var i = 1; i < torrent.files.length; i++) {
				console.log('           '+torrent.files[i].name+ ' ('+torrent.files[i].length+')');
			}
			console.log('trackers:  '+torrent.announce[0]);
			for (var i = 1; i < torrent.announce.length; i++) {
				console.log('           '+torrent.announce[i]);
			}
		}
		catch(err){
			console.log('No info available');
		}
	});	
*/


