/**
 * MINI-GAMES: Tile Match, Riddles, Tofu Hunter
 * ─────────────────────────────────────────────────────────────
 * Three mini-games for Level 1 hotspots
 */

// ─── Game Help Text Configuration ─────────────────────────────
export const GAME_HELP_TEXT = {
	'🎴 Tile Match': {
		title: 'Memory Challenge',
		instruction: 'Match all pairs of symbols by flipping tiles! Remember where each symbol is and match them before you run out of moves. Click tiles to flip them and find matching pairs.'
	},
	'🖼️ Photo Match': {
		title: 'Photo Memory',
		instruction: 'Match all pairs of faces by flipping tiles! Remember who is where and find every matching pair before you run out of moves.'
	},
	'❓ Riddle Challenge': {
		title: 'Test Your Knowledge',
		instruction: 'Answer the riddle before time runs out! Read the question carefully and choose the correct answer. Be quick - you only have a limited amount of time!'
	},
	'🎮 Tofu Hunter': {
		title: 'Catch the Tofu',
		instruction: 'Click the moving tofu blocks to collect points! Be fast and accurate. Try to catch as many as possible before time runs out. Each tofu is worth points!'
	}
};

// ═══════════════════════════════════════════════════════════════
// TILE MATCH GAME
// ═══════════════════════════════════════════════════════════════
export class TileMatchGame {
	constructor() {
		this.container = null;
		this.onComplete = null;
		this.grid = [];
		this.flipped = [];
		this.matched = 0;
		this.totalPairs = 8; // 4x4 grid = 16 tiles = 8 pairs
		this.moves = 0;
		this.maxMoves = 20;
		this.symbols = ['🌸', '🌺', '🌻', '🌼', '🌷', '🥀', '🪷', '🌹'];
	}

	getTitle() {
		return '🎴 Tile Match';
	}

	init(container, onComplete) {
		this.container = container;
		this.onComplete = onComplete;

		// Create game UI
		container.innerHTML = `
			<div class="tile-match-game">
				<div class="game-info">
					<span>Moves: <span id="tile-moves">0</span> / ${this.maxMoves}</span>
				</div>
				<div class="tile-grid" id="tile-grid"></div>
			</div>
		`;

		this.initGrid();
	}

	initGrid() {
		// Create pairs
		const cards = [];
		this.symbols.forEach(symbol => {
			cards.push({ symbol, id: Math.random() });
			cards.push({ symbol, id: Math.random() });
		});

		// Shuffle
		cards.sort(() => Math.random() - 0.5);
		this.grid = cards;

		// Render
		const gridEl = document.getElementById('tile-grid');
		cards.forEach((card, index) => {
			const tile = document.createElement('div');
			tile.className = 'tile';
			tile.dataset.index = index;
			tile.innerHTML = `
				<div class="tile-inner">
					<div class="tile-front">?</div>
					<div class="tile-back">${card.symbol}</div>
				</div>
			`;

			tile.addEventListener('click', () => this.onTileClick(index));
			gridEl.appendChild(tile);
		});
	}

	onTileClick(index) {
		const tile = this.container.querySelector(`[data-index="${index}"]`);

		// Ignore if already flipped or matched
		if (tile.classList.contains('flipped') || tile.classList.contains('matched')) {
			return;
		}

		// Ignore if 2 tiles already flipped
		if (this.flipped.length >= 2) {
			return;
		}

		// Flip tile
		tile.classList.add('flipped');
		this.flipped.push(index);

		// Check for match when 2 tiles flipped
		if (this.flipped.length === 2) {
			this.moves++;
			document.getElementById('tile-moves').textContent = this.moves;

			setTimeout(() => this.checkMatch(), 800);
		}
	}

	checkMatch() {
		const [idx1, idx2] = this.flipped;
		const tile1 = this.container.querySelector(`[data-index="${idx1}"]`);
		const tile2 = this.container.querySelector(`[data-index="${idx2}"]`);

		const card1 = this.grid[idx1];
		const card2 = this.grid[idx2];

		if (card1.symbol === card2.symbol) {
			// Match!
			tile1.classList.add('matched');
			tile2.classList.add('matched');
			this.matched++;

			// Check win
			if (this.matched === this.totalPairs) {
				setTimeout(() => this.win(), 500);
			}
		} else {
			// No match - flip back
			tile1.classList.remove('flipped');
			tile2.classList.remove('flipped');
		}

		this.flipped = [];

		// Check loss
		if (this.moves >= this.maxMoves && this.matched < this.totalPairs) {
			setTimeout(() => this.lose(), 500);
		}
	}

	win() {
		if (this.onComplete) this.onComplete(true);
	}

	lose() {
		if (this.onComplete) this.onComplete(false);
	}

	destroy() {
		// Cleanup
	}
}

// ═══════════════════════════════════════════════════════════════
// RIDDLE GAME
// ═══════════════════════════════════════════════════════════════
export class RiddleGame {
	constructor() {
		this.container = null;
		this.onComplete = null;
		this.riddles = [
			{
				question: "What is the traditional Sri Lankan New Year sweetmeat made with treacle and coconut?",
				answers: ["Kokis", "Kavum", "Athirasa", "Aggala"],
				correct: 1
			},
			{
				question: "Which festival marks the Sinhala and Tamil New Year?",
				answers: ["Vesak", "Avurudu", "Poson", "Deepavali"],
				correct: 1
			},
			{
				question: "What grows but never walks, has a bed but never sleeps?",
				answers: ["A river", "A plant", "A mountain", "A cloud"],
				correct: 0
			},
			{
				question: "What has keys but no locks, space but no room?",
				answers: ["A piano", "A keyboard", "A map", "A book"],
				correct: 1
			},
			{
				question: "I'm tall when I'm young, and short when I'm old. What am I?",
				answers: ["A tree", "A candle", "A pencil", "A shadow"],
				correct: 1
			},
			{
				question: "The Asian Koel is known for its distinctive call during which season?",
				answers: ["Winter", "Monsoon", "Spring", "Summer"],
				correct: 2
			},
			{
				question: "What has hands but cannot clap?",
				answers: ["A statue", "A clock", "A puppet", "A snowman"],
				correct: 1
			},
			{
				question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
				answers: ["The letter M", "Time", "A heartbeat", "The sun"],
				correct: 0
			},
			{
				question: "What traditional game is played during Avurudu celebrations?",
				answers: ["Kite flying", "Pillow fighting", "Climbing greasy pole", "All of the above"],
				correct: 3
			},
			{
				question: "What can travel around the world while staying in one corner?",
				answers: ["A stamp", "A flag", "A compass", "A map"],
				correct: 0
			}
		];

		this.currentRiddle = null;
		this.timeLeft = 30;
		this.timer = null;
	}

	getTitle() {
		return '❓ Riddle Challenge';
	}

	init(container, onComplete) {
		this.container = container;
		this.onComplete = onComplete;

		// Pick random riddle
		this.currentRiddle = this.riddles[Math.floor(Math.random() * this.riddles.length)];

		// Create UI
		container.innerHTML = `
			<div class="riddle-game">
				<div class="riddle-timer">
					Time: <span id="riddle-time">30</span>s
				</div>
				<div class="riddle-question">${this.currentRiddle.question}</div>
				<div class="riddle-answers" id="riddle-answers"></div>
			</div>
		`;

		// Render answers
		const answersEl = document.getElementById('riddle-answers');
		this.currentRiddle.answers.forEach((answer, index) => {
			const btn = document.createElement('button');
			btn.className = 'riddle-answer-btn';
			btn.textContent = answer;
			btn.addEventListener('click', () => this.onAnswerClick(index));
			answersEl.appendChild(btn);
		});

		// Start timer
		this.startTimer();
	}

	startTimer() {
		this.timer = setInterval(() => {
			this.timeLeft--;
			document.getElementById('riddle-time').textContent = this.timeLeft;

			if (this.timeLeft <= 0) {
				this.stopTimer();
				this.lose();
			}
		}, 1000);
	}

	stopTimer() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	onAnswerClick(index) {
		this.stopTimer();

		// Disable all buttons
		const buttons = this.container.querySelectorAll('.riddle-answer-btn');
		buttons.forEach(btn => btn.disabled = true);

		if (index === this.currentRiddle.correct) {
			// Correct!
			buttons[index].classList.add('correct');
			setTimeout(() => this.win(), 1000);
		} else {
			// Wrong
			buttons[index].classList.add('wrong');
			buttons[this.currentRiddle.correct].classList.add('correct');
			setTimeout(() => this.lose(), 1500);
		}
	}

	win() {
		if (this.onComplete) this.onComplete(true);
	}

	lose() {
		if (this.onComplete) this.onComplete(false);
	}

	destroy() {
		this.stopTimer();
	}
}

// ═══════════════════════════════════════════════════════════════
// TOFU HUNTER GAME
// ═══════════════════════════════════════════════════════════════
export class TofuHunterGame {
	constructor() {
		this.container = null;
		this.onComplete = null;
		this.score = 0;
		this.targetScore = 50;
		this.timeLeft = 45;
		this.timer = null;
		this.gameLoop = null;
		this.basket = { x: 50, width: 15 };
		this.fallingObjects = [];
		this.spawnInterval = null;
	}

	getTitle() {
		return '🎮 Tofu Hunter';
	}

	init(container, onComplete) {
		this.container = container;
		this.onComplete = onComplete;

		// Create UI
		container.innerHTML = `
			<div class="tofu-hunter-game">
				<div class="game-stats">
					<span>Score: <span id="tofu-score">0</span> / ${this.targetScore}</span>
					<span>Time: <span id="tofu-time">45</span>s</span>
				</div>
				<div class="tofu-play-area" id="tofu-play-area">
					<div class="tofu-basket" id="tofu-basket"></div>
				</div>
				<div class="tofu-controls">
					Use ← → arrow keys or click/drag to move
				</div>
			</div>
		`;

		this.initGame();
	}

	initGame() {
		// Start timer
		this.startTimer();

		// Start object spawning
		this.startSpawning();

		// Start game loop
		this.startGameLoop();

		// Input handlers
		document.addEventListener('keydown', this.handleKeydown);

		// Mouse/touch controls
		const playArea = document.getElementById('tofu-play-area');
		playArea.addEventListener('mousemove', this.handleMouseMove);
		playArea.addEventListener('touchmove', this.handleTouchMove);
	}

	startTimer = () => {
		this.timer = setInterval(() => {
			this.timeLeft--;
			document.getElementById('tofu-time').textContent = this.timeLeft;

			if (this.timeLeft <= 0) {
				this.endGame();
			}
		}, 1000);
	}

	startSpawning = () => {
		this.spawnInterval = setInterval(() => {
			this.spawnObject();
		}, 800); // Spawn every 800ms
	}

	spawnObject = () => {
		const isCoin = Math.random() > 0.3; // 70% coins, 30% crows
		const x = 5 + Math.random() * 90; // Random x position (5-95%)

		const obj = {
			type: isCoin ? 'coin' : 'crow',
			x: x,
			y: 0,
			speed: 1 + Math.random() * 1.5, // Speed in % per frame
			element: null
		};

		// Create DOM element
		const el = document.createElement('div');
		el.className = `tofu-falling ${obj.type}`;
		el.style.left = `${obj.x}%`;
		el.style.top = '0%';
		el.textContent = isCoin ? '💰' : '🦅';

		document.getElementById('tofu-play-area').appendChild(el);
		obj.element = el;

		this.fallingObjects.push(obj);
	}

	startGameLoop = () => {
		const update = () => {
			this.updateGame();
			if (this.gameLoop !== null) {
				this.gameLoop = requestAnimationFrame(update);
			}
		};
		this.gameLoop = requestAnimationFrame(update);
	}

	updateGame = () => {
		const basketEl = document.getElementById('tofu-basket');
		const basketRect = basketEl?.getBoundingClientRect();

		// Update falling objects
		this.fallingObjects = this.fallingObjects.filter(obj => {
			obj.y += obj.speed;
			obj.element.style.top = `${obj.y}%`;

			// Check collision with basket
			if (obj.y >= 85 && obj.y <= 95) {
				const objRect = obj.element.getBoundingClientRect();

				if (basketRect &&
					objRect.left < basketRect.right &&
					objRect.right > basketRect.left) {
					// Collision!
					this.onCatch(obj.type);
					obj.element.remove();
					return false; // Remove from array
				}
			}

			// Remove if off screen
			if (obj.y > 100) {
				obj.element.remove();
				return false;
			}

			return true;
		});

		// Update score display
		document.getElementById('tofu-score').textContent = this.score;

		// Check win condition
		if (this.score >= this.targetScore) {
			this.endGame(true);
		}
	}

	onCatch = (type) => {
		if (type === 'coin') {
			this.score += 5;
		} else if (type === 'crow') {
			this.score = Math.max(0, this.score - 10);
		}
	}

	handleKeydown = (e) => {
		if (e.key === 'ArrowLeft') {
			this.basket.x = Math.max(0, this.basket.x - 5);
			this.updateBasketPosition();
		} else if (e.key === 'ArrowRight') {
			this.basket.x = Math.min(100 - this.basket.width, this.basket.x + 5);
			this.updateBasketPosition();
		}
	}

	handleMouseMove = (e) => {
		const playArea = document.getElementById('tofu-play-area');
		const rect = playArea.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		this.basket.x = Math.max(0, Math.min(100 - this.basket.width, x - this.basket.width / 2));
		this.updateBasketPosition();
	}

	handleTouchMove = (e) => {
		e.preventDefault();
		const touch = e.touches[0];
		const playArea = document.getElementById('tofu-play-area');
		const rect = playArea.getBoundingClientRect();
		const x = ((touch.clientX - rect.left) / rect.width) * 100;
		this.basket.x = Math.max(0, Math.min(100 - this.basket.width, x - this.basket.width / 2));
		this.updateBasketPosition();
	}

	updateBasketPosition = () => {
		const basketEl = document.getElementById('tofu-basket');
		if (basketEl) {
			basketEl.style.left = `${this.basket.x}%`;
		}
	}

	endGame = (won = false) => {
		// Stop everything
		if (this.timer) clearInterval(this.timer);
		if (this.spawnInterval) clearInterval(this.spawnInterval);
		if (this.gameLoop !== null) {
			cancelAnimationFrame(this.gameLoop);
			this.gameLoop = null;
		}

		// Determine win/lose
		const finalWon = won || this.score >= this.targetScore;

		setTimeout(() => {
			if (this.onComplete) this.onComplete(finalWon);
		}, 500);
	}

	destroy() {
		// Cleanup
		if (this.timer) clearInterval(this.timer);
		if (this.spawnInterval) clearInterval(this.spawnInterval);
		if (this.gameLoop !== null) {
			cancelAnimationFrame(this.gameLoop);
			this.gameLoop = null;
		}

		// Remove event listeners
		document.removeEventListener('keydown', this.handleKeydown);
	}
}

// ═══════════════════════════════════════════════════════════════
// PHOTO TILE MATCH GAME (larger grid using people images)
// ═══════════════════════════════════════════════════════════════

/**
 * List of images from the people folder.
 * Replace placeholder filenames with your actual photos.
 * 10 images → 5×4 grid (20 tiles, 10 pairs).
 */
const PEOPLE_IMAGES = [
	'assets/images/people/akhila.png',
	'assets/images/people/ali.jpg',
	'assets/images/people/aruni.jpg',
	'assets/images/people/avindya.jpg',
	'assets/images/people/aviska.jpg',
	'assets/images/people/chamathka.jpg',
	'assets/images/people/harshani.png',
	'assets/images/people/idusha.jpg',
	'assets/images/people/inuri.jpg',
	'assets/images/people/ishrah.jpg',
];

export class PhotoTileMatchGame {
	constructor() {
		this.container = null;
		this.onComplete = null;
		this.grid = [];
		this.flipped = [];
		this.matched = 0;
		this.totalPairs = PEOPLE_IMAGES.length; // 10 unique images = 10 pairs to match
		this.moves = 0;
		this.maxMoves = 30; // more tiles → more allowed moves
		this.images = [...PEOPLE_IMAGES];
	}

	getTitle() {
		return '🖼️ Photo Match';
	}

	init(container, onComplete) {
		this.container = container;
		this.onComplete = onComplete;

		container.innerHTML = `
			<div class="tile-match-game photo-tile-match-game">
				<div class="game-info">
					<span>Moves: <span id="tile-moves">0</span> / ${this.maxMoves}</span>
				</div>
				<div class="tile-grid photo-tile-grid" id="tile-grid"></div>
			</div>
		`;

		this.initGrid();
	}

	initGrid() {
		// Create pairs — one card per image × 2
		const cards = [];
		this.images.forEach(src => {
			cards.push({ src, id: Math.random() });
			cards.push({ src, id: Math.random() });
		});

		// Shuffle using Fisher-Yates for unbiased randomisation
		for (let i = cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[cards[i], cards[j]] = [cards[j], cards[i]];
		}
		this.grid = cards;

		const gridEl = document.getElementById('tile-grid');
		cards.forEach((card, index) => {
			const tile = document.createElement('div');
			tile.className = 'tile photo-tile';
			tile.dataset.index = index;
			tile.innerHTML = `
				<div class="tile-inner">
					<div class="tile-front">?</div>
					<div class="tile-back"><img src="${card.src}" alt="person" class="photo-tile-img" /></div>
				</div>
			`;

			tile.addEventListener('click', () => this.onTileClick(index));
			gridEl.appendChild(tile);
		});
	}

	onTileClick(index) {
		const tile = this.container.querySelector(`[data-index="${index}"]`);

		if (tile.classList.contains('flipped') || tile.classList.contains('matched')) {
			return;
		}

		if (this.flipped.length >= 2) {
			return;
		}

		tile.classList.add('flipped');
		this.flipped.push(index);

		if (this.flipped.length === 2) {
			this.moves++;
			document.getElementById('tile-moves').textContent = this.moves;
			setTimeout(() => this.checkMatch(), 900);
		}
	}

	checkMatch() {
		const [idx1, idx2] = this.flipped;
		const tile1 = this.container.querySelector(`[data-index="${idx1}"]`);
		const tile2 = this.container.querySelector(`[data-index="${idx2}"]`);

		const card1 = this.grid[idx1];
		const card2 = this.grid[idx2];

		if (card1.src === card2.src) {
			tile1.classList.add('matched');
			tile2.classList.add('matched');
			this.matched++;

			if (this.matched === this.totalPairs) {
				setTimeout(() => this.win(), 500);
			}
		} else {
			tile1.classList.remove('flipped');
			tile2.classList.remove('flipped');
		}

		this.flipped = [];

		if (this.moves >= this.maxMoves && this.matched < this.totalPairs) {
			setTimeout(() => this.lose(), 500);
		}
	}

	win() {
		if (this.onComplete) this.onComplete(true);
	}

	lose() {
		if (this.onComplete) this.onComplete(false);
	}

	destroy() {
		// Cleanup
	}
}
