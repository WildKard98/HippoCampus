"use client";
import React, { useState, useEffect } from "react";

// Dynamically set grid size based on longest word
const getDynamicGridSize = (words) => {
    let longestWord = words.reduce((max, word) => Math.max(max, word.length), 0);
    return Math.max(longestWord + 4, 10); // Ensure at least a 10x10 grid
};


const emptyCell = "."; // Placeholder for empty cells

const extractWords = (studySet) => {
    if (!studySet || !studySet.terms) return [];
    return studySet.terms.map(item => item.term.toUpperCase());
};


// ✅ Function to check if a word can be placed in the grid
const canPlaceWord = (grid, word, row, col, direction, gridSize) => {
    const length = word.length;

    if (direction === "H") {
        if (col + length > grid.length) return false; // Prevent overflow    
        for (let i = 0; i < length; i++) {
            const cell = grid[row][col + i];
            if (cell !== emptyCell && cell !== word[i]) return false;
        }
    } else {
        if (row + length > grid.length) return false; // Prevent overflow
        for (let i = 0; i < length; i++) {
            const cell = grid[row + i][col];
            if (cell !== emptyCell && cell !== word[i]) return false;
        }
    }
    return true;
};

// ✅ Function to place a word in the grid
const placeWord = (grid, word, row, col, direction) => {
    for (let i = 0; i < word.length; i++) {
        if (direction === "H") {
            grid[row][col + i] = word[i];
        } else {
            grid[row + i][col] = word[i];
        }
    }
};

// ✅ Function to generate crossword grid
const generateCrossword = (words, gridSize = 15) => { // ✅ Accepts grid size as a parameter

    if (!words || words.length === 0) {
        console.warn("No words provided for the crossword puzzle.");
        return { grid: [], placedWords: [] }; // Return an empty crossword if words are missing
    }

    let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(emptyCell)); // Use `emptyCell`
    // Sort words by length (longest first) to maximize placement success
    words = words.filter(word => word && word.length > 0).sort((a, b) => b.length - a.length);

    if (words.length === 0) {
        console.warn("No valid words available after filtering.");
        return { grid, placedWords: [] };
    }

    let placedWords = [];

    // Center the first word correctly
    let startRow = Math.floor(gridSize / 2) - Math.floor(words[0].length / 2);
    let startCol = Math.floor(gridSize / 2) - Math.floor(words[0].length / 2);
    placeWord(grid, words[0], startRow, startCol, "H");
    placedWords.push({ word: words[0], row: startRow, col: startCol, dir: "H" });

    // Improved Word Placement: Prioritizes intersections first
    for (let i = 1; i < words.length; i++) {
        let word = words[i];
        let placed = false;

        // Try to place the word where it shares a letter with an existing word
        for (let existingWord of placedWords) {
            for (let j = 0; j < existingWord.word.length; j++) {
                for (let k = 0; k < word.length; k++) {
                    if (existingWord.word[j] === word[k]) {
                        let newRow = existingWord.row + (existingWord.dir === "H" ? 0 : j - k);
                        let newCol = existingWord.col + (existingWord.dir === "H" ? j - k : 0);
                        let newDirection = existingWord.dir === "H" ? "V" : "H";

                        if (canPlaceWord(grid, word, newRow, newCol, newDirection)) {
                            placeWord(grid, word, newRow, newCol, newDirection);
                            placedWords.push({ word, row: newRow, col: newCol, dir: newDirection });
                            placed = true;
                            break;
                        }
                    }
                }
                if (placed) break;
            }
            if (placed) break;
        }

        // If no intersection is found, try placing in open spaces first before random
        if (!placed) {
            let bestSpot = null;
            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    if (canPlaceWord(grid, word, r, c, "H", gridSize)) {
                        bestSpot = { row: r, col: c, dir: "H" };
                    } else if (canPlaceWord(grid, word, r, c, "V", gridSize)) {
                        bestSpot = { row: r, col: c, dir: "V" };
                    }
                    if (bestSpot) break;
                }
                if (bestSpot) break;
            }

            if (bestSpot) {
                placeWord(grid, word, bestSpot.row, bestSpot.col, bestSpot.dir);
                placedWords.push({ word, row: bestSpot.row, col: bestSpot.col, dir: bestSpot.dir });
            }
        }
    }

    return { grid, placedWords };
};

// ✅ React Component to Render Crossword Puzzle
const CrosswordPuzzle = ({ studySet }) => {
    const [crossword, setCrossword] = useState({ grid: [], placedWords: [] });

    useEffect(() => {
        if (studySet) {
            const words = extractWords(studySet);
            const dynamicGridSize = getDynamicGridSize(words); // ✅ Now calculated dynamically
            const newCrossword = generateCrossword(words, dynamicGridSize);
            setCrossword(newCrossword);

        }
    }, [studySet]);

    return (
        <div className="flex flex-col items-center p-6 bg-[#3B0B24] min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-4">Crossword Puzzle</h1>

            {/* Crossword Grid */}
            <div className="grid" style={{ gridTemplateColumns: `repeat(${crossword.grid.length}, 1fr)` }}>
                {crossword.grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-8 h-8 flex items-center justify-center text-lg font-bold rounded-lg ${cell !== emptyCell ? "bg-gray-700" : "bg-transparent"
                                }`}
                        >
                            {cell !== emptyCell ? cell : ""}
                        </div>
                    ))
                )}
            </div>

            {/* Crossword Clues */}
            <div className="mt-6">
                <h2 className="text-2xl font-semibold">Clues</h2>
                <div className="flex gap-8 mt-2">
                    <div>
                        <h3 className="text-xl">Across</h3>
                        <ul>
                            {crossword.placedWords
                                .filter((w) => w.dir === "H")
                                .map((w, i) => (
                                    <li key={i}>{i + 1}. {w.word}</li>
                                ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl">Down</h3>
                        <ul>
                            {crossword.placedWords
                                .filter((w) => w.dir === "V")
                                .map((w, i) => (
                                    <li key={i}>{i + 1}. {w.word}</li>
                                ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrosswordPuzzle;
