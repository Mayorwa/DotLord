import {useEffect, useState, useRef} from "react";
import './App.css'

type Player = 1 | 2
type Cell = Player | null;
type Board = Cell[][];
const ROWS = 6;
const AI_DEPTH = 6;
const COLS = 7;
enum dotValue {
    red = 1,
    blue = 2,
}

const createEmptyBoard = (): Board =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

const getValidColumns = (board: Board): number[] => {
    return Array.from({ length: COLS }, (_, i) => i).filter(col => board[0][col] === null);
};

const minimax = (board: Board, depth: number, alpha: number, beta: number, maximizingPlayer: boolean, player: Player): [number, number | null] => {
};

const getBestMove = (board: Board, player: Player): number => {
    const [, bestCol] = minimax(board, AI_DEPTH, -Infinity, Infinity, true, player);
    return bestCol !== null ? bestCol : getValidColumns(board)[0];
};

const checkWinner = (board: Board, row: number, col: number, player: Player): boolean => {
    const directions = [
        [0, 1],   // horizontal
        [1, 0],   // vertical
        [1, 1],   // diagonal down-right
        [1, -1],  // diagonal down-left
    ];
    for (const [dRow, dCol] of directions) {
        let count = 1;

        // Check in positive direction
        for (let i = 1; i < 4; i++) {
            const newRow = row + dRow * i;
            const newCol = col + dCol * i;
            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS &&
                board[newRow][newCol] === player) {
                count++;
            } else {
                break;
            }
        }

        // Check in negative direction
        for (let i = 1; i < 4; i++) {
            const newRow = row - dRow * i;
            const newCol = col - dCol * i;
            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS &&
                board[newRow][newCol] === player) {
                count++;
            } else {
                break;
            }
        }

        if (count >= 4) return true;
    }

    return false;
};

const App = () => {

    const [playersTurn, setPlayersTurn] = useState<Player>(1);
    const [boardGrid, setBoardGrid] = useState<Board>(createEmptyBoard);

    const [winner, setWinner] = useState<Player | null>(null);
    const [isDraw, setIsDraw] = useState<boolean>(false);
    const [moveComplete, setMoveComplete] = useState<boolean>(false)

    const intervalRef= useRef<null|any>(null);

    const [isAI, setIsAI] = useState<boolean>(false);
    const [isAIThinking, setIsAIThinking] = useState(false);

    // Methods
    useEffect(() => {
        if(moveComplete){
            hasFourConsecutiveOnes(boardGrid)
        }
    }, [boardGrid])

    const hasFourConsecutiveOnes = (grid: Board): boolean  => {
        const directions = [
            [0, 1],   // Right
            [1, 0],   // Down
            [1, 1],   // Diagonal down-right
            [1, -1]   // Diagonal down-left
        ];

        const rows = grid.length;
        const cols = grid[0].length;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] !== 1) continue;

                for (const [dr, dc] of directions) {
                    let count = 1;

                    for (let i = 1; i < 4; i++) {
                        const nr = r + dr * i;
                        const nc = c + dc * i;

                        if (
                            nr < 0 || nr >= rows ||
                            nc < 0 || nc >= cols ||
                            grid[nr][nc] !== 1
                        ) break;

                        count++;
                    }

                    if (count === 4) return true;
                }
            }
        }
        return false;
    }

    const updatePlayersTurn = () => {
        setPlayersTurn(playersTurn === dotValue.red ? dotValue.blue : dotValue.red);
    }
    const updateDotPiece = (cellIndex: number) => {
        if (winner || isDraw || isAI && playersTurn === 2) return;
        if (intervalRef.current !== null) return;
        let index: number = 0;
        if(boardGrid[index][cellIndex] !== null) {
            return;
        }
        index = -1
        intervalRef.current = setInterval(() => {
            setBoardGrid((prev: Board) => {
                const newGrid = prev.map(row => [...row]); // Deep copy

                // Clear previous cell
                if (index > 0) {
                    newGrid[index - 1][cellIndex] = null;
                }

                // Set current cell
                newGrid[index][cellIndex] = playersTurn;

                return newGrid;
            });
            if (
                index === boardGrid.length - 1 ||
                boardGrid[index + 1][cellIndex] !== null
            ) {
                clearInterval(intervalRef.current!);
                intervalRef.current = null;
                setMoveComplete(true);
                if(checkWinner(boardGrid, index, cellIndex, playersTurn)){
                    setWinner(playersTurn);
                }else if (boardGrid.every(row => row.every(cell => cell !== null))) {
                    setIsDraw(true);
                } else {
                    updatePlayersTurn();
                }
            } else {
                setMoveComplete(false);
                index++;
            }
        }, 20);
    }

    const resetGame = () => {
        setBoardGrid(createEmptyBoard());
        setPlayersTurn(1);
        setWinner(null);
        setIsDraw(false);
        setIsAI(false);
        setIsAIThinking(false);
    };
    const getGameStatus = () => {
        if (winner) return isAI ? "AI Wins! 🤖" : `Player ${playersTurn} Wins! 🎉` ;
        if (isDraw) return "It's a Draw! 🤝";
        if (isAI) return isAIThinking ? "AI is thinking... 🤔" : "AI's Turn";
        return `Player ${playersTurn}'s Turn(${dotValue[playersTurn]})`;
    };

    return (
        <>
            <div className="board-container">
                {getGameStatus()}
            </div>
            <div className="board">
                <table>
                    <tbody>
                    {boardGrid.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td id={`color${rowIndex}${cellIndex}`} onClick={() => updateDotPiece(cellIndex)}
                                    key={`${rowIndex}${cellIndex}`} className={`${cell && dotValue[cell]}`}></td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className="left leg"></div>
                <div className="right leg"></div>
            </div>
            <div className="board-reset">
                <button
                    onClick={resetGame}
                    className="board-reset-button"
                >
                    New Game
                </button>
            </div>
        </>
    )
}

export default App
