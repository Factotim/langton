class LangtonsAnt {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 4; // Size of each cell in pixels
        this.grid = [];
        this.ant = {
            x: Math.floor(canvas.width / (2 * this.cellSize)),
            y: Math.floor(canvas.height / (2 * this.cellSize)),
            direction: 0 // 0: up, 1: right, 2: down, 3: left
        };
        this.previousAnt = { ...this.ant }; // Track previous ant position
        this.steps = 0;
        this.isRunning = false;
        this.animationId = null;
        this.speed = 50;
        this.modifiedCells = new Set(); // Track all modified cells during updates

        this.initializeGrid();
        this.setupEventListeners();
    }

    initializeGrid() {
        const cols = Math.floor(this.canvas.width / this.cellSize);
        const rows = Math.floor(this.canvas.height / this.cellSize);
        
        for (let i = 0; i < rows; i++) {
            this.grid[i] = new Array(cols).fill(0);
        }
    }

    setupEventListeners() {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const resetBtn = document.getElementById('resetBtn');
        const speedSlider = document.getElementById('speed');

        startBtn.addEventListener('click', () => this.start());
        stopBtn.addEventListener('click', () => this.stop());
        resetBtn.addEventListener('click', () => this.reset());
        speedSlider.addEventListener('input', (e) => {
            this.speed = e.target.value;
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.reset();
        });
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    reset() {
        this.stop();
        this.initializeGrid();
        this.ant = {
            x: Math.floor(this.canvas.width / (2 * this.cellSize)),
            y: Math.floor(this.canvas.height / (2 * this.cellSize)),
            direction: 0
        };
        this.previousAnt = { ...this.ant };
        this.modifiedCells.clear();
        this.steps = 0;
        document.getElementById('stepCount').textContent = this.steps;
        this.draw(true); // Force full redraw on reset
    }

    animate() {
        if (!this.isRunning) return;

        // Update multiple times based on speed
        const updates = Math.floor(this.speed / 10) + 1;
        for (let i = 0; i < updates; i++) {
            this.update();
        }

        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    update() {
        // Store previous ant position
        this.previousAnt = { ...this.ant };

        // Get current cell state
        const currentCell = this.grid[this.ant.y][this.ant.x];

        // Flip the color
        this.grid[this.ant.y][this.ant.x] = currentCell === 0 ? 1 : 0;
        
        // Add the modified cell to our set
        this.modifiedCells.add(`${this.ant.y},${this.ant.x}`);

        // Turn the ant
        if (currentCell === 0) {
            // Turn right
            this.ant.direction = (this.ant.direction + 1) % 4;
        } else {
            // Turn left
            this.ant.direction = (this.ant.direction + 3) % 4;
        }

        // Move the ant
        switch (this.ant.direction) {
            case 0: // up
                this.ant.y = (this.ant.y - 1 + this.grid.length) % this.grid.length;
                break;
            case 1: // right
                this.ant.x = (this.ant.x + 1) % this.grid[0].length;
                break;
            case 2: // down
                this.ant.y = (this.ant.y + 1) % this.grid.length;
                break;
            case 3: // left
                this.ant.x = (this.ant.x - 1 + this.grid[0].length) % this.grid[0].length;
                break;
        }

        this.steps++;
        document.getElementById('stepCount').textContent = this.steps;
    }

    draw(forceFullRedraw = false) {
        if (forceFullRedraw) {
            // Clear the entire canvas and redraw everything
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw all cells
            for (let y = 0; y < this.grid.length; y++) {
                for (let x = 0; x < this.grid[y].length; x++) {
                    if (this.grid[y][x] === 1) {
                        this.ctx.fillStyle = '#2c3e50';
                        this.ctx.fillRect(
                            x * this.cellSize,
                            y * this.cellSize,
                            this.cellSize,
                            this.cellSize
                        );
                    }
                }
            }
        } else {
            // Clear and redraw all modified cells
            for (const cellKey of this.modifiedCells) {
                const [y, x] = cellKey.split(',').map(Number);
                this.ctx.clearRect(
                    x * this.cellSize,
                    y * this.cellSize,
                    this.cellSize,
                    this.cellSize
                );
                
                if (this.grid[y][x] === 1) {
                    this.ctx.fillStyle = '#2c3e50';
                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
            
            // Clear the set of modified cells after drawing
            this.modifiedCells.clear();
        }

        // Draw the ant at its current position
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(
            this.ant.x * this.cellSize,
            this.ant.y * this.cellSize,
            this.cellSize,
            this.cellSize
        );
    }
}

// Initialize the simulation when the page loads
window.addEventListener('load', () => {
    const canvas = document.getElementById('antCanvas');
    
    // Set canvas size to match window size
    function resizeCanvas() {
        canvas.width = Math.min(window.innerWidth - 40, 800);
        canvas.height = Math.min(window.innerHeight - 200, 600);
    }
    
    resizeCanvas();
    const simulation = new LangtonsAnt(canvas);
}); 