
var vlc_paths = {
    darwin: '/Applications/VLC 3.app/Contents/MacOS/VLC',
    win32: 'C:/Program Files/VideoLAN/VLC/vlc.exe',
    linux: '/usr/bin/vlc'
}

if (Object.keys(vlc_paths).indexOf(process.platform) === -1) {
    console.error(`Error: platform '${process.platform}' unknown. Please add path to config.js file`);
    process.exit(1);
}

var config = {
    server_port: 3111,
    chromecast_ip: '192.168.86.36',
    path_to_vlc: vlc_paths[process.platform],
    back_to_page: false,
    back_to_end: true,
    kill_vlc_on_exit: true

}


exports.config = config
