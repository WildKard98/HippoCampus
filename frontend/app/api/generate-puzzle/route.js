import { NextResponse } from 'next/server';

// Add your puzzle logic functions here (buildIndexedLetterMap, etc.)

export async function POST(req) {
    const { qnaList } = await req.json();

    if (!Array.isArray(qnaList) || qnaList.length === 0) {
        return NextResponse.json({ grid: [], placedWords: [] }, { status: 400 });
    }

    const words = qnaList.map(q => q.answer.toUpperCase());

    // Insert your buildIndexedLetterMap, generateIndexedConnections, clusterWordsFromConnections, etc.
    // Then use them here to generate your puzzle

    // 🧠 Build indexed letter map function (new!)
    function buildIndexedLetterMap(words) {
        const map = {};
        for (const word of words) {
            for (let i = 0; i < word.length; i++) {
                const letter = word[i];
                if (!map[letter]) map[letter] = [];
                map[letter].push({ word, index: i });
            }
        }
        return map;
    }

    // 🔗 Build indexed connections from the indexed map
    function generateIndexedConnections(indexedLetterMap) {
        const connections = [];

        for (const [letter, entries] of Object.entries(indexedLetterMap)) {
            for (let i = 0; i < entries.length; i++) {
                for (let j = 0; j < entries.length; j++) {
                    if (i === j) continue;

                    const from = entries[i];
                    const to = entries[j];

                    if (from.word === to.word) continue; // ❌ skip same word

                    connections.push({
                        from: from.word,
                        to: to.word,
                        via: letter,
                        fromIndex: from.index,
                        toIndex: to.index,
                    });
                }
            }
        }

        return connections;
    }
    function clusterWordsFromConnections(words, connections) {
        const graph = {};
        for (const word of words) {
            graph[word] = new Set();
        }

        for (const conn of connections) {
            graph[conn.from].add(conn.to);
            graph[conn.to].add(conn.from); // bi-directional
        }

        const visited = new Set();
        const clusters = [];

        for (const word of words) {
            if (visited.has(word)) continue;

            const cluster = new Set();
            const queue = [word];

            while (queue.length) {
                const current = queue.pop();
                if (visited.has(current)) continue;
                visited.add(current);
                cluster.add(current);

                for (const neighbor of graph[current]) {
                    if (!visited.has(neighbor)) {
                        queue.push(neighbor);
                    }
                }
            }

            clusters.push(Array.from(cluster));
        }

        return clusters;
    }

    // build the puzzle
    // find longest word length
    const longestWordLength = Math.max(...qnaList.map(item => item.answer.length), 0);

    // build the grid size base on double the length of the longest word
    const gridSize = Math.max(10, longestWordLength * 2);

    // build empty grid puzzle


    // ✅ Skip everything if no input, prevent crash at the beginning 
    if (qnaList.length === 0) {
        return { grid, placedWords };
    }
    const indexedLetterMap = buildIndexedLetterMap(words);
    const allConnections = generateIndexedConnections(indexedLetterMap);
    console.log("🔗 All valid 2-word connections:", allConnections);

    // 🧠 Find clusters of connected words
    const clusters = clusterWordsFromConnections(words, allConnections);
    console.log("🧩 Found clusters:", clusters);
    // Helper to generate mutations from connections
    function generateMutationsFromConnections(cluster, allConnections) {
        const mutations = [];

        function dfs(path, used, visitedSet) {
            const lastWord = path[path.length - 1];

            if (path.length === cluster.length) {
                mutations.push([...path]);
                return;
            }

            for (const conn of allConnections) {
                if (conn.from === lastWord && cluster.includes(conn.to) && !visitedSet.has(conn.to)) {
                    visitedSet.add(conn.to);
                    path.push(conn.to);
                    dfs(path, used, visitedSet);
                    path.pop();
                    visitedSet.delete(conn.to);
                }
            }
        }

        for (const startWord of cluster) {
            dfs([startWord], new Set(), new Set([startWord]));
        }

        return mutations;
    }
    function placeMutationToGrid(mutation, connections, gridSize) {
        const grid = Array.from({ length: gridSize }, () =>
            Array.from({ length: gridSize }, () => null)
        );
        const placedWords = [];

        // Place the first word in the center
        const startRow = Math.floor(gridSize / 2);
        const startCol = Math.floor((gridSize - mutation[0].length) / 2);

        for (let i = 0; i < mutation[0].length; i++) {
            grid[startRow][startCol + i] = mutation[0][i];
        }

        placedWords.push({
            word: mutation[0],
            direction: "across",
            start: { row: startRow, col: startCol },
            index: 0,
        });

        // Place remaining words
        for (let i = 1; i < mutation.length; i++) {
            const word = mutation[i];
            const prev = mutation[i - 1];

            // Find the connection used
            const conn = connections.find(c => c.from === prev && c.to === word);
            if (!conn) continue;

            const prevPlaced = placedWords.find(p => p.word === conn.from);
            if (!prevPlaced) continue;

            const { row: pr, col: pc } = prevPlaced.start;

            let newRow, newCol, direction;
            if (prevPlaced.direction === "across") {
                // Place down
                newRow = pr - conn.toIndex;
                newCol = pc + conn.fromIndex;
                direction = "down";
            } else {
                // Place across
                newRow = pr + conn.fromIndex;
                newCol = pc - conn.toIndex;
                direction = "across";
            }

            let fits = true;
            for (let k = 0; k < word.length; k++) {
                const r = direction === "across" ? newRow : newRow + k;
                const c = direction === "across" ? newCol + k : newCol;

                if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
                    fits = false;
                    break;
                }

                const cell = grid[r][c];
                if (cell && cell !== word[k]) {
                    fits = false;
                    break;
                }
            }

            if (!fits) break;

            for (let k = 0; k < word.length; k++) {
                const r = direction === "across" ? newRow : newRow + k;
                const c = direction === "across" ? newCol + k : newCol;
                grid[r][c] = word[k];
            }

            const foundIndex = qnaList.findIndex(q => q.answer.toUpperCase() === word);
            if (foundIndex === -1) continue; // ⛔ skip if not found

            placedWords.push({
                word,
                direction,
                start: { row: newRow, col: newCol },
                index: foundIndex,
            });

        }

        return { grid, placedWords };
    }


    // 🔁 Generate mutations for each cluster
    const clusterMutations = clusters.map(cluster => {
        const clusterWords = cluster;
        const clusterConns = allConnections.filter(c => clusterWords.includes(c.from) && clusterWords.includes(c.to));
        const mutations = generateMutationsFromConnections(clusterWords, clusterConns);

        return {
            cluster,
            mutations
        };
    });

    console.log("🧩 All cluster mutations:", clusterMutations);
    let saverPuzzle = {
        grid: [],
        placedWords: [],
        fallbackCount: Infinity,
        usedRows: Infinity,
        usedCols: Infinity,
    };
    
    function getUsedSize(grid) {
        let top = grid.length, bottom = 0, left = grid[0].length, right = 0;
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[0].length; c++) {
                if (grid[r][c]) {
                    top = Math.min(top, r);
                    bottom = Math.max(bottom, r);
                    left = Math.min(left, c);
                    right = Math.max(right, c);
                }
            }
        }
        return { rows: bottom - top + 1, cols: right - left + 1 };
    }
    
    for (const { mutations } of clusterMutations) {
        for (const mutation of mutations) {
            const { grid, placedWords } = placeMutationToGrid(mutation, allConnections, gridSize);
    
            const usedAnswers = placedWords.map(p => p.word);
            const fallbackWords = words.filter(w => !usedAnswers.includes(w));
            const fallbackCount = fallbackWords.length;
    
            // Place fallback words with spacing
            const shape = getUsedSize(grid);
            const isWider = shape.cols >= shape.rows;
    
            let fallbackPlacedWords = [];
            for (const word of fallbackWords) {
                let placed = false;

const directions = isWider ? ["across", "down"] : ["down", "across"];

for (const direction of directions) {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            let fits = true;

            for (let k = 0; k < word.length; k++) {
                const r = direction === "across" ? row : row + k;
                const c = direction === "across" ? col + k : col;

                if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
                    fits = false;
                    break;
                }

                if (grid[r][c] && grid[r][c] !== word[k]) {
                    fits = false;
                    break;
                }

                const neighbors = [
                    [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
                    [r - 1, c - 1], [r - 1, c + 1], [r + 1, c - 1], [r + 1, c + 1]
                ];
                for (const [nr, nc] of neighbors) {
                    if (
                        nr >= 0 && nr < gridSize &&
                        nc >= 0 && nc < gridSize &&
                        grid[nr][nc] && grid[nr][nc] !== word[k]
                    ) {
                        fits = false;
                        break;
                    }
                }

                if (!fits) break;
            }

            const beforeR = direction === "across" ? row : row - 1;
            const beforeC = direction === "across" ? col - 1 : col;
            const afterR = direction === "across" ? row : row + word.length;
            const afterC = direction === "across" ? col + word.length : col;

            if (grid[beforeR]?.[beforeC] || grid[afterR]?.[afterC]) continue;

            if (fits) {
                for (let k = 0; k < word.length; k++) {
                    const r = direction === "across" ? row : row + k;
                    const c = direction === "across" ? col + k : col;
                    grid[r][c] = word[k];
                }

                fallbackPlacedWords.push({
                    word,
                    direction,
                    start: { row, col },
                    index: qnaList.findIndex(q => q.answer.toUpperCase() === word),
                });

                placed = true;
                break;
            }
        }
        if (placed) break;
    }
    if (placed) break;
}

            }
    
            const totalPlacedWords = placedWords.concat(fallbackPlacedWords);
            const used = getUsedSize(grid);
    
            // Early skip if worse than saver
            if (
                fallbackCount > saverPuzzle.fallbackCount ||
                (fallbackCount === saverPuzzle.fallbackCount &&
                    (used.rows * used.cols >= saverPuzzle.usedRows * saverPuzzle.usedCols))
            ) continue;
    
            // Save it!
            saverPuzzle = {
                grid,
                placedWords: totalPlacedWords,
                fallbackCount,
                usedRows: used.rows,
                usedCols: used.cols,
            };
    
            // 🔁 Optional: Break early if no fallback
            if (fallbackCount === 0) break;
        }
    }
    

    // ✅ Skip everything if no input, prevent crash at the beginning 
    if (qnaList.length === 0) {
        return { grid, placedWords };
    }

    // Dummy return (for now)
    return NextResponse.json({
        grid: saverPuzzle.grid,
        placedWords: saverPuzzle.placedWords,
    });
    

}
