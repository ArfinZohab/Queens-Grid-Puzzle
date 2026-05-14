# Queens Grid Puzzle
A interactive web application based on the classical problem of N-Queens and the puzzle [Eight queens puzzle](https://en.wikipedia.org/wiki/Eight_queens_puzzle).
Place $N$ queens on an $N \times N$ grid divided into uniquely coloured regions according to strict logic rules.

---
## Game Rules & Goals
The objective of the game is to successfully place exactly **$N$ Queens** on the $N \times N$ board such that all of the following conditions are met simultaneously:
1. **Row**: Exactly one Queen must be present in each horizontal row.
2. **Column**: Exactly one Queen must be present in each vertical column.
3. **Region**: Exactly one Queen must be present inside each uniquely colored region.
4. **Touch**: No two Queens may touch each other horizontally, vertically, or diagonally.

---
## How to Play
Interact with the grid cells using standard mouse clicks or touch gestures to manage your board deductions:
- **Click Once (Cross / X)**: Places an **X** mark in the cell. Use this to track cells where you deduce a Queen cannot be placed.
- **Click Twice (Queen / Crown)**: Places a **Queen** in the cell.
- **Click & Drag (Mass Draw/Erase)**: Touch or click and drag continuously across cells to rapidly fill multiple empty cells with **X** marks, or drag starting from an existing **X** mark to erase them consecutively.
- **Click Thrice (Clear)**: Empties the cell back to its original blank state.
- **Auto Cross Toggle**: Enable the Auto Cross switch in the navigation header to automatically fill **X** marks in all intersecting rows, columns, regions, and neighbouring contact spots instantly whenever a Queen is placed.

---
