var http	      = require( 'http' );
var express 	  = require( 'express' );
var httpServer 	  = express();
var HTTP_WEB_PORT = 3150;

httpServer.use( express.static( __dirname + '/public' ) );
http.createServer( httpServer ).listen( HTTP_WEB_PORT );
