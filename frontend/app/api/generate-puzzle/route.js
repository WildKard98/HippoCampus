import { NextResponse } from 'next/server';

// Add your puzzle logic functions here (buildIndexedLetterMap, etc.)

export async function POST(req) {
    const { qnaList } = await req.json();

    if (!Array.isArray(qnaList) || qnaList.length === 0) {
        return NextResponse.json({ grid: [], placedWords: [] }, { status: 200 });
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

    const indexedLetterMap = buildIndexedLetterMap(words);
    const allConnections = generateIndexedConnections(indexedLetterMap);
    //console.log("🔗 All valid 2-word connections:", allConnections);

    // 🧠 Find clusters of connected words
    const clusters = clusterWordsFromConnections(words, allConnections);
    //console.log("🧩 Found clusters:", clusters);

    // Helper to generate mutations from connections
    function generateMutationsFromConnections(cluster, allConnections) {
        const mutations = []; // Store all valid mutation paths
        const MAX_MUTATIONS = 5000;
        function dfs(path, used, visitedSet) {
            if (mutations.length >= MAX_MUTATIONS) return;
            const lastWord = path[path.length - 1]; // Get the last word in the current path

            if (path.length === cluster.length) { // ✅ If we’ve used all words in the cluster
                mutations.push([...path]); // Save a copy of the valid path
                return; // Stop further recursion
            }

            for (const conn of allConnections) { // 🔁 Loop through all possible connections
                if (
                    conn.from === lastWord &&           // ✅ Must start from the current word
                    cluster.includes(conn.to) &&        // ✅ The target word must be in the cluster
                    !visitedSet.has(conn.to)            // ✅ Make sure we haven’t used this word yet
                ) {
                    visitedSet.add(conn.to);     // Mark the word as visited
                    path.push(conn.to);          // Add it to the current path

                    dfs(path, used, visitedSet); // 🔁 Recurse deeper

                    path.pop();                  // 🧹 Backtrack: remove last word added
                    visitedSet.delete(conn.to); // 🧹 Unmark word as visited
                    if (mutations.length >= MAX_MUTATIONS) return; // short-circuit deeper
                }
            }
        }

        for (const startWord of cluster) {
            if (mutations.length >= MAX_MUTATIONS) break;
            dfs([startWord], new Set(), new Set([startWord])); // 🔁 Start DFS from each word in the cluster
        }

        return mutations; // Return all generated mutation paths
    }

    function placeMutationToGrid(mutation, connections, gridSize, existingGrid = null, offset = null, placedSoFar = []) {

        // 🧱 Create an empty grid of given size (2D array filled with nulls)
        const grid = existingGrid
            ? existingGrid.map(row => [...row]) // 🧠 Clone to avoid mutation
            : Array.from({ length: gridSize }, () => Array(gridSize).fill(null));


        // 📦 Track placed word info (word, direction, location, etc.)
        const placedWords = [];
        const usedAnswerIndices = new Set(); // ✅ TRACK used QnA indexes

        let hasFallback = false;

        // 🎯 Place the first word in the center, horizontally
        const startRow = offset ? offset.row : Math.floor(gridSize / 2);
        const startCol = offset ? offset.col : Math.floor((gridSize - mutation[0].length) / 2);

        // 📝 Write the first word to the grid
        for (let i = 0; i < mutation[0].length; i++) {
            grid[startRow][startCol + i] = mutation[0][i];
        }

        // 📌 Save the placement info for the first word
        let firstIndex = -1;
        for (let k = 0; k < qnaList.length; k++) {
            if (qnaList[k].answer.toUpperCase() === mutation[0] && !usedAnswerIndices.has(k)) {
                firstIndex = k;
                usedAnswerIndices.add(k);
                break;
            }
        }

        placedWords.push({
            word: mutation[0],
            direction: "across",
            start: { row: startRow, col: startCol },
            index: firstIndex, // ✅ Correct index from qnaList
        });


        // 🔁 Try placing all remaining words in the mutation
        for (let i = 1; i < mutation.length; i++) {
            const word = mutation[i];           // current word to place
            const prev = mutation[i - 1];       // previous word it connects to

            // 🔗 Find all valid connections from prev → current word
            const candidateConns = connections.filter(c => c.from === prev && c.to === word);
            let placed = false;

            // 🔁 Try each possible connection until one fits
            for (const conn of candidateConns) {
                const prevPlaced = placedWords.find(p => p.word === conn.from);
                if (!prevPlaced) continue;
                if (placedWords.some(p => p.word === word) || placedSoFar.some(p => p.word === word)) continue;

                // 🧠 Access how the previous word was connected before
                const lastPlaced = placedWords.find(p => p.word === prevPlaced.word);
                const lastToIndex = lastPlaced?.toIndex;
                // 🚫 Enforce 1-block spacing (no direct reuse or adjacent)
                if (
                    lastToIndex !== undefined &&
                    (conn.fromIndex === lastToIndex ||
                        conn.fromIndex === lastToIndex - 1 ||
                        conn.fromIndex === lastToIndex + 1)
                ) {
                    continue; // ❌ Skip this connection — too close to last
                }
                const { row: pr, col: pc } = prevPlaced.start;

                let newRow, newCol, direction;

                if (prevPlaced.direction === "across") {
                    // ↕ If previous was across, current goes down
                    newRow = pr - conn.toIndex;
                    newCol = pc + conn.fromIndex;
                    direction = "down";
                } else {
                    // ↔ If previous was down, current goes across
                    newRow = pr + conn.fromIndex;
                    newCol = pc - conn.toIndex;
                    direction = "across";
                }

                let fits = true; // 🟢 Assume the word fits unless proven otherwise
                for (let k = 0; k < word.length; k++) { // 🔁 Loop through each character in the word
                    // 🧮 Compute the row and column where this character will go
                    const r = direction === "across" ? newRow : newRow + k; // If across, stay on same row; if down, move vertically
                    const c = direction === "across" ? newCol + k : newCol; // If across, move horizontally; if down, stay in same column

                    // 🚫 Check if the position is out of bounds
                    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
                        fits = false; // ❌ Mark as invalid
                        break;        // ⛔ Exit the loop early
                    }

                    const cell = grid[r][c]; // 📦 Get the current cell from the grid

                    // 🚫 Check for letter conflict: cell is filled with a different letter
                    if (cell && cell !== word[k]) {
                        fits = false; // ❌ Mark as invalid
                        break;        // ⛔ Exit the loop early
                    }
                }


                if (!fits) continue; // ❌ Try next connection

                /// 🧱 Check the cell before the first letter and after the last letter
                let endSafe = true; // ✅ Check if ends are clear
                let sideSafe = true; // ✅ Check if side neighbors of first & last letters are clear

                if (direction === "across") { // ↔ Word is placed horizontally
                    const before = grid[newRow]?.[newCol - 1]; // ⬅️ Left of first letter
                    const after = grid[newRow]?.[newCol + word.length]; // ➡️ Right of last letter
                    if ((before && before !== null) || (after && after !== null)) {
                        endSafe = false;
                    }

                    // 🔍 Check up/down of first letter (only if not connection point)
                    if (conn.toIndex !== 0) {
                        const up = grid[newRow - 1]?.[newCol];
                        const down = grid[newRow + 1]?.[newCol];
                        if ((up && up !== null) || (down && down !== null)) {
                            sideSafe = false;
                        }
                    }

                    // 🔍 Check up/down of last letter (only if not connection point)
                    const lastCol = newCol + word.length - 1;
                    if (conn.toIndex !== word.length - 1) {
                        const up = grid[newRow - 1]?.[lastCol];
                        const down = grid[newRow + 1]?.[lastCol];
                        if ((up && up !== null) || (down && down !== null)) {
                            sideSafe = false;
                        }
                    }
                    // 🔁 Check up/down 1 block for all non-connecting letters (middle letters)
                    for (let k = 0; k < word.length; k++) {
                        if (k === conn.toIndex) continue; // 🚫 Skip connection letter

                        const r = newRow;
                        const c = newCol + k;

                        const up = grid[r - 1]?.[c];
                        const down = grid[r + 1]?.[c];

                        if ((up && up !== null) || (down && down !== null)) {
                            sideSafe = false; // ❌ Letter has neighbors above/below
                            break;
                        }
                    }


                } else { // ↕ Word is placed vertically
                    const before = grid[newRow - 1]?.[newCol]; // ⬆️ Above first letter
                    const after = grid[newRow + word.length]?.[newCol]; // ⬇️ Below last letter
                    if ((before && before !== null) || (after && after !== null)) {
                        endSafe = false;
                    }

                    // 🔍 Check left/right of first letter (only if not connection point)
                    if (conn.toIndex !== 0) {
                        const left = grid[newRow]?.[newCol - 1];
                        const right = grid[newRow]?.[newCol + 1];
                        if ((left && left !== null) || (right && right !== null)) {
                            sideSafe = false;
                        }
                    }

                    // 🔍 Check left/right of last letter (only if not connection point)
                    const lastRow = newRow + word.length - 1;
                    if (conn.toIndex !== word.length - 1) {
                        const left = grid[lastRow]?.[newCol - 1];
                        const right = grid[lastRow]?.[newCol + 1];
                        if ((left && left !== null) || (right && right !== null)) {
                            sideSafe = false;
                        }
                    }
                    // 🔁 Check left/right 1 block for all non-connecting letters (middle letters)
                    for (let k = 0; k < word.length; k++) {
                        if (k === conn.toIndex) continue; // 🚫 Skip connection letter

                        const r = newRow + k;
                        const c = newCol;

                        const left = grid[r]?.[c - 1];
                        const right = grid[r]?.[c + 1];

                        if ((left && left !== null) || (right && right !== null)) {
                            sideSafe = false; // ❌ Letter has neighbors left/right
                            break;
                        }
                    }

                }

                // 🚫 Skip this connection if the ends or sides aren't safe
                if (!endSafe || !sideSafe) continue;


                // ✅ All checks passed – now place the word on the grid
                for (let k = 0; k < word.length; k++) { // 🔁 Loop through each letter again to write it to the grid
                    const r = direction === "across" ? newRow : newRow + k; // 🧮 Calculate row
                    const c = direction === "across" ? newCol + k : newCol; // 🧮 Calculate column
                    grid[r][c] = word[k]; // ✍️ Write the character to the grid
                }

                // 🔍 Find the original index of this word from qnaList
                let foundIndex = -1;
                for (let k = 0; k < qnaList.length; k++) {
                    if (qnaList[k].answer.toUpperCase() === word && !usedAnswerIndices.has(k)) {
                        foundIndex = k;
                        usedAnswerIndices.add(k); // ✅ Mark as used
                        break;
                    }
                }

                if (foundIndex === -1) continue; // 🔄 Skip if the word isn't found in the original list

                // 📝 Save the word's placement info for rendering or exporting later
                placedWords.push({
                    word,                   // The word being placed now
                    direction,              // across or down
                    start: { row: newRow, col: newCol },
                    index: foundIndex,      // Index in the qnaList
                    mutationIndex: i,
                    connectedFrom: conn.from,      // ← previous word it's connected from
                    connectedTo: conn.to,          // ← this word (optional; same as `word`)
                    fromIndex: conn.fromIndex,     // ← index in previous word
                    toIndex: conn.toIndex,         // ← index in current word
                });

                placed = true;
                break; // ✅ Done with this word
            }

            if (!placed) {
                const fallbackWord = word;
                hasFallback = true;


                const usedShape = getUsedSize(grid);
                const directions = usedShape.rows >= usedShape.cols ? ["down"] : ["across"];

                for (const direction of directions) {
                    const centerRow = Math.floor(gridSize / 2);
                    const centerCol = Math.floor(gridSize / 2);

                    const rowOffsets = Array.from({ length: gridSize }, (_, i) => i - centerRow).sort((a, b) => Math.abs(a) - Math.abs(b));
                    const colOffsets = Array.from({ length: gridSize }, (_, i) => i - centerCol).sort((a, b) => Math.abs(a) - Math.abs(b));

                    for (const dr of rowOffsets) {
                        const row = centerRow + dr;
                        if (row < 0 || row >= gridSize) continue;

                        for (const dc of colOffsets) {
                            const col = centerCol + dc;
                            if (col < 0 || col >= gridSize) continue;

                            let fits = true;

                            for (let k = 0; k < fallbackWord.length; k++) {
                                const r = direction === "across" ? row : row + k;
                                const c = direction === "across" ? col + k : col;

                                if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
                                    fits = false;
                                    break;
                                }

                                if (grid[r][c] && grid[r][c] !== fallbackWord[k]) {
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
                                        grid[nr][nc] && grid[nr][nc] !== fallbackWord[k]
                                    ) {
                                        fits = false;
                                        break;
                                    }
                                }

                                if (!fits) break;
                            }

                            const beforeR = direction === "across" ? row : row - 1;
                            const beforeC = direction === "across" ? col - 1 : col;
                            const afterR = direction === "across" ? row : row + fallbackWord.length;
                            const afterC = direction === "across" ? col + fallbackWord.length : col;

                            if (grid[beforeR]?.[beforeC] || grid[afterR]?.[afterC]) continue;

                            if (fits) {
                                if (placed == true) {
                                    break;
                                }
                                for (let k = 0; k < fallbackWord.length; k++) {
                                    const r = direction === "across" ? row : row + k;
                                    const c = direction === "across" ? col + k : col;
                                    grid[r][c] = fallbackWord[k];
                                }

                                let foundIndex = -1;
                                for (let k = 0; k < qnaList.length; k++) {
                                    if (
                                        qnaList[k].answer.toUpperCase() === fallbackWord &&
                                        !usedAnswerIndices.has(k)
                                    ) {
                                        foundIndex = k;
                                        usedAnswerIndices.add(k);
                                        break;
                                    }
                                }

                                placedWords.push({
                                    word: fallbackWord,
                                    direction,
                                    start: { row, col },
                                    index: foundIndex,
                                    mutationIndex: i,
                                    connectedFrom: null,
                                    connectedTo: fallbackWord,
                                    fromIndex: null,
                                    toIndex: null,
                                });
                                placed = true;
                                break;
                            }
                        }
                        if (placed) break;
                    }
                }
                if (!placed) break;
            }
            if (!placed) break;
        }
        // ✅ Return the built grid and word placement info
        return {
            grid,
            placedWords: placedSoFar.concat(placedWords),
            hasFallback,
        };

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

    function getNextClusterOffset(grid) {
        let maxRow = 0;
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[0].length; c++) {
                if (grid[r][c]) {
                    maxRow = Math.max(maxRow, r);
                }
            }
        }
        // Start new cluster 3 rows below the last used row
        return { row: maxRow + 3, col: Math.floor(grid[0].length / 2) };
    }



    // 🔁 Loop through all clusters' generated mutations
    let combinedGrid = null;
    let placedSoFar = [];

    for (const { cluster, mutations } of clusterMutations) {
        let bestIsPerfect = false;
        let bestPerfect = null;
        const clusterConnections = allConnections.filter(
            c => cluster.includes(c.from) && cluster.includes(c.to)
        );
        let bestForCluster = null;
        let bestArea = Infinity;
        let attempts = 0;
        for (const mutation of mutations) {
            if (attempts++ > 5000) break;

            // Determine offset: center for first cluster, offset for next clusters
            const offset = combinedGrid ? getNextClusterOffset(combinedGrid) : null;
            const result = placeMutationToGrid(
                mutation,
                clusterConnections,
                gridSize,
                combinedGrid,
                offset,
                placedSoFar
            );
            if (!result) continue;
            const { grid, placedWords, hasFallback } = result;
            const isPerfect = !hasFallback;
            const used = getUsedSize(grid);
            const area = used.rows * used.cols;

            if (!bestForCluster) {
                bestForCluster = { grid, placedWords };
                bestArea = area;
                bestIsPerfect = isPerfect;
                bestPerfect = isPerfect ? { grid, placedWords, area } : null;
            } else {
                const isSmallerEnoughThanPerfect = bestPerfect && area < bestPerfect.area - 49; // 7x7 = 49

                if (isPerfect) {
                    if (!bestIsPerfect || area < bestPerfect.area) {
                        bestPerfect = { grid, placedWords, area };
                        bestForCluster = { grid, placedWords };
                        bestArea = area;
                        bestIsPerfect = true;
                    }
                } else if (!bestIsPerfect || isSmallerEnoughThanPerfect) {
                    bestForCluster = { grid, placedWords };
                    bestArea = area;
                }
            }

        }

        if (bestForCluster) {
            combinedGrid = bestForCluster.grid;
            placedSoFar = bestForCluster.placedWords;
        }
    }

    function assignClueNumbers(placedWords) {
        const clueMap = new Map(); // 🔐 Prevent duplicate clue numbers
        let next = 1;
        for (const word of placedWords) {
            const key = `${word.start.row},${word.start.col}`; // 📍 Identify start cell

            if (!clueMap.has(key)) {
                clueMap.set(key, next++); // 🆕 First time we see this start cell
            }

            word.clueNumber = clueMap.get(key); // 🧠 Share number for same cell
        }
    }

    // ✅ Skip everything if no input, prevent crash at the beginning 
    if (qnaList.length === 0) {
        return NextResponse.json({ grid: [], placedWords: [] });
    }
    assignClueNumbers(placedSoFar);

    // Dummy return (for now)
    return NextResponse.json({
        grid: combinedGrid || [],
        placedWords: placedSoFar || [],
    });
}
