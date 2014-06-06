var express = require("express");
var http = require("http");
var unzip = require('unzip');
var mime = require("mime");
var bodyParser = require('body-parser');
var torrentStream = require('torrent-stream');
var fs = require('fs');
var opensubtitles = require("opensubtitles-client");
var clivas = require('clivas');
var request = require('request');
var cheerio = require('cheerio');
var Datastore = require('nedb');

var app = express();
app.use(express.static(__dirname + '/'));
app.use(bodyParser());
var movie=[];
var webport = 5000;
var mediaport = 2020;



/*  TORRENT STREAMING  */
app.post('/watch',function(req,res){
	var url = req.body.torrent;
	var hotswaps = 0;
	var indexOfMovie;
	var videos =[];
	var engine = torrentStream(url,{
		path: 'tmp'
	});
	engine.disconnect('127.0.0.1:'+mediaport);	
	engine.on('ready', function() {
		engine.files.forEach(function(file) {
			var lookresult = mime.lookup(file.name);
			//console.log('filename:', file.name, ' - ' , file.length);
			if(lookresult=="video/x-matroska"||lookresult=="video/mp4"||lookresult=="video/x-msvideo"||lookresult=="audio/mpeg"||lookresult=="video/x-ms-wmv"){
				var data = engine.files;
				var index = data.map(function(d) { return d['name']; }).indexOf(file.name);
				videos.push(engine.files[index].length);
				res.sendfile('cinema.html');
				indexOfMovie = data.map(function(d) { return d['length']; }).indexOf(Math.max.apply(Math, videos));
			}else{
				return false;
			}
		});


		var server = http.createServer(function(req, res) {
			server.on("listening", function () { server.close(); });
			var file = engine.files[indexOfMovie];
			res.setHeader('Content-Length', file.length);
			file.createReadStream().pipe(res);
			// Get subtitle - Buggy
			opensubtitles.api.login().done(function(token){
				var lang ="eng";
				var text =file.name;
				opensubtitles.api.search(token, lang, text).done(function(results){
					var zipFile = 'sub-'+lang+'.zip';
					/* fs.unlink('subtitle.srt');
					var file = fs.createWriteStream(zipFile);
					var request = http.get(results[0].ZipDownloadLink, function(response){
						response.pipe(file);
						var extract = fs.createReadStream(zipFile).pipe(unzip.Extract({ path: __dirname }));
						extract.on('finish', function(){
							// Rename Subtitle
							var files_ = [];
							if (typeof files_ == 'undefined') files=[];
							var files = fs.readdirSync(__dirname);
							for(var i in files){
								if (!files.hasOwnProperty(i)) continue;
								var name = files[i];
								if (fs.statSync(name).isDirectory()){
								}else if(lookresult=="text/x-nfo" || lookresult=="text/plain"){
									fs.unlink(name);
								}else if(name!="subtitle.srt"){
									files_.push(name);
								}
								var lookresult = mime.lookup(name);
								if(lookresult=="application/x-subrip" && name!="subtitle.srt"){
									fs.rename(name, 'subtitle.srt', function (err) {
									  if (err){
										throw err;
									}else{
										fs.unlink(zipFile);
										console.log('Renamed!');
										var present = 1;
									}
									});		
								}
							}
						});						
					});
					  */
				
					app.get("/subs", function(req, res) {
						res.json(results);
					});
				});
			});
		});
		server.listen(mediaport);
		console.log("\n");
		clivas.line('VLC Stream available on {green:http://127.0.0.1:' + mediaport + '}');
		clivas.line('Online player is available at {green:http://127.0.0.1:' + webport + '/watch}');
		clivas.line('JSON Subtitles available at {green:http://127.0.0.1:' + webport + '/subs}');
		console.log("\n");
	});
	engine.on('download', function(index) {	
	});
	engine.on('upload', function(index, offset, length) {
	});
	engine.on('error',function(err,info){
		console.log(err,info);
	});
	engine.on('hotswap', function() {
		hotswaps++;
	});
	engine.on('uninterested', function() {
		engine.swarm.pause();
	});
	engine.on('interested',   function() {
		engine.swarm.resume();
	});
});
app.get('/watch', function(req,res){
	res.sendfile('cinema.html');
					
});
/* END OF TORRENT STREAMING  */


/* STARTING THE WEBSERVER */
/* serves main page */
app.get("/", function(req, res) {
	res.sendfile('index.html');
});
app.get("/database", function(req, res) {
	var db = new Datastore({ filename: 'database.json' });
	db.loadDatabase(function (err) {
		var atowatchid = req.query.towatch;
		if(atowatchid!=null){
			db.find({imdbID:atowatchid}, function (err, docs) {
			console.log(docs.length);
				if(docs.length==0){
					var movie = {imdbID: atowatchid,status:'towatch'};
					db.insert(movie, function (err, newMovie) {});
				}else{
					db.update({ imdbID: atowatchid }, { $set: { status: 'towatch' } }, { multi: true }, function (err, numReplaced) {
						console.log(numReplaced);
					});
				}
			});
		}
		var awatchedid = req.query.watched;
		if(awatchedid!=null){
			db.find({imdbID:awatchedid}, function (err, docs) {
			console.log(docs.length);
				if(docs.length==0){
					var movie = {imdbID: awatchedid,status:'watched'};
					db.insert(movie, function (err, newMovie) {});
				}else{
					db.update({ imdbID: awatchedid }, { $set: { status: 'watched' } }, { multi: true }, function (err, numReplaced) {
						console.log(numReplaced);
					});
				}
			});
		}
		var rtoremoveid = req.query.toremove;
		if(rtoremoveid!=null){
			db.remove({ imdbID: rtoremoveid}, {}, function (err, numRemoved) {console.log(numRemoved);});
		}
		db.find({}, function (err, docs) {
			res.send(docs);
		});
	});
});
// Search Results from KAT
app.get("/p/:category/:page",function(req,res){
	torrents=[];
	var url = 'http://katmirror.com/'+req.param("category")+'/'+req.param("page")+'/';
	request(url, function (error, response, html){
		  if (!error && response.statusCode == 200){
			var $ = cheerio.load(html);
			$(".turnoverButton").parent().each(function(i, element){
				var count = $(this).find(".turnoverButton").last().text();
				torrents.push({pagesCount:count});
			});
			var temp = [];
			var $ = cheerio.load(html);
			$('tr').each(function(i, element){
			  var id = $(this).attr("id");
			  var name = $(this).find("td:nth-child(1) > div:nth-child(2) > div > a").text();
			  var katLink = "https://kickass.to" + $(this).find("td:nth-child(1) > div:nth-child(2) > div > a").attr("href");
			  var torrentLink = $(this).find("td:nth-child(1) > div:nth-child(1) > a").eq(-1).attr("href");
			  var magnetLink = $(this).find("td:nth-child(1) > div:nth-child(1) > a").eq(-2).attr("href");
			  var seeders = $(this).find("td:nth-child(5)").text();
			  var leechers = $(this).find("td:nth-child(6)").text();
			  var fileCount = $(this).find("td:nth-child(3)").text();
			  var age = $(this).find("td:nth-child(4)").text();
			  var size = $(this).find("td:nth-child(2)").text();
			  temp.push({id:id,name:name,katLink:katLink,magnetLink:magnetLink,torrentLink:torrentLink,seeders:seeders,leechers:leechers,size:size,age:age,fileCount:fileCount});
			});
			temp.splice(0,1);
			temp.splice(0,1);
			torrents = torrents.concat(temp);
			res.send(torrents);
		 }
	});
});
// Start server
var port = process.env.PORT || webport;
app.listen(port, function() {
	clivas.line('Website available on: {green:http://127.0.0.1:' + port+'}');
});
/* END OF WEBSERVER */



/*

// TODO - Add shows compatibility
app.post("/shows", function(req, res) {
	var showname = req.body.showname;
	var showseason = req.body.showseason;
	var showepisode = req.body.showepisode;
	var showsearcher = require('showsearcher');
	showsearcher({name: showname,season: showseason, episode:showepisode, quality: '720p'}, function(err, result){ if(!err){res.json(result); }else{ console.log(err);}});

});

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
/* serves all the static files 
app.get(/^(.+)$/, function(req, res){ 
	try{
		res.sendfile( __dirname + req.params[0]);
	}catch(err){
		
	}
});
*/

