console.log("Sakuryn loaded.");

let currentIndex = -1;
let currentSongs = [];
let audio = null;

// TEMP TEST
function sayHi() {
	alert("Hello from Sakuryn!");
}

// CHOOSE FOLDER AND LOAD REAL SONGS
async function chooseFolder() {
	const folderPath = await window.sakurynAPI.chooseFolder();
	if (!folderPath) {
		alert("No folder selected.");
		return;
	}

	const files = await window.sakurynAPI.readFolder(folderPath);

	const songs = files
		.filter((name) => name.toLowerCase().endsWith(".mp3"))
		.map((name) => ({
			title: name.replace(".mp3", ""),
			filePath: `${folderPath}/${name}`,
		}));

	if (songs.length === 0) {
		alert("No MP3 files found in this folder.");
		return;
	}

	localStorage.setItem("savedFolder", folderPath);

	currentSongs = songs;
	displaySongs(songs);
}

// DISPLAY SONGS
function displaySongs(songList) {
	const mainDiv = document.querySelector(".main");

	mainDiv.innerHTML = `
        <h1>Library</h1>
        <p>Showing ${songList.length} songs</p>
        <div id="songs-container"></div>
    `;

	const container = document.getElementById("songs-container");

	songList.forEach((song, index) => {
		const div = document.createElement("div");
		div.className = "song-item";
		div.innerHTML = `
            <div class="song-title">${song.title}</div>
        `;
		div.onclick = () => playSong(index);
		container.appendChild(div);
	});
}

// FORMAT TIME
function formatTime(seconds) {
	seconds = Math.floor(seconds);
	let mins = Math.floor(seconds / 60);
	let secs = seconds % 60;
	if (secs < 10) secs = "0" + secs;
	return `${mins}:${secs}`;
}

// PLAY SONG
function playSong(index) {
	currentIndex = index;
	const song = currentSongs[index];

	audio = document.getElementById("audio-player");
	audio.src = song.filePath;

	// Apply volume immediately
	audio.volume = document.getElementById("volume-bar").value / 100;

	audio.play();

	document.getElementById("now-playing").textContent = `Playing: ${song.title}`;

	audio.onloadedmetadata = () => {
		document.getElementById("total-time").textContent = formatTime(
			audio.duration
		);
	};

	audio.ontimeupdate = () => {
		document.getElementById("current-time").textContent = formatTime(
			audio.currentTime
		);

		document.getElementById("seek-bar").value =
			(audio.currentTime / audio.duration) * 100;
	};

	audio.onended = () => nextSong();
}

// NEXT / PREVIOUS
function nextSong() {
	if (currentSongs.length === 0) return;

	currentIndex++;
	if (currentIndex >= currentSongs.length) currentIndex = 0;

	playSong(currentIndex);
}

function prevSong() {
	if (currentSongs.length === 0) return;

	currentIndex--;
	if (currentIndex < 0) currentIndex = currentSongs.length - 1;

	playSong(currentIndex);
}

// PLAY/PAUSE
function togglePlay() {
	if (!audio) return;

	if (audio.paused) audio.play();
	else audio.pause();
}

// DOM CONTENT LOADED
// AUTOLOAD SAVED LIBRARY
const savedFolder = localStorage.getItem("savedFolder");
if (savedFolder) {
	window.sakurynAPI.readFolder(savedFolder).then((files) => {
		const songs = files
			.filter((name) => name.toLowerCase().endsWith(".mp3"))
			.map((name) => ({
				title: name.replace(".mp3", ""),
				filePath: `${savedFolder}/${name}`,
			}));

		currentSongs = songs;
		displaySongs(songs);
	});
}

function clearLibrary() {
	localStorage.removeItem("savedFolder");
	currentSongs = [];
	document.querySelector(".main").innerHTML =
		"<h1>Welcome to Sakuryn</h1><p>No library loaded.</p>";
}

document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM Loaded.");

	const seekBar = document.getElementById("seek-bar");
	const volumeBar = document.getElementById("volume-bar");

	// VOLUME
	volumeBar.addEventListener("input", () => {
		if (!audio) return;
		audio.volume = volumeBar.value / 100;
	});

	// DRAG SEEK
	seekBar.addEventListener("input", () => {
		if (!audio) return;
		audio.currentTime = (audio.duration * seekBar.value) / 100;
	});

	// CLICK SEEK
	seekBar.addEventListener("mousedown", (event) => {
		if (!audio) return;
		const rect = seekBar.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const percent = clickX / rect.width;
		audio.currentTime = percent * audio.duration;
		seekBar.value = percent * 100;
	});
});
