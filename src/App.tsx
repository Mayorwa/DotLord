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
    const intervalRef= useRef<null|any>(null);
    const [boardGrid, setBoardGrid] = useState<dotValue[][]>(arrayGrid);

    // Methods
    useEffect(() => {
    }, [boardGrid])
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
                intervalRef.current = null;
                updatePlayersTurn();
            } else {
                index++;
            }
        }, 20);
    }

    return (
        <>
            <div>
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
