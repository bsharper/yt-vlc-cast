const appname = 'LocalCast'
const http = require('http')
const url = require('url')
const port = 3111
const log = require('debug')(appname)
const spawn = require('child_process').spawn
const rl = require('readline');

var config = require('./config').config;

const url_re = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/

var activeInstance = false;
var request_count = 0;



process.on('SIGINT', function() {
    if (config.kill_vlc_on_exit) killVLC();
    process.exit();
  });

function killVLC() {
    try {
        activeInstance.kill();
        activeInstance = false;
    } catch (err) {
        log(err);
    }

}

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

function standardizeYoutubeURL(durl) {
    var ytid = youtube_parser(durl);
    return `https://www.youtube.com/watch?v=${ytid}`;
}

function youtubeThumbnailPage(durl) {
    var sid = youtube_parser(durl);
    //var filenames = ['hqdefault.jpg', '0.jpg', '1.jpg', '2.jpg', '3.jpg'];
    var filenames = ['hqdefault.jpg'];
    var txt = `<h3>Now playing ${standardizeYoutubeURL(durl)}</h3>`;
    filenames.forEach(fn => {
        txt += `<img src="https://img.youtube.com/vi/${sid}/${fn}"><br>`
    })
    var outer = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>VLC cast</title>
      </head>
      <body>
        ${txt}
      </body>
    </html>`
    
    return outer;
}

function runCast(curl, st) {
    
    if (activeInstance) killVLC();

    var nurl = standardizeYoutubeURL(curl);
    log('Standardized YT URL: %s', nurl);
  
    var prog = config.path_to_vlc;
    args = [nurl, '--demux-filter=demux_chromecast', `--sout=#chromecast{ip=${config.chromecast_ip}}`]
    if (st > -1) {
        args.push(`--start-time=${st}`);
    }
    console.log(prog + ' ' + args.join(' '))
    var p = spawn(prog , args, {
         detached: true,
         stdio: ['pipe', 'pipe', 'pipe']
    });
    activeInstance = p;
    p.on('close', (code, signal) => {
        console.log('closed: ' + code);
    })
    p.on('error', err => {
        console.log(`process error: ${err}`);
    })
    var stderr = rl.createInterface({input: p.stderr});
    stderr.on('line', line => {
        console.log(line);
    })
    var stdout = rl.createInterface({input: p.stdout});
    stdout.on('line', line => {
        console.log(line);
    })

}


function parseURL(lurl) {
    var purl = url.parse(lurl)
    var kvs = new URLSearchParams(purl.query)
    var ar = Array.from(kvs.keys())
    if (ar.indexOf('b64url') === -1) return;
    var v = kvs.get('b64url');
    try {
        var fv = Buffer.from(v, 'base64');
        var durl = fv.toString('utf8').trim();
        if (url_re.test(durl)) {
            log(`This is a valid URL: ${durl}`);
            var st = -1;
            var et = -1;
            if (ar.indexOf('st') > -1) {
                st = kvs.get('st');
                log('Got start time: %s', st);
            }
            if (ar.indexOf('et') > -1) {
                et = parseInt(kvs.get('et'));
                log('Got end time: %s', et);
            }
            setTimeout(() => {
                runCast(durl, st);
            }, 0);
            if (config.back_to_end && et > -1) {
                return standardizeYoutubeURL(durl) + `&t=${et-2}`
            }
            return durl;
            
        } else log('Value passed in to b64url was not a valid URL'); 
        return false;

    } catch (e) {
        log(e);
        log('Value passed in to b64url was not a valid URL');
    }
    return false;
}

const requestHandler = (request, response) => {
    var durl = parseURL(request.url);
    log('Action URL is %s', durl)
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    
    request_count++;
    log(`Request number ${request_count} from IP ${ip}`)
    response.writeHead(200, { 'Content-Type': 'text/html'});
    if (! durl) {
        response.end('<h2>Error parsing referring page</h2>');
    } else {
        if (config.back_to_page) {
            response.end(`<script>window.location.href="${durl}"</script>`);
        } else {
            response.end(youtubeThumbnailPage(durl));
        }
    }
    
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.error('something bad happened', err)
    process.exit(1);
  }

  console.log(`[ ${appname} ] started, listening on ${port}`)
})



