'use strict'

/// Create Matrix
function createMat(ROWS, COLS) {
  var mat = []
  for (var i = 0; i < ROWS; i++) {
    var row = []
    for (var j = 0; j < COLS; j++) {
      row.push('')
    }
    mat.push(row)
  }

  return mat
}

// Find empty cell in board
function findEmptyCells(board) {
  var emptyCells = []
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (
        !board[i][j].gameElement &&
        board[i][j].type !== WALL &&
        board[i][j].type !== BOX &&
        !board[i][j].isTarget
      ) {
        emptyCells.push({ i, j })
      }
    }
  }
  return emptyCells
}

/// Spawn random element
function spawnRandomElement(element, elementImg) {
  var emptyCells = findEmptyCells(gBoard)

  // Find random empty cell
  var emptyCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  // Updating model
  gBoard[emptyCell.i][emptyCell.j].gameElement = element
  // Updating DOM
  renderCell(emptyCell, elementImg)
  return { i: emptyCell.i, j: emptyCell.j }
}

// Remove element
function removeElement(emptyCell) {
  gBoard[emptyCell.i][emptyCell.j].gameElement = null
  renderCell(emptyCell, '')
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
  var cellSelector = '.' + getClassName(location)
  var elCell = document.querySelector(cellSelector)
  elCell.innerHTML = value
}

// Add class
function addClass(location, value) {
  var cellSelector = '.' + getClassName(location)
  var elCell = document.querySelector(cellSelector)
  elCell.classList.add(`${value}`)
}

// Remove class
function removeClass(location, value) {
  var cellSelector = '.' + getClassName(location)
  var elCell = document.querySelector(cellSelector)
  elCell.classList.remove(`${value}`)
}

// Returns the class name for a specific cell
function getClassName(location) {
  var cellClass = 'cell-' + location.i + '-' + location.j
  return cellClass
}

function getElement(i, j) {
  return document.querySelector(`.cell-${i}-${j}`)
}
