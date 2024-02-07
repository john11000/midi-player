const params = new URLSearchParams(window.location.search);
const query = params.get('mid');

async function getBase64Midi() {
    const url = 'https://composer-music-python-services.vercel.app/admin/music/list/uuid/' + query;
    const responseApi = await fetch(url);
    const data = await responseApi.json();
    return data.data[0].midi_data
}

var midiUpdate = function(time) {
    console.log(time);
}
var midiStop = function() {
    console.log("Stop");
}

async function startPlaying() {
    const midi = await getBase64Midi();
    const song = `data:audio/midi;base64,${midi}`;
    $("#player").midiPlayer.play(song);
}

$( document ).ready(function() {
    $("#player").midiPlayer({
        color: "red",
        onUpdate: midiUpdate,
        onStop: midiStop,
        width: 250
    });
});