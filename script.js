let currentsong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "invalid input";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const minutesStr = String(minutes).padStart(2, '0')
    const secondsStr = String(remainingSeconds).padStart(2, '0');

    return `${minutesStr}:${secondsStr}`;
}


async function getsongs(folder) {
    currfolder = folder;
    let song = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await song.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li>
        <img class="invert" src="img/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Artist</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="img/play.svg" alt="">
        </div>
    </li>`;

    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs;
}
const playmusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00.00 / 00.00"
}
async function displayall() {
    let song = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await song.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchor);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[1]
            let song = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await song.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="playbtn">
                <img src="img/playbtn.svg" alt="">
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
        })
    })
}

async function main() {

    await getsongs("songs/all")
    playmusic(songs[0], true)

    displayall()

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"

        }
    })
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentsong.currentTime = ((currentsong.duration) * (e.offsetX / e.target.getBoundingClientRect().width) * 100) / 100;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })
    nextsong.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index + 1) < (songs.length)) {
            playmusic(songs[index + 1])
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100
    })
}
main()