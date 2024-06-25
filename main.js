const TURN_TOKEN_ID = '<YOUR_TOKEN>';
const API_TOKEN = '<YOUR_API_TOKEN>';

document.getElementById('connect')?.addEventListener('click', async () => {
    const generate_api = `https://rtc.live.cloudflare.com/v1/turn/keys/${TURN_TOKEN_ID}/credentials/generate`;
    const response = await fetch(generate_api, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ttl: 60 * 10
        }),
    });

    const {username, credential, urls} = (await response.json()).iceServers;
    const iceServers = urls.map(url => ({urls: url, username, credential}));

    const configuration = {iceServers, iceTransportPolicy: 'relay'};

    const offer = new RTCPeerConnection(configuration);
    const answer = new RTCPeerConnection(configuration);

    answer.ondatachannel = event => {
        const channel = event.channel;
        channel.onmessage = event => console.log('answer: ', event.data);
    };
    const dc = offer.createDataChannel('chat');

    await offer.setLocalDescription(await offer.createOffer());
    await new Promise(resolve => {
        offer.oniceconnectionstatechange = () => {
            if (offer.iceConnectionState === 'connected') {
                resolve();
            }
        };
        offer.onicecandidate = ({candidate}) => {
            if (candidate === null) resolve();
        };
    });
    await answer.setRemoteDescription(offer.localDescription);
    await answer.setLocalDescription(await answer.createAnswer());
    await new Promise(resolve => {
        answer.oniceconnectionstatechange = () => {
            if (answer.iceConnectionState === 'connected') {
                resolve();
            }
        };
        answer.onicecandidate = ({candidate}) => {
            if (candidate === null) resolve();
        };
    });
    await offer.setRemoteDescription(answer.localDescription);

    await new Promise(resolve => {
        dc.onopen = () => {
            if (dc.readyState === 'open') resolve();
        };
        if (dc.readyState === 'open') resolve();
    });

    dc.send('hello');
});