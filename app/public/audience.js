const streamPlayer = document.getElementById('player');
const startEndButton = document.getElementById('streamStartEnd');

let player;
let watchingStream = false;
console.log('JAKDJNNNADKMNWJKADHNJKADNKDN');

const watchStream = async (streamPlayerId, username) => {
  try {
    console.log('HELLOOOOOO')
    // const response = await fetch('http://localhost:5000/twilio-live/audienceToken', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // });
    const response = await fetch('http://localhost:5000/twilio-live/audienceToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          playerStreamerId: streamPlayerId
        })
    });

    const data = await response.json();

    if (data.message) {
      alert(data.message);
      return;
    }

    player = await Twilio.Live.Player.connect(data.token, {
      playerWasmAssetsPath: '../livePlayer',
    });
    player.play();
    streamPlayer.appendChild(player.videoElement);

    watchingStream = true;
    startEndButton.innerHTML = 'leave stream';
    startEndButton.classList.replace('bg-green-500', 'bg-red-500');
    startEndButton.classList.replace('hover:bg-green-500', 'hover:bg-red-700');
  } catch (error) {
    console.log(error);
    alert('Unable to connect to livestream');
  }
};

const leaveStream = () => {
  player.disconnect();
  watchingStream = false;
  startEndButton.innerHTML = 'watch stream';
  startEndButton.classList.replace('bg-red-500', 'bg-green-500');
  startEndButton.classList.replace('hover:bg-red-500', 'hover:bg-green-700');
};

const watchOrLeaveStream = async (event) => {
  event.preventDefault();
  if (!watchingStream) {
    const streamId = event.target.getAttribute('sid');
    const username = event.target.getAttribute('username');
    await watchStream(streamId, username);
  } else {
    leaveStream();
  }
};

startEndButton.addEventListener('click', watchOrLeaveStream);
