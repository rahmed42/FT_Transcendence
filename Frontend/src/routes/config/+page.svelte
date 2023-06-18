<script lang="ts">
	// Import boards
	import boardDefault from '$lib/assets/boards/boardDefault.png';
	import boardModern from '$lib/assets/boards/boardModern.png';

	// Import balls
	import ballBaseball from '$lib/assets/balls/ballBaseball.png';
	import ballBasket from '$lib/assets/balls/ballBasket.png';
	import ballBeach from '$lib/assets/balls/ballBeach.png';
	import ballBlack from '$lib/assets/balls/ballBlack.png';
	import ballBlue from '$lib/assets/balls/ballBlue.png';
	import ballCyan from '$lib/assets/balls/ballCyan.png';
	import ballFoot from '$lib/assets/balls/ballFoot.png';
	import ballGold from '$lib/assets/balls/ballGold.png';
	import ballGolf from '$lib/assets/balls/ballGolf.png';
	import ballGreen from '$lib/assets/balls/ballGreen.png';
	import ballGrey from '$lib/assets/balls/ballGrey.png';
	import ballPink from '$lib/assets/balls/ballPink.png';
	import ballRahmed from '$lib/assets/balls/ballRahmed.png';
	import ballRed from '$lib/assets/balls/ballRed.png';
	import ballRedLined from '$lib/assets/balls/ballRedLined.png';
	import ballReflect from '$lib/assets/balls/ballReflect.png';
	import ballTennis from '$lib/assets/balls/ballTennis.png';
	import ballWhite from '$lib/assets/balls/ballWhite.png';
	import ballYellow from '$lib/assets/balls/ballYellow.png';

	// Import paddles
	// Default paddles
	import defaultPaddleBlack from '$lib/assets/paddles/defaultPaddle/defaultPaddleBlack.png';
	import defaultPaddleBlue from '$lib/assets/paddles/defaultPaddle/defaultPaddleBlue.png';
	import defaultPaddleCyan from '$lib/assets/paddles/defaultPaddle/defaultPaddleCyan.png';
	import defaultPaddleGreen from '$lib/assets/paddles/defaultPaddle/defaultPaddleGreen.png';
	import defaultPaddleGrey from '$lib/assets/paddles/defaultPaddle/defaultPaddleGrey.png';
	import defaultPaddleLightBlue from '$lib/assets/paddles/defaultPaddle/defaultPaddleLightBlue.png';
	import defaultPaddleOrange from '$lib/assets/paddles/defaultPaddle/defaultPaddleOrange.png';
	import defaultPaddlePink from '$lib/assets/paddles/defaultPaddle/defaultPaddlePink.png';
	import defaultPaddleRed from '$lib/assets/paddles/defaultPaddle/defaultPaddleRed.png';
	import defaultPaddleWhite from '$lib/assets/paddles/defaultPaddle/defaultPaddleWhite.png';
	import defaultPaddleYellow from '$lib/assets/paddles/defaultPaddle/defaultPaddleYellow.png';

	// My paddles
	import myPaddleBlack from '$lib/assets/paddles/myPaddle/mypaddleBlack.png';
	import myPaddleBlue from '$lib/assets/paddles/myPaddle/mypaddleBlue.png';
	import myPaddleCyan from '$lib/assets/paddles/myPaddle/mypaddleCyan.png';
	import myPaddleGreen from '$lib/assets/paddles/myPaddle/mypaddleGreen.png';
	import myPaddleGrey from '$lib/assets/paddles/myPaddle/mypaddleGrey.png';
	import myPaddleLightBlue from '$lib/assets/paddles/myPaddle/mypaddleLightBlue.png';
	import myPaddleOrange from '$lib/assets/paddles/myPaddle/mypaddleOrange.png';
	import myPaddlePink from '$lib/assets/paddles/myPaddle/mypaddlePink.png';
	import myPaddleRed from '$lib/assets/paddles/myPaddle/mypaddleRed.png';
	import myPaddleWhite from '$lib/assets/paddles/myPaddle/mypaddleWhite.png';
	import myPaddleYellow from '$lib/assets/paddles/myPaddle/mypaddleYellow.png';

	// Opponent paddles
	import otherPaddleBlack from '$lib/assets/paddles/otherPaddle/otherpaddleBlack.png';
	import otherPaddleBlue from '$lib/assets/paddles/otherPaddle/otherpaddleBlue.png';
	import otherPaddleCyan from '$lib/assets/paddles/otherPaddle/otherpaddleCyan.png';
	import otherPaddleGreen from '$lib/assets/paddles/otherPaddle/otherpaddleGreen.png';
	import otherPaddleGrey from '$lib/assets/paddles/otherPaddle/otherpaddleGrey.png';
	import otherPaddleLightBlue from '$lib/assets/paddles/otherPaddle/otherpaddleLightBlue.png';
	import otherPaddleOrange from '$lib/assets/paddles/otherPaddle/otherpaddleOrange.png';
	import otherPaddlePink from '$lib/assets/paddles/otherPaddle/otherpaddlePink.png';
	import otherPaddleRed from '$lib/assets/paddles/otherPaddle/otherpaddleRed.png';
	import otherPaddleWhite from '$lib/assets/paddles/otherPaddle/otherpaddleWhite.png';
	import otherPaddleYellow from '$lib/assets/paddles/otherPaddle/otherpaddleYellow.png';

	// Fetch from DB / or get theses default values if not found
	let selectedBoard = boardDefault;
	let selectedBall = ballWhite;
	let selectedMyPaddle = defaultPaddleWhite;
	let selectedOpponentPaddle = defaultPaddleWhite;

	function applySettings() {
		console.log('Send config to DB');
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
					<option value="boardDefault">Default</option>
					<option value="boardModern">Modern</option>
				</select>
			</th>
			<th>
				<select bind:value={selectedMyPaddle}>
					<option value="defaultPaddleWhite">defaultPaddleWhite</option>
					<option value="myPaddleWhite">myPaddleWhite</option>
				</select>
			</th>
			<th>
				<select bind:value={selectedOpponentPaddle}>
					<option value="defaultPaddleWhite">defaultPaddleWhite</option>
					<option value="otherPaddleWhite">otherPaddleWhite</option>
				</select>
			</th>
			<th>
				<select bind:value={selectedBall}>
					<option value="ballWhite">ballWhite</option>
					<option value="ballBeach">ballBeach</option>
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
		border: 10px solid rgb(88, 44, 231);
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
