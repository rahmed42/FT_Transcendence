<script lang="ts">
	// Fetch DB / or get theses default values if not found
	let selectedBoard: string = 'src/lib/assets/boards/boardDefault.png';
	let selectedMyPaddle: string = 'src/lib/assets/paddles/defaultPaddle/defaultPaddleWhite.png';
	let selectedOpponentPaddle: string =
		'src/lib/assets/paddles/defaultPaddle/defaultPaddleWhite.png';
	let selectedBall: string = 'src/lib/assets/balls/ballWhite.png';
	const serverIP = import.meta.env.VITE_SERVER_IP;

	function getCookie(name: string) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) {
			return parts.pop()?.split(';').shift();
		}
	}

	let myCookie = getCookie('jwt');

	async function applySettings() {
		await fetch('http://' + serverIP + ':3333/profil/skins', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + myCookie,
			},
			body: JSON.stringify({
				board: selectedBoard,
				myPaddle: selectedMyPaddle,
				opponentPaddle: selectedOpponentPaddle,
				ball: selectedBall
			})
		});
	}
</script>

<svelte:head>
	<title>Config</title>
	<meta name="description" content="Game CONFIG" />
</svelte:head>

<div class="text-column">
	<h1>Game configuration</h1>
	<table class="select-table">
		<tr>
			<th>Board</th>
			<th>My paddle</th>
			<th>Opponent paddle</th>
			<th>Ball</th>
		</tr>
		<tr>
			<th>
				<select bind:value={selectedBoard}>
					<option value="src/lib/assets/boards/boardDefault.png">Default</option>
					<option value="src/lib/assets/boards/boardDefaultGrey.png">Default Grey</option>
					<option value="src/lib/assets/boards/boardModern.png">Modern</option>
					<option value="src/lib/assets/boards/boardModernGrey.png">Modern Grey</option>
				</select>
			</th>
			<th>
				<select bind:value={selectedMyPaddle}>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleWhite.png"
						>Original Paddle White</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleBlack.png"
						>Original Paddle Black</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleBlue.png"
						>Original Paddle Blue</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleCyan.png"
						>Original Paddle Cyan</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleGreen.png"
						>Original Paddle Green</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleGrey.png"
						>Original Paddle Grey</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleLightBlue.png"
						>Original Paddle LightBlue</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleOrange.png"
						>Original Paddle Orange</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddlePink.png"
						>Original Paddle Pink</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleRed.png"
						>Original Paddle Red</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleYellow.png"
						>Original Paddle Yellow</option
					>
					<option value="src/lib/assets/paddles/myPaddle/mypaddleWhite.png"
						>Modern Paddle White</option
					>
					<option value="src/lib/assets/paddles/myPaddle/mypaddleBlack.png"
						>Modern Paddle Black</option
					>
					<option value="src/lib/assets/paddles/myPaddle/mypaddleBlue.png"
						>Modern Paddle Blue</option
					>
					<option value="src/lib/assets/paddles/myPaddle/mypaddleCyan.png"
						>Modern Paddle Cyan</option
					>
					<option value="src/lib/assets/paddles/myPaddle/mypaddleGreen.png"
						>Modern Paddle Green</option
					>
					<option value="src/lib/assets/paddles/myPaddle/mypaddleGrey.png"
						>Modern Paddle Grey</option
					>
					<option value="src/lib/assets/paddles/myPaddle/mypaddleLightBlue.png"
						>Modern Paddle LightBlue</option
					>
					<option value="src/lib/assets/paddles/myPaddle/mypaddleOrange.png"
						>Modern Paddle Orange</option
					>
					<option value="src/lib/assets/paddles/myPaddle/mypaddlePink.png"
						>Modern Paddle Pink</option
					>
					<option value="src/lib/assets/paddles/myPaddle/mypaddleRed.png">Modern Paddle Red</option>
					<option value="src/lib/assets/paddles/myPaddle/mypaddleYellow.png"
						>Modern Paddle Yellow</option
					>
				</select>
			</th>
			<th>
				<select bind:value={selectedOpponentPaddle}>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleWhite.png"
						>Original Paddle White</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleBlack.png"
						>Original Paddle Black</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleBlue.png"
						>Original Paddle Blue</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleCyan.png"
						>Original Paddle Cyan</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleGreen.png"
						>Original Paddle Green</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleGrey.png"
						>Original Paddle Grey</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleLightBlue.png"
						>Original Paddle LightBlue</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleOrange.png"
						>Original Paddle Orange</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddlePink.png"
						>Original Paddle Pink</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleRed.png"
						>Original Paddle Red</option
					>
					<option value="src/lib/assets/paddles/defaultPaddle/defaultPaddleYellow.png"
						>Original Paddle Yellow</option
					>
					<option value="src/lib/assets/paddles/otherPaddle/otherpaddleWhite.png"
						>Modern Paddle White</option
					>
					<option value="src/lib/assets/paddles/otherPaddle/otherpaddleBlack.png"
						>Modern Paddle Black</option
					>
					<option value="src/lib/assets/paddles/otherPaddle/otherpaddleBlue.png"
						>Modern Paddle Blue</option
					>
					<option value="src/lib/assets/paddles/otherPaddle/otherpaddleCyan.png"
						>Modern Paddle Cyan</option
					>
					<option value="src/lib/assets/paddles/otherPaddle/otherpaddleGreen.png"
						>Modern Paddle Green</option
					>
					<option value="src/lib/assets/paddles/otherPaddle/otherpaddleGrey.png"
						>Modern Paddle Grey</option
					>
					<option value="src/lib/assets/paddles/otherPaddle/otherpaddleLightBlue.png"
						>Modern Paddle LightBlue</option
					>
					<option value="src/lib/assets/paddles/otherPaddle/otherpaddleOrange.png"
						>Modern Paddle Orange</option
					>
					<option value="src/lib/assets/paddles/otherPaddle/otherpaddlePink.png"
						>Modern Paddle Pink</option
					>
					<option value="src/lib/assets/paddles/otherPaddle/otherpaddleRed.png"
						>Modern Paddle Red</option
					>
					<option value="src/lib/assets/paddles/otherPaddle/otherpaddleYellow.png"
						>Modern Paddle Yellow</option
					>
				</select>
			</th>
			<th>
				<select bind:value={selectedBall}>
					<option value="src/lib/assets/balls/ballWhite.png">White</option>
					<option value="src/lib/assets/balls/ballBlack.png">Black</option>
					<option value="src/lib/assets/balls/ballBlue.png">Blue</option>
					<option value="src/lib/assets/balls/ballCyan.png">Cyan</option>
					<option value="src/lib/assets/balls/ballGreen.png">Green</option>
					<option value="src/lib/assets/balls/ballGrey.png">Grey</option>
					<option value="src/lib/assets/balls/ballPink.png">Pink</option>
					<option value="src/lib/assets/balls/ballRed.png">Red</option>
					<option value="src/lib/assets/balls/ballYellow.png">Yellow</option>
					<option value="src/lib/assets/balls/ballGold.png">Gold</option>
					<option value="src/lib/assets/balls/ballRedLined.png">RedLined</option>
					<option value="src/lib/assets/balls/ballRedReflect.png">RedReflect</option>
					<option value="src/lib/assets/balls/ballBaseball.png">Baseball</option>
					<option value="src/lib/assets/balls/ballGolf.png">Golf</option>
					<option value="src/lib/assets/balls/ballBasket.png">Basket</option>
					<option value="src/lib/assets/balls/ballBeach.png">Beach</option>
					<option value="src/lib/assets/balls/ballTennis.png">Tennis</option>
					<option value="src/lib/assets/balls/ballRahmed.png">rahmed</option>
				</select>
			</th>
		</tr>
	</table>
	<br />
	<button on:click={applySettings} class="apply-button">Save</button>
	<div class="game-preview">
		<!-- Image preview of the game -->
		<img class="board" src={selectedBoard} alt="Game preview" />
		<img class="my-paddle" src={selectedMyPaddle} alt="Game preview" />
		<img class="opponent-paddle" src={selectedOpponentPaddle} alt="Game preview" />
		<img class="ball" src={selectedBall} alt="Game preview" />
	</div>
</div>

<style>
	.text-column {
		text-align: center;
	}

	.select-table {
		width: 100%;
		text-align: center;
		font-size: 24px;
	}

	.apply-button {
		/* font-family:"Comic Sans MS"; */
		padding: 10px 10px;
		background-color: #007fff;
		color: white;
		border-radius: 75px;
		font-size: 24px;
		cursor: pointer;
		transition: background-color 0.2s ease;
		width: 200px;
		/* center button */
		margin-left: auto;
		margin-right: auto;
	}

	.apply-button:hover {
		background-color: #100050;
	}

	.game-preview {
		position: relative;
		width: 800px;
		height: 600px;
		border: 2px solid rgb(88, 44, 231);
		border-radius: 25px;
		margin-top: 30px;
	}

	.board {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.my-paddle {
		position: absolute;
		top: 50%;
		left: 10px;
		transform: translateY(-50%);
	}

	.opponent-paddle {
		position: absolute;
		top: 50%;
		right: 10px;
		transform: translateY(-50%);
	}

	.ball {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
