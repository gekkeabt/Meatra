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
	* Look/Search for a movie you'd like to watch and click on it
	* Wait a couple of seconds ( or a minute if your internet is not so fast )
3. Watch
	* The player will open, if it doesn't show anything after about a minute but it says download - aNumber then try to go to localhost:5000/cinema.html
	* If you like watching it in VLC open a stream in VLC to http://127.0.0.1:2020
4. Subtitles
	* After the app is ready for streaming you can visit http://127.0.0.1:5050/subs to see a json array of available subtitles corresponding with the movie title
	* Download the subtitle and add it to VLC

##Screenshot(s)

![Alt text](/screenshots/1.png?raw=true "Main Interface")
![Alt text](/screenshots/2.png?raw=true "Search by menu results")
![Alt text](/screenshots/3.png?raw=true "Search bar/Manual torrent streamer/To Watch/Watched")
![Alt text](/screenshots/4.png?raw=true "Search results")

##Important issues

- After you watched a movie you need to stop the app.js file and start it over to watch a new movie
- The in-browser player only supports MP4 format

##TODO List

- Add shows function
