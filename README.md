# Usage

Run `yarn` or `npm install` to install stuff in `node_modules`.

Edit the `config.js` file to specifiy the IP address of the Chromecast you want to cast to.

To start the program, run `node index.js` or `yarn start` or `npm start`

Add the contents of `bookmarklet.js` to a bookmarklet called 'Cast' or whatever you want. A bookmarklet is a normal bookmark but instead of a URL it contains a snippet of Javascript that does something.

Go to a YouTube video and click the 'Cast' bookmarklet to launch VLC.

# Configuration

In `config.js` you can set the various used in casting content.

`server_port`: The port the server is listening on. You can change it, but make sure to change the bookmarklet too.

`chromecast_ip`: The IP address of the Chromecast you want to cast to

`path_to_vlc`: The path to VLC 3. Note: this changes from platform to platform. Edit `vlc_paths` if you need to point it to a different location under the platform you are using.

`back_to_page`: After casting is started, return to the Youtube page or not.

`back_to_end`: If `back_to_page` is enabled, try and go to he end of the video or not

`kill_vlc_on_exit`: Try and kill any launched VLC 3 instances before exiting