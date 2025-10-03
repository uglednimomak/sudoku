// Metal Sudoku Game Logic

class MetalSudoku {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.preFilledCells = Array(9).fill().map(() => Array(9).fill(false));
        this.selectedCell = null;
        this.selectedNumber = null;
        this.timer = 0;
        this.timerInterval = null;
        this.gameActive = false;
        this.difficulty = 3;

        // Difficulty settings (number of pre-filled cells)
        this.difficultySettings = {
            1: { name: 'Beginner', preFilled: 50 },
            2: { name: 'Easy', preFilled: 40 },
            3: { name: 'Medium', preFilled: 35 },
            4: { name: 'Hard', preFilled: 28 },
            5: { name: 'Expert', preFilled: 22 }
        };

        // Game history and user session
        this.gameHistory = [];
        this.userSession = null;
        this.currentUser = null;

        this.init();
    }
    
    async init() {
        this.createGrid();
        this.bindEvents();

        // Initialize user session
        await this.initializeSession();

        this.newGame();
        // Initialize displays if they exist
        if (document.getElementById('history-table-body')) {
            this.updateHistoryDisplay();
        }
        if (document.getElementById('fastest-times-body')) {
            this.updateLeaderboardsDisplay();
        }
    }
    
    createGrid() {
        const gridContainer = document.getElementById('sudoku-grid');
        gridContainer.innerHTML = '';
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.tabIndex = 0;
                cell.addEventListener('click', () => this.selectCell(row, col));
                gridContainer.appendChild(cell);
            }
        }
    }
    
    bindEvents() {
        // Difficulty selector
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = parseInt(e.target.value);
        });
        // New game button
        document.getElementById('new-game').addEventListener('click', () => {
            this.newGame();
        });

        // Reset game button
        document.getElementById('reset-game').addEventListener('click', () => {
            this.resetGame();
        });
        // Clear cell button
        document.getElementById('clear-cell').addEventListener('click', () => {
            this.clearSelectedCell();
        });
        // Check solution button
        document.getElementById('check-solution').addEventListener('click', () => {
            this.checkSolution();
        });
        // Hint button
        document.getElementById('hint-btn').addEventListener('click', () => {
            this.giveHint();
        });
        // Number pad buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const number = parseInt(e.target.dataset.number);
                this.selectNumber(number);
            });
        });
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive) return;
            if (!this.selectedCell) return;
            if (e.key >= '1' && e.key <= '9') {
                this.selectNumber(parseInt(e.key));
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                this.clearSelectedCell();
            } else if (e.key === 'ArrowUp') {
                this.moveSelection(-1, 0);
            } else if (e.key === 'ArrowDown') {
                this.moveSelection(1, 0);
            } else if (e.key === 'ArrowLeft') {
                this.moveSelection(0, -1);
            } else if (e.key === 'ArrowRight') {
                this.moveSelection(0, 1);
            }
        });
        // Modal events
        document.getElementById('play-again').addEventListener('click', () => {
            this.hideModal();
            this.newGame();
        });
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideModal();
        });

        // History toggle
        document.getElementById('toggle-history').addEventListener('click', () => {
            this.toggleHistory();
        });

        // Leaderboards toggle
        document.getElementById('toggle-leaderboards').addEventListener('click', () => {
            this.toggleLeaderboards();
        });

        // Leaderboard tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchLeaderboardTab(e.target.dataset.tab);
            });
        });

        // Username form
        const usernameForm = document.getElementById('username-form');
        if (usernameForm) {
            usernameForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registerUser();
            });
        }
    }
    
    moveSelection(dRow, dCol) {
        if (!this.selectedCell) return;
        let { row, col } = this.selectedCell;
        row += dRow;
        col += dCol;
        if (row >= 0 && row < 9 && col >= 0 && col < 9) {
            this.selectCell(row, col);
            const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cellElement.focus();
        }
    }
    
    newGame() {
        this.stopTimer();
        this.timer = 0;
        this.updateTimerDisplay();
        this.gameActive = true;
        this.selectedCell = null;
        // Generate new puzzle
        this.generatePuzzle();
        this.renderGrid();
        this.startTimer();
        this.updateStatus('Select a cell and enter a number');
    }

    resetGame() {
        if (!this.gameActive) return;

        this.stopTimer();
        this.timer = 0;
        this.updateTimerDisplay();
        this.selectedCell = null;

        // Reset grid to initial state (only pre-filled cells)
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (!this.preFilledCells[row][col]) {
                    this.grid[row][col] = 0;
                }
            }
        }

        this.renderGrid();
        this.startTimer();
        this.updateStatus('Game reset! Select a cell and enter a number');
    }
    
    generatePuzzle() {
        // Start with empty grids
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.preFilledCells = Array(9).fill().map(() => Array(9).fill(false));
        // Generate a complete valid solution
        this.fillGrid(this.solution);
        // Copy solution to grid
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.grid[i][j] = this.solution[i][j];
            }
        }
        // Remove numbers based on difficulty
        const cellsToRemove = 81 - this.difficultySettings[this.difficulty].preFilled;
        const initialCells = [];
        for (let row = 0; row < 9; row++)
            for (let col = 0; col < 9; col++)
                initialCells.push([row, col]);
        this.shuffleArray(initialCells);
        for (let i = 0; i < cellsToRemove && i < initialCells.length; i++) {
            const [row, col] = initialCells[i];
            this.grid[row][col] = 0;
            this.preFilledCells[row][col] = false;
        }
        for (let row = 0; row < 9; row++)
            for (let col = 0; col < 9; col++)
                if (this.grid[row][col] !== 0)
                    this.preFilledCells[row][col] = true;
    }
    
    fillGrid(grid) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    this.shuffleArray(numbers);
                    for (let num of numbers) {
                        if (this.isValidMove(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (this.fillGrid(grid)) {
                                return true;
                            }
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    isValidMove(grid, row, col, num) {
        // Check row
        for (let c = 0; c < 9; c++) {
            if (c !== col && grid[row][c] === num) return false;
        }
        // Check column
        for (let r = 0; r < 9; r++) {
            if (r !== row && grid[r][col] === num) return false;
        }
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && grid[r][c] === num) return false;
            }
        }
        return true;
    }
    
    selectCell(row, col) {
        if (!this.gameActive) return;
        // Remove previous selection
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('selected', 'highlight-same');
        });
        this.selectedCell = { row, col };
        // Highlight selected cell
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('selected');
        // Highlight cells with same number
        const cellValue = this.grid[row][col];
        if (cellValue !== 0) {
            document.querySelectorAll('.sudoku-cell').forEach(cell => {
                if (cell.textContent == cellValue) {
                    cell.classList.add('highlight-same');
                }
            });
        }
        cell.focus();
        this.updateStatus(`Selected cell (${row + 1}, ${col + 1})`);
    }
    
    selectNumber(number) {
        if (!this.selectedCell || !this.gameActive) return;
        const { row, col } = this.selectedCell;
        // Don't allow changing pre-filled numbers
        if (this.preFilledCells[row][col]) {
            this.updateStatus('Cannot modify pre-filled numbers');
            return;
        }
        // Remove previous number selection highlighting
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        // Highlight selected number
        document.querySelector(`[data-number="${number}"]`).classList.add('selected');
        this.selectedNumber = number;
        this.placeNumber(row, col, number);
    }
    
    placeNumber(row, col, number) {
        // Create a temporary grid to test the move
        const tempGrid = this.grid.map(row => [...row]);
        tempGrid[row][col] = number;
        
        // Check if the move is valid
        if (!this.isValidMove(tempGrid, row, col, number)) {
            // Invalid move - show error
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('error');
            this.updateStatus('Invalid move! Check for conflicts.');
            // Remove the invalid number after a short delay
            setTimeout(() => {
                cell.classList.remove('error');
            }, 700);
        } else {
            // Valid move - place the number
            this.grid[row][col] = number;
            this.renderGrid();
            this.updateStatus('Good move!');
            // Check for win condition
            if (this.isGridComplete()) {
                this.gameWon();
            }
        }
    }
    
    clearSelectedCell() {
        if (!this.selectedCell || !this.gameActive) return;
        const { row, col } = this.selectedCell;
        if (this.preFilledCells[row][col]) {
            this.updateStatus('Cannot clear pre-filled numbers');
            return;
        }
        this.grid[row][col] = 0;
        this.renderGrid();
        this.updateStatus('Cell cleared');
    }
    
    giveHint() {
        if (!this.selectedCell || !this.gameActive) return;
        const { row, col } = this.selectedCell;
        if (this.preFilledCells[row][col]) {
            this.updateStatus('This cell is already filled');
            return;
        }
        if (this.grid[row][col] !== 0) {
            this.updateStatus('Clear this cell first to get a hint');
            return;
        }
        // Place the correct number from solution
        const correctNumber = this.solution[row][col];
        this.grid[row][col] = correctNumber;
        this.renderGrid();
        this.updateStatus(`Hint: The correct number is ${correctNumber}`);
        // Check for win condition
        if (this.isGridComplete()) {
            this.gameWon();
        }
    }
    
    renderGrid() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const value = this.grid[row][col];
                cell.textContent = value === 0 ? '' : value;
                cell.classList.remove('error'); // Clear any error states
                if (this.preFilledCells[row][col]) {
                    cell.classList.add('pre-filled');
                } else {
                    cell.classList.remove('pre-filled');
                }
            }
        }
    }
    
    isGridComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) return false;
                if (this.grid[row][col] !== this.solution[row][col]) return false;
            }
        }
        return true;
    }
    
    checkSolution() {
        if (!this.gameActive) return;
        let hasErrors = false;
        // Clear previous errors
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('error');
        });
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] !== 0) {
                    // Create temp grid to test this cell
                    const tempGrid = this.grid.map(row => [...row]);
                    tempGrid[row][col] = 0; // Temporarily remove this number
                    if (!this.isValidMove(tempGrid, row, col, this.grid[row][col])) {
                        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                        cell.classList.add('error');
                        hasErrors = true;
                    }
                }
            }
        }
        this.updateStatus(hasErrors ? 'Errors found! Check highlighted cells.' : 'No errors found! Keep going!');
    }
    
    gameWon() {
        this.gameActive = false;
        this.stopTimer();

        // Save game to history
        const gameRecord = this.addGameToHistory(this.timer, this.difficulty);

        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.add('victory-animation');
        });
        document.getElementById('final-time').textContent = this.formatTime(this.timer);

        // Update modal with score information
        const scoreElement = document.getElementById('final-score');
        if (scoreElement) {
            scoreElement.textContent = gameRecord.score;
        }

        this.showModal();
        this.updateStatus('🎸 VICTORY! You are a Metal Sudoku Master! 🎸');

        // Update history display if it exists
        if (typeof this.updateHistoryDisplay === 'function') {
            this.updateHistoryDisplay();
        }
    }
    
    showModal() {
        document.getElementById('win-modal').classList.remove('hidden');
    }
    
    hideModal() {
        document.getElementById('win-modal').classList.add('hidden');
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('victory-animation');
        });
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimerDisplay() {
        document.getElementById('timer-display').textContent = this.formatTime(this.timer);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateStatus(message) {
        document.getElementById('status-text').textContent = message;
    }

    // Session and User Management
    async initializeSession() {
        try {
            // Get or generate session ID
            this.sessionId = localStorage.getItem('metalSudokuSessionId') ||
                            'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('metalSudokuSessionId', this.sessionId);

            const response = await fetch(`/api/session?sessionId=${this.sessionId}`, {
                headers: {
                    'X-Session-ID': this.sessionId
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.userSession = data;
                this.sessionId = data.sessionId; // Use server-provided session ID
                localStorage.setItem('metalSudokuSessionId', this.sessionId);

                if (!data.hasUser) {
                    this.showWelcomeModal();
                } else {
                    this.currentUser = {
                        id: data.userId,
                        username: data.username
                    };
                    await this.loadGameHistory();
                }
            } else {
                console.error('Failed to initialize session - falling back to localStorage');
                this.fallbackToLocalStorage();
            }
        } catch (error) {
            console.error('Error initializing session - falling back to localStorage:', error);
            this.fallbackToLocalStorage();
        }
    }

    // Fallback to localStorage when backend is not available
    fallbackToLocalStorage() {
        this.useLocalStorage = true;

        // Check if user exists in localStorage
        const savedUser = localStorage.getItem('metalSudokuUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.loadGameHistoryFromLocalStorage();
            } catch (error) {
                console.error('Error parsing saved user:', error);
                this.showWelcomeModal();
            }
        } else {
            this.showWelcomeModal();
        }
    }

    showWelcomeModal() {
        const modal = document.getElementById('welcome-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideWelcomeModal() {
        const modal = document.getElementById('welcome-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async registerUser() {
        const usernameInput = document.getElementById('username-input');
        const errorDiv = document.getElementById('username-error');
        const registerBtn = document.getElementById('register-btn');

        const username = usernameInput.value.trim();

        if (!username) {
            this.showError(errorDiv, 'Please enter a username');
            return;
        }

        if (username.length > 50) {
            this.showError(errorDiv, 'Username must be 50 characters or less');
            return;
        }

        registerBtn.disabled = true;
        registerBtn.textContent = 'JOINING...';

        if (this.useLocalStorage) {
            // Fallback to localStorage
            this.currentUser = {
                id: Date.now(),
                username: username
            };
            localStorage.setItem('metalSudokuUser', JSON.stringify(this.currentUser));
            this.hideWelcomeModal();
            this.updateStatus(`Welcome, ${username}! Ready to rock!`);
            this.loadGameHistoryFromLocalStorage();
            registerBtn.disabled = false;
            registerBtn.textContent = 'JOIN THE BATTLE';
            return;
        }

        try {
            const response = await fetch(`/api/register?sessionId=${this.sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': this.sessionId
                },
                body: JSON.stringify({ username })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = {
                    id: data.userId,
                    username: data.username
                };
                this.hideWelcomeModal();
                this.updateStatus(`Welcome, ${data.username}! Ready to rock!`);
                await this.loadGameHistory();
            } else {
                this.showError(errorDiv, data.error || 'Registration failed');
            }
        } catch (error) {
            this.showError(errorDiv, 'Backend not available - using local storage');
            // Fallback to localStorage
            this.useLocalStorage = true;
            this.currentUser = {
                id: Date.now(),
                username: username
            };
            localStorage.setItem('metalSudokuUser', JSON.stringify(this.currentUser));
            this.hideWelcomeModal();
            this.updateStatus(`Welcome, ${username}! Ready to rock!`);
            this.loadGameHistoryFromLocalStorage();
        } finally {
            registerBtn.disabled = false;
            registerBtn.textContent = 'JOIN THE BATTLE';
        }
    }

    showError(errorDiv, message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }

    // Game History Management
    async loadGameHistory() {
        if (!this.currentUser) return;

        if (this.useLocalStorage) {
            this.loadGameHistoryFromLocalStorage();
            return;
        }

        try {
            const response = await fetch(`/api/history?sessionId=${this.sessionId}`, {
                headers: {
                    'X-Session-ID': this.sessionId
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.gameHistory = data.games || [];
            } else {
                console.error('Failed to load game history - falling back to localStorage');
                this.loadGameHistoryFromLocalStorage();
            }
        } catch (error) {
            console.error('Error loading game history - falling back to localStorage:', error);
            this.loadGameHistoryFromLocalStorage();
        }
    }

    loadGameHistoryFromLocalStorage() {
        try {
            const history = localStorage.getItem('metalSudokuHistory');
            this.gameHistory = history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error loading game history from localStorage:', error);
            this.gameHistory = [];
        }
    }

    saveGameHistoryToLocalStorage() {
        try {
            localStorage.setItem('metalSudokuHistory', JSON.stringify(this.gameHistory));
        } catch (error) {
            console.error('Error saving game history to localStorage:', error);
        }
    }

    async addGameToHistory(completionTime, difficulty) {
        const score = this.calculateScore(completionTime, difficulty);
        const difficultyName = this.difficultySettings[difficulty].name;

        const gameRecord = {
            completion_time: completionTime,
            difficulty: difficulty,
            difficulty_name: difficultyName,
            score: score,
            completed_at: new Date().toISOString()
        };

        if (this.useLocalStorage) {
            // Add to localStorage
            this.gameHistory.unshift(gameRecord);
            if (this.gameHistory.length > 100) {
                this.gameHistory = this.gameHistory.slice(0, 100);
            }
            this.saveGameHistoryToLocalStorage();
            return gameRecord;
        }

        if (this.currentUser) {
            try {
                const response = await fetch(`/api/game?sessionId=${this.sessionId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Session-ID': this.sessionId
                    },
                    body: JSON.stringify({
                        difficulty,
                        difficultyName,
                        completionTime,
                        score
                    })
                });

                if (response.ok) {
                    // Reload history to get updated data
                    await this.loadGameHistory();
                } else {
                    console.error('Failed to save game to database - falling back to localStorage');
                    this.useLocalStorage = true;
                    this.gameHistory.unshift(gameRecord);
                    this.saveGameHistoryToLocalStorage();
                }
            } catch (error) {
                console.error('Error saving game - falling back to localStorage:', error);
                this.useLocalStorage = true;
                this.gameHistory.unshift(gameRecord);
                this.saveGameHistoryToLocalStorage();
            }
        }

        return gameRecord;
    }

    calculateScore(timeInSeconds, difficulty) {
        // Score calculation: base points by difficulty, bonus for speed
        const basePoints = {
            1: 100,  // Beginner
            2: 200,  // Easy
            3: 300,  // Medium
            4: 500,  // Hard
            5: 800   // Expert
        };

        const base = basePoints[difficulty] || 300;
        const timeBonus = Math.max(0, 1800 - timeInSeconds); // 30 minutes max bonus
        const speedMultiplier = timeBonus > 0 ? (timeBonus / 1800) * 0.5 + 1 : 1;

        return Math.round(base * speedMultiplier);
    }

    // History and Leaderboards Display
    toggleHistory() {
        const content = document.getElementById('history-content');
        const button = document.getElementById('toggle-history');

        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            button.textContent = 'HIDE HISTORY';
            this.updateHistoryDisplay();
        } else {
            content.classList.add('hidden');
            button.textContent = 'SHOW HISTORY';
        }
    }

    toggleLeaderboards() {
        const content = document.getElementById('leaderboards-content');
        const button = document.getElementById('toggle-leaderboards');

        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            button.textContent = 'HIDE LEADERBOARDS';
            this.updateLeaderboardsDisplay();
        } else {
            content.classList.add('hidden');
            button.textContent = 'SHOW LEADERBOARDS';
        }
    }

    switchLeaderboardTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update table containers
        document.querySelectorAll('.leaderboard-table-container').forEach(container => {
            container.classList.remove('active');
        });
        document.getElementById(tab === 'fastest' ? 'fastest-times' : 'highest-scores').classList.add('active');
    }

    updateHistoryDisplay() {
        const tbody = document.getElementById('history-table-body');
        const noHistory = document.getElementById('no-history');

        if (this.gameHistory.length === 0) {
            tbody.innerHTML = '';
            noHistory.classList.remove('hidden');
            return;
        }

        noHistory.classList.add('hidden');
        tbody.innerHTML = this.gameHistory.map(game => {
            const date = new Date(game.completed_at);
            return `
                <tr>
                    <td>${date.toLocaleDateString()}</td>
                    <td>${this.formatTime(game.completion_time)}</td>
                    <td>${game.difficulty_name}</td>
                    <td>${game.score}</td>
                </tr>
            `;
        }).join('');
    }

    async updateLeaderboardsDisplay() {
        await this.updateFastestTimes();
        await this.updateHighestScores();
    }

    async updateFastestTimes() {
        const tbody = document.getElementById('fastest-times-body');
        const noFastest = document.getElementById('no-fastest');

        if (this.useLocalStorage) {
            this.updateFastestTimesFromLocalStorage();
            return;
        }

        try {
            const response = await fetch('/api/leaderboards?type=fastest&limit=10');

            if (response.ok) {
                const data = await response.json();
                const leaderboard = data.leaderboard || [];

                if (leaderboard.length === 0) {
                    tbody.innerHTML = '';
                    noFastest.classList.remove('hidden');
                    return;
                }

                noFastest.classList.add('hidden');

                tbody.innerHTML = leaderboard.map((entry) => {
                    const date = new Date(entry.completed_at);
                    return `
                        <tr>
                            <td>${entry.global_rank}</td>
                            <td>${date.toLocaleDateString()}</td>
                            <td>${this.formatTime(entry.completion_time)}</td>
                            <td>${entry.difficulty_name}</td>
                            <td>${entry.score}</td>
                            <td class="username-cell">${entry.username}</td>
                        </tr>
                    `;
                }).join('');
            } else {
                console.error('Failed to fetch fastest times - using local data');
                this.updateFastestTimesFromLocalStorage();
            }
        } catch (error) {
            console.error('Error fetching fastest times - using local data:', error);
            this.updateFastestTimesFromLocalStorage();
        }
    }

    updateFastestTimesFromLocalStorage() {
        const tbody = document.getElementById('fastest-times-body');
        const noFastest = document.getElementById('no-fastest');

        if (this.gameHistory.length === 0) {
            tbody.innerHTML = '';
            noFastest.classList.remove('hidden');
            return;
        }

        noFastest.classList.add('hidden');

        // Group by difficulty and get fastest time for each
        const fastestByDifficulty = {};
        this.gameHistory.forEach(game => {
            if (!fastestByDifficulty[game.difficulty] || game.completion_time < fastestByDifficulty[game.difficulty].completion_time) {
                fastestByDifficulty[game.difficulty] = game;
            }
        });

        // Convert to array and sort by time
        const fastestTimes = Object.values(fastestByDifficulty)
            .sort((a, b) => a.completion_time - b.completion_time)
            .slice(0, 10); // Top 10

        tbody.innerHTML = fastestTimes.map((game, index) => {
            const date = new Date(game.completed_at);
            const username = this.currentUser ? this.currentUser.username : 'You';
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${date.toLocaleDateString()}</td>
                    <td>${this.formatTime(game.completion_time)}</td>
                    <td>${game.difficulty_name}</td>
                    <td>${game.score}</td>
                    <td class="username-cell">${username}</td>
                </tr>
            `;
        }).join('');
    }

    async updateHighestScores() {
        const tbody = document.getElementById('highest-scores-body');
        const noHighest = document.getElementById('no-highest');

        if (this.useLocalStorage) {
            this.updateHighestScoresFromLocalStorage();
            return;
        }

        try {
            const response = await fetch('/api/leaderboards?type=highest&limit=10');

            if (response.ok) {
                const data = await response.json();
                const leaderboard = data.leaderboard || [];

                if (leaderboard.length === 0) {
                    tbody.innerHTML = '';
                    noHighest.classList.remove('hidden');
                    return;
                }

                noHighest.classList.add('hidden');

                tbody.innerHTML = leaderboard.map((entry) => {
                    const date = new Date(entry.completed_at);
                    return `
                        <tr>
                            <td>${entry.global_rank}</td>
                            <td>${date.toLocaleDateString()}</td>
                            <td>${this.formatTime(entry.completion_time)}</td>
                            <td>${entry.difficulty_name}</td>
                            <td>${entry.score}</td>
                            <td class="username-cell">${entry.username}</td>
                        </tr>
                    `;
                }).join('');
            } else {
                console.error('Failed to fetch highest scores - using local data');
                this.updateHighestScoresFromLocalStorage();
            }
        } catch (error) {
            console.error('Error fetching highest scores - using local data:', error);
            this.updateHighestScoresFromLocalStorage();
        }
    }

    updateHighestScoresFromLocalStorage() {
        const tbody = document.getElementById('highest-scores-body');
        const noHighest = document.getElementById('no-highest');

        if (this.gameHistory.length === 0) {
            tbody.innerHTML = '';
            noHighest.classList.remove('hidden');
            return;
        }

        noHighest.classList.add('hidden');

        // Sort by score and get top 10
        const highestScores = [...this.gameHistory]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        tbody.innerHTML = highestScores.map((game, index) => {
            const date = new Date(game.completed_at);
            const username = this.currentUser ? this.currentUser.username : 'You';
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${date.toLocaleDateString()}</td>
                    <td>${this.formatTime(game.completion_time)}</td>
                    <td>${game.difficulty_name}</td>
                    <td>${game.score}</td>
                    <td class="username-cell">${username}</td>
                </tr>
            `;
        }).join('');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MetalSudoku();
});