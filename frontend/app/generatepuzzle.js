"use client";
import React from "react";
import { useState } from "react";
export default function GeneratePuzzle({ screenWidth }) {
    const [puzzleTitle, setPuzzleTitle] = React.useState("");
    const [question, setQuestion] = React.useState("");
    const [answer, setAnswer] = React.useState("");
    const [qnaList, setQnaList] = React.useState([]);
    const [editAnswer, setEditAnswer] = useState("");
    const [editQuestion, setEditQuestion] = useState("");
    const [editingIndex, setEditingIndex] = useState(null); // Index of the QnA being edited
    const [isEditing, setIsEditing] = useState(false);

    // Open the edit modal
    const handleEditClick = (termObj, index) => {
        setEditAnswer(termObj.answer);       // ✅ Pre-fill answer
        setEditQuestion(termObj.question);   // ✅ Pre-fill question
        setEditingIndex(index);              // ✅ Track index
        setIsEditing(true);                  // ✅ Open modal
    };

    // Save changes
    const handleSaveEdit = () => {
        if (editingIndex !== null) {
            const updatedQnA = [...qnaList];  // ✅ Copy the qnaList
            updatedQnA[editingIndex] = {
                answer: editAnswer,          // ✅ Use new edited values
                question: editQuestion
            };
            setQnaList(updatedQnA);          // ✅ Save back to state
        }
        setIsEditing(false);                 // ✅ Close modal
    };

    // Get clue number for a specific grid cell
    const getClueNumber = (row, col) => {
        const match = placedWords.find((entry) => {
            if (!entry || !entry.start) return false;
            return entry.start.row === row && entry.start.col === col;
        });

        return match ? match.index + 1 : null;
    };
    const generateMutations = (arr) => {
        const result = [];

        const backtrack = (path, remaining) => {
            if (remaining.length === 0) {
                result.push(path);
                return;
            }

            for (let i = 0; i < remaining.length; i++) {
                backtrack([...path, remaining[i]], [
                    ...remaining.slice(0, i),
                    ...remaining.slice(i + 1),
                ]);
            }
        };

        backtrack([], arr);
        return result;
    };



    // build the puzzle
    const { grid, placedWords } = React.useMemo(() => {

        // find longest word length
        const longestWordLength = Math.max(...qnaList.map(item => item.answer.length), 0);

        // build the grid size base on double the length of the longest word
        const gridSize = Math.max(10, longestWordLength * 2);

        // build empty grid puzzle
        const grid = Array.from({ length: gridSize }, () =>
            Array.from({ length: gridSize }, () => null)
        );
        const placedWords = [];

        // ✅ Skip everything if no input
        if (qnaList.length === 0) {
            return { grid, placedWords };
        }

        // Sort the word from longest to shorted
        // 🔢 Step 1: Assign score based on shared letters
        const sortedQna = qnaList
            .filter(item => item.answer && typeof item.answer === 'string') // 🛡️ Prevent undefined/null
            .map((item, index) => {
                const word = item.answer.toUpperCase();
                let score = 0;

                for (let other of qnaList) {
                    if (other === item || !other.answer) continue;
                    const otherWord = other.answer.toUpperCase();
                    for (let char of word) {
                        if (otherWord.includes(char)) score++;
                    }
                }

                return { ...item, index, score };
            });


        // 🧠 Step 2: Safely pick top scorer and sort others
        const scoredCopy = [...sortedQna]; // Still has score and index, useful for later if needed
        const permutations = generateMutations(scoredCopy);

        let finalGrid = null;
        let finalPlacedWords = [];
        let found = false;

        console.log("🔁 Total permutations to try:", permutations.length);

        // 🔁 Try all permutations to find the best placement order
        for (let p = 0; p < permutations.length; p++) {
            console.log(`🔍 Trying permutation #${p + 1}:`, permutations[p].map(w => w.answer.toUpperCase()));
            let allFit = true;
            const testPlacedWords = [];
            const testGrid = Array.from({ length: gridSize }, () =>
                Array.from({ length: gridSize }, () => null)
            );

            permutations[p].forEach((item, index) => {
                const word = item.answer.toUpperCase();
                let placed = false;

                if (index === 0) {

                    // Place the first word horizontally in the center
                    const centerRow = Math.floor(gridSize / 2);
                    const startCol = Math.floor((gridSize - word.length) / 2);
                    for (let i = 0; i < word.length; i++) {
                        testGrid[centerRow][startCol + i] = word[i];
                    }
                    testPlacedWords.push({ word, direction: "across", start: { row: centerRow, col: startCol }, index: item.index });
                    return;
                }

                // Try to intersect with placed words
                outer: for (let pw of testPlacedWords) {
                    let attempts = 0;
                    for (let i = 0; i < word.length; i++) {
                        const letter = word[i];
                        for (let j = 0; j < pw.word.length; j++) {
                            if (placed) break;
                            attempts++;
                            if (attempts > 1000000000) break outer; // 🚨 limit to prevent freezing
                            if (letter !== pw.word[j]) continue;
                            const r = pw.start.row;
                            const c = pw.start.col;
                            let newRow, newCol;
                            if (pw.direction === "across") {

                                // Try placing down intersecting at j
                                newRow = r - i;
                                newCol = c + j;
                                if (
                                    newRow >= 0 &&
                                    newRow + word.length <= gridSize &&
                                    newCol < gridSize
                                ) {
                                    // 🧠 No snake-combine check: above and below the word
                                    const topCell = testGrid[newRow - 1]?.[newCol];
                                    const bottomCell = testGrid[newRow + word.length]?.[newCol];
                                    const isTopBlocked = topCell && !testPlacedWords.some(w =>
                                        w.direction === "across" &&
                                        w.start.row === newRow - 1 &&
                                        w.start.col <= newCol &&
                                        newCol < w.start.col + w.word.length
                                    );
                                    const isBottomBlocked = bottomCell && !testPlacedWords.some(w =>
                                        w.direction === "across" &&
                                        w.start.row === newRow + word.length &&
                                        w.start.col <= newCol &&
                                        newCol < w.start.col + w.word.length
                                    );
                                    if (isTopBlocked || isBottomBlocked) continue;


                                    let fits = true;
                                    for (let k = 0; k < word.length; k++) {
                                        const row = newRow + k;
                                        const cell = testGrid[row][newCol];
                                        if (cell && cell !== word[k]) {
                                            fits = false;
                                            break;
                                        }

                                        // 🛑 check surrounding horizontal neighbors
                                        if (
                                            (testGrid[row][newCol - 1] || testGrid[row][newCol + 1]) &&
                                            testGrid[row][newCol] === null
                                        ) {
                                            fits = false;
                                            break;
                                        }
                                    }
                                    if (fits) {
                                        for (let k = 0; k < word.length; k++) {
                                            testGrid[newRow + k][newCol] = word[k];
                                        }
                                        testPlacedWords.push({
                                            word,
                                            row: newRow,
                                            col: newCol,
                                            direction: "down",
                                            start: { row: newRow, col: newCol },
                                            index: item.index,
                                        });
                                        placed = true;
                                        break;
                                    }
                                }
                            }
                            else {
                                // Try placing across intersecting at j
                                newRow = r + j;
                                newCol = c - i;
                                if (
                                    newCol >= 0 &&
                                    newCol + word.length <= gridSize &&
                                    newRow < gridSize
                                ) {

                                    // 🧠 No snake-combine check: left and right of the word
                                    const leftCell = testGrid[newRow]?.[newCol - 1];
                                    const rightCell = testGrid[newRow]?.[newCol + word.length];
                                    const isLeftBlocked = leftCell && !testPlacedWords.some(w =>
                                        w.direction === "down" &&
                                        w.start.col === newCol - 1 &&
                                        w.start.row <= newRow &&
                                        newRow < w.start.row + w.word.length
                                    );
                                    const isRightBlocked = rightCell && !testPlacedWords.some(w =>
                                        w.direction === "down" &&
                                        w.start.col === newCol + word.length &&
                                        w.start.row <= newRow &&
                                        newRow < w.start.row + w.word.length
                                    );
                                    if (isLeftBlocked || isRightBlocked) continue;

                                    let fits = true;
                                    for (let k = 0; k < word.length; k++) {
                                        const col = newCol + k;
                                        const cell = testGrid[newRow][col];
                                        if (cell && cell !== word[k]) {
                                            fits = false;
                                            break;
                                        }
                                        // 🛑 check surrounding vertical neighbors
                                        if (
                                            (testGrid[newRow - 1]?.[col] || testGrid[newRow + 1]?.[col]) &&
                                            testGrid[newRow][col] === null
                                        ) {
                                            fits = false;
                                            break;
                                        }
                                    }
                                    if (fits) {
                                        for (let k = 0; k < word.length; k++) {
                                            testGrid[newRow][newCol + k] = word[k];
                                        }
                                        testPlacedWords.push({
                                            word,
                                            row: newRow,
                                            col: newCol,
                                            direction: "across",
                                            start: { row: newRow, col: newCol },
                                            index: item.index,
                                        });
                                        placed = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (!placed) {
                        allFit = false;
                        break; // break current permutation
                    }
                }
            });
            // If all words fit, save the result to finalGrid and finalPlacedWords
            if (allFit) {
                found = true;
                finalGrid = testGrid;
                finalPlacedWords = testPlacedWords;
                break; // Stop at first successful permutation
            }
        }
        if (found && finalGrid && finalPlacedWords.length > 0) {
            console.log("✅ Found a permutation that fits all words!");
            return { grid: finalGrid, placedWords: finalPlacedWords };
        }
        else {
            console.log("❌ No valid permutation found. Falling back to default placement.");

            // Fallback: spaced-out placement
            scoredCopy.forEach((item, index) => {
                const word = item.answer.toUpperCase();
                let placed = false;

                if (index === 0) {
                    const centerRow = Math.floor(gridSize / 2);
                    const startCol = Math.floor((gridSize - word.length) / 2);
                    for (let i = 0; i < word.length; i++) {
                        grid[centerRow][startCol + i] = word[i];
                    }
                    placedWords.push({
                        word,
                        direction: "across",
                        start: { row: centerRow, col: startCol },
                        index: item.index,
                    });
                    return;
                }

                // Fallback placement logic
                let newRow = Math.floor(gridSize / 2);
                let newCol = Math.floor((gridSize - word.length) / 2);

                if (item.direction === "across" && word.length <= gridSize) {
                    let fits = true;
                    for (let i = 0; i < word.length; i++) {
                        const char = grid[newRow][newCol + i];
                        if (char && char !== word[i]) {
                            fits = false;
                            break;
                        }
                    }
                    if (fits) {
                        for (let i = 0; i < word.length; i++) {
                            grid[newRow][newCol + i] = word[i];
                        }
                        placedWords.push({
                            word,
                            direction: "across",
                            start: { row: newRow, col: newCol },
                            index: item.index,
                        });
                        placed = true;
                    }
                }

                if (!placed && item.direction === "down" && word.length <= gridSize) {
                    newRow = Math.floor((gridSize - word.length) / 2);
                    newCol = Math.floor(gridSize / 2);
                    let fits = true;
                    for (let i = 0; i < word.length; i++) {
                        const char = grid[newRow + i][newCol];
                        if (char && char !== word[i]) {
                            fits = false;
                            break;
                        }
                    }
                    if (fits) {
                        for (let i = 0; i < word.length; i++) {
                            grid[newRow + i][newCol] = word[i];
                        }
                        placedWords.push({
                            word,
                            direction: "down",
                            start: { row: newRow, col: newCol },
                            index: item.index,
                        });
                    }
                } if (!placed) {
                    // Try one last time ignoring the 1-block distance rule
                    for (let row = 0; row < gridSize; row++) {
                        for (let col = 0; col < gridSize; col++) {
                            // Try placing across
                            if (col + word.length <= gridSize) {
                                let fits = true;
                                for (let i = 0; i < word.length; i++) {
                                    const cell = grid[row][col + i];
                                    if (cell && cell !== word[i]) {
                                        fits = false;
                                        break;
                                    }

                                    // 🚫 Block if adjacent top or bottom cell is filled and this cell is empty
                                    if (
                                        !grid[row][col + i] && (
                                            grid[row - 1]?.[col + i] ||
                                            grid[row + 1]?.[col + i]
                                        )
                                    ) {
                                        fits = false;
                                        break;
                                    }
                                }

                                // 🚫 Block if cell to the left or right is filled
                                if (
                                    grid[row]?.[col - 1] ||
                                    grid[row]?.[col + word.length]
                                ) {
                                    fits = false;
                                }

                            }
                            // Try placing down
                            if (placed) break;
                            if (row + word.length <= gridSize) {
                                let fits = true;
                                for (let i = 0; i < word.length; i++) {
                                    const ch = grid[row + i][col];
                                    if (ch && ch !== word[i]) {
                                        fits = false;
                                        break;
                                    }
                                }
                                if (fits) {
                                    for (let i = 0; i < word.length; i++) {
                                        grid[row + i][col] = word[i];
                                    }
                                    placedWords.push({
                                        word,
                                        direction: "down",
                                        start: { row, col },
                                        index: item.index,
                                    });
                                    placed = true;
                                    break;
                                }
                            }
                        }
                        if (placed) break;
                    }
                }

            });
        }
        return { grid, placedWords }; // ✅ This line closes the useMemo function properly
    }, [qnaList]);
    return (
        <div className="text-white font-[Itim]">
            <h1 className="text-3xl font-bold mb-6">Crossword Puzzle</h1>
            {isEditing ? (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                        className="bg-[#3B0B24] p-6 rounded-lg text-white relative"
                        style={{ width: screenWidth > 450 ? "450px" : "100%" }} // ✅ Set width logic
                    >
                        <button className="absolute top-2 right-2 text-xl" onClick={() => setIsEditing(false)}>✖</button>
                        <h2 className="text-2xl font-bold mb-4">Edit</h2>

                        <label className="block mb-2">Answer:</label>
                        <input
                            type="text"
                            className="bg-[#522136] text-white px-4 py-2 rounded-lg w-full mb-4"
                            value={editAnswer}
                            onChange={(e) => setEditAnswer(e.target.value)}
                        />

                        <label className="block mb-2">Question:</label>
                        <textarea
                            className="bg-[#522136] text-white px-4 py-2 rounded-lg w-full mb-4"
                            value={editQuestion}
                            onChange={(e) => setEditQuestion(e.target.value)}
                        />

                        <button onClick={handleSaveEdit} className="bg-yellow-500 px-6 py-2 rounded-lg transition duration-300 hover:bg-yellow-400 hover:scale-105">
                            Done
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-2 w-full justify-start">

                    {/* Left Column */}
                    <div className={`flex flex-col gap-2 ${screenWidth > 770 ? "w-full md:w-2/5 max-w-[450px]" : "w-full"}`}>
                        {/* Box 1: Title Input + Create Button */}
                        <div className="bg-[#522136] p-4 rounded-lg">
                            <input
                                type="text"
                                placeholder="Enter title"
                                value={puzzleTitle}
                                onChange={(e) => setPuzzleTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg text-white bg-transparent border border-white focus:outline-none placeholder-white"
                            />
                            <button
                                className="w-full mt-4 bg-[#B0913D] text-white py-2 rounded-md hover:bg-[#c5a847] transition duration-300"
                            >
                                Create
                            </button>
                        </div>

                        {/* Box 2: Question + Answer Input */}
                        <div className="bg-[#522136] p-4 rounded-lg">
                            <label className="block mb-2 text-white">Question</label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg text-white bg-transparent border border-white mb-4 focus:outline-none placeholder-white"
                            />
                            <hr className="border-white my-2" />
                            <label className="block mb-2 text-white">Answer</label>
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg text-white bg-transparent border border-white focus:outline-none placeholder-white"
                            />
                            <button
                                onClick={() => {
                                    const cleanQuestion = question.trim();
                                    const cleanAnswer = answer.trim().toUpperCase();

                                    if (cleanQuestion && cleanAnswer) {
                                        const updatedList = [
                                            ...qnaList,
                                            {
                                                question: cleanQuestion,
                                                answer: cleanAnswer,
                                            },
                                        ];

                                        setQnaList(updatedList);
                                        setQuestion("");
                                        setAnswer("");
                                    }
                                }}
                                className="mt-4 bg-[#B0913D] text-white px-6 py-2 rounded-md hover:bg-[#c5a847] transition duration-300"
                            >
                                Add
                            </button>

                        </div>

                        {/* Show QnA box */}
                        <div className="bg-[#522136] p-4 rounded-lg overflow-y-auto">
                            {qnaList.length === 0 ? (
                                <p className="text-white-400 text-center py-4">Enter a question and answer above to start</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {qnaList.map((item, index) => (
                                        <div
                                            key={index}
                                            className="bg-[#6A2A3B] p-4 rounded-lg flex items-center justify-between w-full"
                                        >
                                            <span className="font-semibold w-1/3">{item.answer}</span>
                                            <div
                                                className="w-[2px] h-full bg-white mx-4 rounded-full opacity-50"
                                                style={{ minHeight: "40px" }}
                                            ></div>
                                            <span className="text-gray-300 w-2/3">{item.question}</span>

                                            {/* ✏️ Edit Buttons Container */}
                                            <div className="relative flex items-center pl-8">
                                                <button
                                                    onClick={() => {
                                                        const updatedList = qnaList.filter((_, i) => i !== index);
                                                        setQnaList(updatedList);
                                                    }}
                                                    className="absolute top-0 right-0 text-white transition duration-300 hover:text-red-500 hover:scale-110"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(item, index)}
                                                    className="absolute bottom-1 right-0 text-white transition duration-300 hover:text-yellow-400 hover:scale-110"
                                                >
                                                    <i className="bi bi-pencil-fill"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    {/* Puzzle look */}
                    <div className={`bg-[#522136] p-2 rounded-lg ${screenWidth > 770 ? "md:w-3/5 flex flex-col gap-2 max-w-[750px]" : "w-full md:w-3/5 flex flex-col gap-2"}`}>


                        {/* Puzzle Title Box */}
                        <div className="flex justify-center ">
                            <div className="bg-[#522136] text-white p-2 rounded-md font-semibold text-center">
                                {puzzleTitle || "Untitled"}
                            </div>
                        </div>
                        {/* Divider Line */}
                        <hr className="border-white" />

                        {/* THE PUZZLE */}
                        <div className="bg-[#522136] text-white p-4 rounded-md min-h-[450px] flex flex-col items-center justify-center gap-1">
                            {grid.map((rowArray, row) => (
                                <div key={row} className="flex gap-1">
                                    {rowArray.map((cell, col) => {
                                        const clueNum = getClueNumber(row, col); // 👈 grab the clue number

                                        return (
                                            <div
                                                key={`${row}-${col}`}
                                                className="relative w-6 h-6 bg-[#522136] text-white rounded-sm flex items-center justify-center text-xs border border-white"
                                            >
                                                {/* The letter itself */}
                                                <span className="z-10">{cell || ""}</span>

                                                {/* The clue number (only for first letters) */}
                                                {clueNum && (
                                                    <span className="absolute top-[1px] left-[1px] text-[8px] text-white-400 font-bold z-20 leading-none">
                                                        {clueNum}
                                                    </span>

                                                )}
                                            </div>

                                        );
                                    })}
                                </div>
                            ))}
                        </div>


                        {/* Divider Line */}
                        <hr className="border-white" />

                        {/* Bottom: Across & Down */}
                        <div className="flex gap-2">
                            {/* Across Box */}
                            <div className="bg-[#522136] text-white p-4 rounded-md w-1/2 min-h-[150px]">
                                <span className="font-semibold block mb-2">Across</span>
                                {placedWords
                                    .filter((item) => item.direction === "across")
                                    .map((item, idx) => (
                                        <div key={`${item.index}-${idx}`} className="mb-2 text-sm">
                                            <strong>{item.index + 1}.</strong> {qnaList[item.index].question}
                                        </div>
                                    ))}
                            </div>

                            {/* Down Box */}
                            <div className="bg-[#522136] text-white p-4 rounded-md w-1/2 min-h-[150px]">
                                <span className="font-semibold block mb-2">Down</span>
                                {placedWords
                                    .filter((item) => item.direction === "down")
                                    .map((item, idx) => (
                                        <div key={`${item.index}-${idx}`} className="mb-2 text-sm">
                                            <strong>{item.index + 1}.</strong> {qnaList[item.index].question}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
