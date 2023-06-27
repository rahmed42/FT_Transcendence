const serverIP = import.meta.env.VITE_SERVER_IP;

export const BACKEND_URL = (window.location.href.indexOf(serverIP) === -1)
	? `${window.location.protocol.replace("http", "ws")}//${window.location.hostname}${(window.location.port && `:${window.location.port}`)}`
	: "ws://" + serverIP + ":2567"

export const BACKEND_HTTP_URL = BACKEND_URL.replace("ws", "http");
