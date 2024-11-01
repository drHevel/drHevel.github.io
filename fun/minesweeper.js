//TODO: FIX display, crash on bomb
var boardSizeSlider = document.getElementById('boardSize');
var bombsSlider = document.getElementById('mineDensity');
var w = 9, h = 9, bombs = 5, cellSize = 50;

boardSizeSlider.oninput = function() {
    w = this.value;
    h = this.value;
    calcBombs();
    field = init();
    canvas.width = w * cellSize;
    canvas.height = h * cellSize;
    draw();
};

bombsSlider.oninput = function() {
    calcBombs();
    field = init();
    draw();
};

function calcBombs() {
    bombs = Math.floor(h * w * bombsSlider.value * 0.1);
}

var canvas = document.getElementById('c');
canvas.width = w * cellSize;
canvas.height = h * cellSize;
var ctx = canvas.getContext('2d');

function Cell(x, y) {
    this.x = x;
    this.y = y;
    this.bomb = false;
    this.flagged = false;
    this.open = false;
}

Cell.prototype.draw = function(ctx) {
    ctx.fillStyle = this.open ? (this.bomb ? 'red' : 'lightgrey') : 'darkgrey';
    ctx.fillRect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
    ctx.strokeRect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
    if (this.flagged && !this.open) {
        ctx.fillStyle = 'blue';
        ctx.font = '20px Arial';
        ctx.fillText('F', this.x * cellSize + cellSize / 3, this.y * cellSize + cellSize * 2 / 3);
    }
    if (this.open && !this.bomb) {
        var bombCount = this.countBombsAround(field);
        if (bombCount > 0) {
            ctx.fillStyle = 'black';
            ctx.font = '20px Arial';
            ctx.fillText(bombCount, this.x * cellSize + cellSize / 3, this.y * cellSize + cellSize * 2 / 3);
        }
    }
};

Cell.prototype.click = function(field) {
    if (this.open || this.flagged) return true;
    if (this.bomb) return false;
    this.open = true;
    var bombCount = this.countBombsAround(field);
    if (bombCount == 0) {
        var cells = this.cellsAround(field);
        cells.forEach(c => c.click(field));
    }
    return true;
};

Cell.prototype.flag = function() {
    if (!this.open) {
        this.flagged = !this.flagged;
    }
}

Cell.prototype.countBombsAround = function(field) {
    var cells = this.cellsAround(field);
    return cells.filter(c => c.bomb).length;
};

Cell.prototype.cellsAround = function(field) {
    var cells = [];
    for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
            var x = this.x + dx, y = this.y + dy;
            if (x >= 0 && x < w && y >= 0 && y < h && (dx != 0 || dy != 0)) {
                cells.push(field[y][x]);
            }
        }
    }
    return cells;
};

function init() {
    var f = [];
    for (var y = 0; y < h; y++) {
        var r = [];
        for (var x = 0; x < w; x++) {
            r.push(new Cell(x, y));
        }
        f.push(r);
    }
    for (var i = 0; i < bombs; i++) {
        while (true) {
            var x = Math.floor(Math.random() * w), y = Math.floor(Math.random() * h);
            if (!f[y][x].bomb) {
                f[y][x].bomb = true;
                break;
            }
        }
    }
    return f;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    eachCell(cell => cell.draw(ctx));
}

function openAll() {
    eachCell(cell => cell.open = true);
}

function eachCell(fn) {
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            fn(field[y][x]);
        }
    }
}

function gameWon() {
    var found = 0;
    eachCell(cell => { if (cell.bomb && cell.flagged) found++; });
    return bombs == found;
}

function finishGame(text) {
    openAll();
    draw();
    setTimeout(function() {
        alert(text);
        resetGame();
    }, 50);
}

function resetGame() {
    field = init();
    draw();
}

function processAction(x, y, fn) {
    var cell = field[Math.floor(y / cellSize)][Math.floor(x / cellSize)];
    var ok = fn(cell);
    draw();
    if (!ok) finishGame('Game Over, you lost!');
    if (gameWon()) finishGame('Congratulations, you won!');
}

var field = init();
draw();

canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    processAction(x, y, (cell) => cell.click(field));
});

canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    processAction(x, y, (cell) => {
        cell.flag();
        return true;
    });
});