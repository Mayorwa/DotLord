import {useEffect, useState, useRef} from "react";
import './App.css'

enum dotValue {
    empty = 0,
    red = 1,
    blue = 2,
}

const App = () => {

    const arrayGrid = () =>
        Array.from({ length: 6 }, () => Array(7).fill(dotValue.empty));

    const [playersTurn, setPlayersTurn] = useState<1|2>(1)
    const [moveComplete, setMoveComplete] = useState<boolean>(false)
    const intervalRef= useRef<null|any>(null);
    const [boardGrid, setBoardGrid] = useState<dotValue[][]>(arrayGrid);

    // Methods
    useEffect(() => {
        if(moveComplete){
            hasFourConsecutiveOnes(boardGrid)
        }
    }, [boardGrid])

    const hasFourConsecutiveOnes = (grid: dotValue[][]): boolean  => {
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
        if (intervalRef.current !== null) return;
        let index: number = 0;
        if(boardGrid[index][cellIndex] !== dotValue.empty) {
            return;
        }
        index = -1
        intervalRef.current = setInterval(() => {
            setBoardGrid((prev: dotValue[][]) => {
                const newGrid = prev.map(row => [...row]); // Deep copy

                // Clear previous cell
                if (index > 0) {
                    newGrid[index - 1][cellIndex] = dotValue.empty;
                }

                // Set current cell
                newGrid[index][cellIndex] = playersTurn;

                return newGrid;
            });
            if (
                index === boardGrid.length - 1 ||
                boardGrid[index + 1][cellIndex] !== dotValue.empty
            ) {
                clearInterval(intervalRef.current!);
                setMoveComplete(true);
                intervalRef.current = null;
                updatePlayersTurn();
            } else {
                setMoveComplete(false);
                index++;
            }
        }, 20);
    }

    return (
        <>
            <div className="board-container">
                Player: {dotValue[playersTurn]}
            </div>
            <div className="board">
                <table>
                    <tbody>
                        {boardGrid.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <td id={`color${rowIndex}${cellIndex}`} onClick={() => updateDotPiece(cellIndex)} key={`${rowIndex}${cellIndex}`} className={`${dotValue[cell]}`}></td>
                                ))}
                            </tr>
                        )) }
                    </tbody>
                </table>
                <div className="left leg"></div>
                <div className="right leg"></div>
            </div>

        </>
    )
}

export default App
