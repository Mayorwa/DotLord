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

// AI Evaluation function
const evaluateWindow = (window: Cell[], player: Player): number => {
    const opponent = player === 1 ? 2 : 1;
    let score = 0;

    const playerCount = window.filter(cell => cell === player).length;
    const opponentCount = window.filter(cell => cell === opponent).length;
    const emptyCount = window.filter(cell => cell === null).length;

    if (playerCount === 4) score += 100;
    else if (playerCount === 3 && emptyCount === 1) score += 10;
    else if (playerCount === 2 && emptyCount === 2) score += 2;

    if (opponentCount === 3 && emptyCount === 1) score -= 80;
    else if (opponentCount === 2 && emptyCount === 2) score -= 5;

    return score;
};

const evaluateBoard = (board: Board, player: Player): number => {
    let score = 0;

    // Score center column preference
    const centerCol = Math.floor(COLS / 2);
    const centerCount = board.map(row => row[centerCol]).filter(cell => cell === player).length;
    score += centerCount * 3;

    // Score horizontal
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS - 3; col++) {
            const window = board[row].slice(col, col + 4);
            score += evaluateWindow(window, player);
        }
    }

    // Score vertical
    for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS - 3; row++) {
            const window = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
            score += evaluateWindow(window, player);
        }
    }

    // Score diagonal (positive slope)
    for (let row = 0; row < ROWS - 3; row++) {
        for (let col = 0; col < COLS - 3; col++) {
            const window = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
            score += evaluateWindow(window, player);
        }
    }

    // Score diagonal (negative slope)
    for (let row = 0; row < ROWS - 3; row++) {
        for (let col = 3; col < COLS; col++) {
            const window = [board[row][col], board[row + 1][col - 1], board[row + 2][col - 2], board[row + 3][col - 3]];
            score += evaluateWindow(window, player);
        }
    }

    return score;
};

const getValidColumns = (board: Board): number[] => {
    return Array.from({ length: COLS }, (_, i) => i).filter(col => board[0][col] === null);
};

const isTerminalNode = (board: Board): boolean => {
    return getValidColumns(board).length === 0 ||
        checkWinnerAI(board, 1) ||
        checkWinnerAI(board, 2);
};

const minimax = (board: Board, depth: number, alpha: number, beta: number, maximizingPlayer: boolean, player: Player): [number, number | null] => {
    const validCols = getValidColumns(board);
    const isTerminal = isTerminalNode(board);

    if (depth === 0 || isTerminal) {
        if (isTerminal) {
            if (checkWinnerAI(board, player)) return [100000000, null];
            else if (checkWinnerAI(board, player === 1 ? 2 : 1)) return [-100000000, null];
            else return [0, null]; // Draw
        } else {
            return [evaluateBoard(board, player), null];
        }
    }

    if (maximizingPlayer) {
        let maxEvaluation = -Infinity;
        let bestCol = validCols[0];

        for (const col of validCols) {
            const newBoard = dropPieceAI(board, col, player);
            const [evaluation] = minimax(newBoard, depth - 1, alpha, beta, false, player);

            if (evaluation > maxEvaluation) {
                maxEvaluation = evaluation;
                bestCol = col;
            }

            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) break; // Alpha-beta pruning
        }

        return [maxEvaluation, bestCol];
    } else {
        let minEvaluation = Infinity;
        let bestCol = validCols[0];

        for (const col of validCols) {
            const opponent = player === 1 ? 2 : 1;
            const newBoard = dropPieceAI(board, col, opponent);
            const [evaluation] = minimax(newBoard, depth - 1, alpha, beta, true, player);

            if (evaluation < minEvaluation) {
                minEvaluation = evaluation;
                bestCol = col;
            }

            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break; // Alpha-beta pruning
        }

        return [minEvaluation, bestCol];
    }
};

const getBestMove = (board: Board, player: Player): number => {
    const [, bestCol] = minimax(board, AI_DEPTH, -Infinity, Infinity, true, player);
    return bestCol !== null ? bestCol : getValidColumns(board)[0];
};

const checkWinnerAI = (board: Board, player: Player): boolean => {
    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS - 3; col++) {
            if (board[row][col] === player &&
                board[row][col + 1] === player &&
                board[row][col + 2] === player &&
                board[row][col + 3] === player) {
                return true;
            }
        }
    }

    // Check vertical
    for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS - 3; row++) {
            if (board[row][col] === player &&
                board[row + 1][col] === player &&
                board[row + 2][col] === player &&
                board[row + 3][col] === player) {
                return true;
            }
        }
    }

    // Check diagonal (positive)
    for (let row = 0; row < ROWS - 3; row++) {
        for (let col = 0; col < COLS - 3; col++) {
            if (board[row][col] === player &&
                board[row + 1][col + 1] === player &&
                board[row + 2][col + 2] === player &&
                board[row + 3][col + 3] === player) {
                return true;
            }
        }
    }

    // Check diagonal (negative)
    for (let row = 0; row < ROWS - 3; row++) {
        for (let col = 3; col < COLS; col++) {
            if (board[row][col] === player &&
                board[row + 1][col - 1] === player &&
                board[row + 2][col - 2] === player &&
                board[row + 3][col - 3] === player) {
                return true;
            }
        }
    }

    return false;
};

const dropPieceAI = (board: Board, col: number, player: Player): Board => {
    const newBoard = board.map(row => [...row]);
    for (let row = ROWS - 1; row >= 0; row--) {
        if (newBoard[row][col] === null) {
            newBoard[row][col] = player;
            break;
        }
    }
    return newBoard;
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
