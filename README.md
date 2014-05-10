#Meatra

Your hub for media via streaming!

##Usage

1. Prepare
	* Place all the files of this repo in a folder
	* Open command prompt in the folder ( so that it says `C:/users/user/folder-with-contents>` )
	* Do `npm install`
	*After that is done type `node app`
2. Use front-end website
	* Go to http://localhost:5000 ( or another port if changed )
	* Search for a movie you'd like to watch and click on it
	* Wait a couple of seconds ( or a minute if your internet is not so fast )
3. Watch
	* The player will open, if it doesn't show anything after about a minute but it says download - aNumber then try to go to localhost:5000/cinema.html
	* If you like watching it in VLC open a stream in VLC to http://127.0.0.1:2020

##Screenshot(s)

![alt text](http://oi58.tinypic.com/micpx1.jpg "Main Interface")

![alt text](http://oi60.tinypic.com/20z73mo.jpg "Other search results")

##Important issues

- After you watched a movie you need to stop the app.js file and start it over to watch a new movie
- Downloads with multiple video files do not work sometimes
- The in-browser player only supports MP4 format

##TODO List

- Use a better API for getting movie information
- Add shows function
