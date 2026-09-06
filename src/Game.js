import React from "react";
import "./Game.css";

const CellSize = 20;
const Width = 800;
const Height = 600;

class Game extends React.Component {
    constructor() {
        super();
        this.rows = Height / CellSize;
        this.cols = Width / CellSize;
        this.board = this.makeEmptyBoard();
    }

    runGame = () => {
        this.setState({isRunning:true});
        this.runIteration();
    }

    stopGame = () => {
        this.setState({isRunning:false});
        if (this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }

    runIteration() {
        let newBoard = this.makeEmptyBoard();
        for (let y=0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let neighbours = this.calculateNeighbours(this.board, x, y);
                if (this.board[y][x]) {
                    if (neighbours === 2 || neighbours === 3) {
                        newBoard[y][x] = true;
                    } else {
                        newBoard[y][x] = false;
                    }
                } else {
                    if (!this.board[y][x] && neighbours === 3) {
                        newBoard[y][x] = true;
                    }
                }
            }
        }

        this.board = newBoard;
        this.setState({ cells: this.makeCells(), isRunning: true});

        this.timeoutHandler = window.setTimeout(() => {
            this.runIteration();
        }, this.state.interval);
    }

    handleIntervalChange = (event) => {this.setState({interval: event.target.value});}

    state = {
        cells: [],
        interval: 100,
        isRunning: false,
    }

    makeEmptyBoard() {
        let board = [];
        for (let y = 0; y < this.rows; y++) {
            board[y] = [];
            for (let x = 0; x < this.cols; x++) {
                board[y][x] = false;
            }
        }
        return board;
    }

    makeCells() {
        let cells = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    cells.push({x, y});
                }
            }
        }

        return cells;
    }

    getElementOffset() {
        const rect = this.boardRef.getBoundingClientRect();
        const doc = document.documentElement;

        return {
            x: (rect.left + window.pageXOffset + 10) - doc.clientLeft, y: (rect.top + window.pageYOffset + 10) - doc.clientTop,  
        };
    }

    handleClear = () => {
        this.board = this.makeEmptyBoard();
        this.setState({cells: this.makeCells()})
    }

    handleClick = (event) => {
        const elemOffset = this.getElementOffset();
        const offsetX = event.clientX - elemOffset.x;
        const offsetY = event.clientY - elemOffset.y;
        const x = Math.floor(offsetX/CellSize);
        const y = Math.floor(offsetY/CellSize);
        if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
            this.board[y][x] = !this.board[y][x];
        }
        this.setState({cells: this.makeCells()});
    }

    calculateNeighbours(board, x, y) {
        let neighbours = 0;
        const dirs = [[-1, -1], [-1,0], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, 1]];

        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            let y1 = y + dir[0];
            let x1 = x + dir[1];

            if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
                neighbours++;
            }
        }

        return neighbours;
    }

    render() {
        const {cells, interval, isRunning} = this.state;
        return ( <div>
                    <div class="gameBoard" style={{width: Width, height:Height}} onClick={this.handleClick} ref={(n) => {this.boardRef=n;}}>
                        {cells.map(cell => (<Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`}/>))
                        }
                    </div>
                    <div className="controls">Update every <input value={this.state.interval} onChange={this.handleIntervalChange}/> msec {isRunning ? <button className="button" onClick={this.stopGame}>Stop</button> : <button className="button" onClick={this.runGame}>Run</button>}
                    <button className="button" onClick={this.handleClear}>Clear</button>                    
                    </div>
                </div>)
    }
}

class Cell extends React.Component {
    render() {
        const {x, y} = this.props;
        return(
            <div className="Cell" style={{left: `${CellSize * x + 1}px`, top: `${CellSize * y + 1}px`, width: `${CellSize - 1}px`, height: `${CellSize - 1}px`,}}/> 
        );
    }
}

export default Game;