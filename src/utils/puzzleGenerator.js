// Generate a valid permutation where no two queens touch diagonally
export function generateQueenPositions(size) {
    while (true) {
        const perm = Array.from({ length: size }, (_, i) => i);
        for (let i = size - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [perm[i], perm[j]] = [perm[j], perm[i]];
        }
        let valid = true;
        for (let i = 0; i < size - 1; i++) {
            if (Math.abs(perm[i] - perm[i + 1]) <= 1) { valid = false; break; }
        }
        if (valid) return perm;
    }
}

// Grow contiguous regions seeded at each queen cell
export function generateRegions(size, queenSolution) {
    const grid = Array.from({ length: size }, () => Array(size).fill(-1));
    const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (let c = 0; c < size; c++) {
        grid[queenSolution[c]][c] = c;
    }

    const inBounds = (r, c) => r >= 0 && r < size && c >= 0 && c < size;

    while (true) {
        const regionNeighbors = Array.from({ length: size }, () => []);

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (grid[r][c] === -1) continue;
                const reg = grid[r][c];
                for (const [dr, dc] of DIRS) {
                    const nr = r + dr, nc = c + dc;
                    if (inBounds(nr, nc) && grid[nr][nc] === -1) {
                        if (!regionNeighbors[reg].some(cell => cell.r === nr && cell.c === nc)) {
                            regionNeighbors[reg].push({ r: nr, c: nc });
                        }
                    }
                }
            }
        }

        const activeRegions = regionNeighbors.reduce((acc, neighbors, i) => {
            if (neighbors.length > 0) acc.push(i);
            return acc;
        }, []);

        if (activeRegions.length === 0) {
            let unassignedLeft = false;
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (grid[r][c] !== -1) continue;
                    unassignedLeft = true;
                    for (const [dr, dc] of DIRS) {
                        const nr = r + dr, nc = c + dc;
                        if (inBounds(nr, nc) && grid[nr][nc] !== -1) {
                            grid[r][c] = grid[nr][nc];
                            break;
                        }
                    }
                }
            }
            if (!unassignedLeft) break;
        } else {
            const chosenReg = activeRegions[Math.floor(Math.random() * activeRegions.length)];
            const neighbors = regionNeighbors[chosenReg];
            const chosenCell = neighbors[Math.floor(Math.random() * neighbors.length)];
            grid[chosenCell.r][chosenCell.c] = chosenReg;
        }
    }
    return grid;
}

// Backtracking solver — counts solutions up to maxToFind (stops early for speed)
export function countSolutions(size, regions, maxToFind) {
    let solutions = 0;
    const colUsed = new Array(size).fill(false);
    const regionUsed = new Array(size).fill(false);

    function solve(r, prevC) {
        if (r === size) { solutions++; return; }
        for (let c = 0; c < size; c++) {
            if (colUsed[c]) continue;
            const reg = regions[r][c];
            if (regionUsed[reg]) continue;
            if (r > 0 && Math.abs(c - prevC) <= 1) continue;
            colUsed[c] = true;
            regionUsed[reg] = true;
            solve(r + 1, c);
            if (solutions >= maxToFind) return;
            colUsed[c] = false;
            regionUsed[reg] = false;
        }
    }

    solve(0, -1);
    return solutions;
}

// Generate a puzzle guaranteed to have exactly one solution
export function generateUniquePuzzle(size) {
    const MAX_ATTEMPTS = 500;
    let bestPuzzle = null;
    let minSolutions = Infinity;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const solution = generateQueenPositions(size);
        const regions = generateRegions(size, solution);
        const solutionsCount = countSolutions(size, regions, 2);

        if (solutionsCount === 1) return { solution, regions };

        if (solutionsCount > 0 && solutionsCount < minSolutions) {
            minSolutions = solutionsCount;
            bestPuzzle = { solution, regions };
        }
    }

    console.warn(`Fallback puzzle used after ${MAX_ATTEMPTS} attempts (${minSolutions} solutions).`);
    return bestPuzzle;
}
