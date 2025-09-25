import { ref } from 'vue';

const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const host = window.location.host;
const SOCKET_URL = `${protocol}://${host}/api/ws`;

export const socket = ref<WebSocket | null>(null);

function connectSocket(userLogin: string) {
	if (socket.value && socket.value.readyState === WebSocket.OPEN) {
		return;
	}

	const newSocket = new WebSocket(SOCKET_URL);

	newSocket.addEventListener('open', () => {
		console.log('Connecte au serveur WebSocket !');
		socket.value = newSocket;

		const registerMessage = {
			event: 'register',
			payload: userLogin
		};
		newSocket.send(JSON.stringify(registerMessage));
	});

	newSocket.addEventListener('close', () => {
		console.log('Deconnecte du serveur WebSocket.');
		socket.value = null;
	});

	newSocket.addEventListener('error', (error) => {
		console.error('Erreur WebSocket:', error);
	});
}

function disconnectSocket() {
	if (socket.value) {
		socket.value.close();
	}
}

export { connectSocket, disconnectSocket };