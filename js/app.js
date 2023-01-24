'use strict'

//// Game Elements
const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BOX = 'BOX'
const TARGET = 'TARGET'
const CAT = 'CAT'
const THORNS = 'THORNS'
const CLOCK = 'CLOCK'
const GOLD = 'GOLD'

//// Images
const CAT_IMG = '<img src="img/user.png" />'
const CLOCK_IMG = '<img src="img/clock.png"/>'
const GOLD_IMG = '<img src="img/gold.png"/>'
const THORNS_IMG = '<img src="img/thorns.png"/>'

//// HTML Elements
const gH1El = document.querySelector('h1')
const gH2El = document.querySelector('h2')
const gH2SpanEl = document.querySelector('h2 span')
const gBodyEl = document.querySelector('body')

///////
var gMovement
var gBoard
var gUserPos
var gPlayerScore
var gIsGameFinished
var gTargetsMarked
var gFreeSteps
var gRandomClockInterval
var gRandomGoldInterval
var gRandomThornsInterval
var gThornsTimeOut
var gClockTimeOut
var gGoldTimeOut

// Initiate game
function initGame() {
  restartGame()
  gUserPos = { i: 2, j: 2 }
  gBoard = buildBoard()
  renderBoard(gBoard)
  setIntervals()
}

// Create board
function buildBoard() {
  // Create the Matrix
  var board = createMat(11, 11)

  // Put FLOOR everywhere and WALL at edges
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      // Put FLOOR in a regular cell
      var cell = { type: FLOOR, gameElement: null, isTarget: false }

      // Place Walls at edges
      if (
        i === 0 ||
        i === board.length - 1 ||
        j === 0 ||
        j === board[0].length - 1
      ) {
        cell.type = WALL
      }

      board[i][j] = cell
    }
  }

  createLevel(board)

  // Place the user at selected position
  board[gUserPos.i][gUserPos.j].gameElement = CAT

  return board
}

// Render the board to an HTML table
function renderBoard(board) {
  var strHTML = ''
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>\n'
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j]
      var cellClass = getClassName({ i: i, j: j })

      if (currCell.type === BOX) cellClass += ' box'
      else if (currCell.type === FLOOR) cellClass += ' floor'
      else if (currCell.type === TARGET) cellClass += ' target'
      else cellClass += ' wall'

      //TODO - Change To template string
      strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})" >\n`

      // TODO - change to switch case statement
      switch (currCell.gameElement) {
        case CAT:
          strHTML += CAT_IMG
          break
        default:
          break
      }
      strHTML += '\t</td>\n'
    }
    strHTML += '</tr>\n'
  }
  var elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

/// Create the level
function createLevel(board) {
  //// Settings floors
  board[0][0].type = FLOOR
  board[0][1].type = FLOOR
  board[1][1].type = FLOOR
  board[0][10].type = FLOOR
  board[1][10].type = FLOOR
  board[2][10].type = FLOOR
  board[3][8].type = FLOOR
  board[4][8].type = FLOOR

  //// Settings Walls
  board[1][1].type = WALL
  board[1][2].type = WALL
  board[0][7].type = WALL
  board[1][9].type = WALL
  board[2][9].type = WALL
  board[3][9].type = WALL
  board[3][1].type = WALL
  board[3][8].type = WALL
  board[3][7].type = WALL
  board[4][7].type = WALL
  board[4][6].type = WALL
  board[5][7].type = WALL
  board[3][2].type = WALL
  board[4][2].type = WALL
  board[4][3].type = WALL
  board[5][2].type = WALL
  board[7][9].type = WALL
  board[9][4].type = WALL
  board[8][4].type = WALL
  board[8][5].type = WALL

  //// Settings Boxes
  board[2][3].type = BOX
  board[8][7].type = BOX
  board[3][4].type = BOX
  board[4][4].type = BOX
  board[6][1].type = BOX
  board[6][3].type = BOX
  board[6][4].type = BOX
  board[6][5].type = BOX
  board[8][2].type = BOX

  //// Settings Targets
  board[2][1].type = TARGET
  board[1][8].type = TARGET
  board[3][6].type = TARGET
  board[4][1].type = TARGET
  board[8][1].type = TARGET
  board[5][4].type = TARGET
  board[4][8].type = TARGET
  board[9][9].type = TARGET
  board[1][8].isTarget = true
  board[2][1].isTarget = true
  board[3][6].isTarget = true
  board[4][8].isTarget = true
  board[4][1].isTarget = true
  board[5][4].isTarget = true
  board[8][1].isTarget = true
  board[9][9].isTarget = true
}

// Move the player to a specific location
function moveTo(i, j) {
  if (gMovement) {
    var targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return

    // Calculate distance to make sure we are moving to a neighbor cell
    var iAbsDiff = Math.abs(i - gUserPos.i)
    var jAbsDiff = Math.abs(j - gUserPos.j)
    // console.log('i - gUserPos.i',i - gUserPos.i)
    // console.log('j - gUserPos.j',j - gUserPos.j)

    // var diffI
    // var diffJ

    // If the clicked Cell is one of the four allowed
    if (
      (iAbsDiff === 1 && jAbsDiff === 0) ||
      (jAbsDiff === 1 && iAbsDiff === 0)
    ) {
      // Checking if game over
      if (!gFreeSteps) {
        gPlayerScore--
        if (!gPlayerScore) {
          var audio = new Audio('sounds/lose.wav')
          audio.play()
          finishGame('YOU LOST')
        }
      }

      // Allowing mouse gameplay

      if (j > gUserPos.j) pushBoxLeftOrRight('right')
      else if (j < gUserPos.j) pushBoxLeftOrRight('left')
      else if (i > gUserPos.i) pushBoxUpOrDown('down')
      else if (i < gUserPos.i) pushBoxUpOrDown('up')

      // MOVING from current position
      // Model:

      gBoard[gUserPos.i][gUserPos.j].gameElement = null

      // if Clock was collected
      if (gFreeSteps) {
        removeClass({ i: gUserPos.i, j: gUserPos.j }, 'green')
      }
      addClass({ i: gUserPos.i, j: gUserPos.j }, 'floor')
      // Dom:
      renderCell(gUserPos, '')

      // MOVING to selected position
      gUserPos.i = i
      gUserPos.j = j

      //// stepOn functions
      if (targetCell.gameElement === CLOCK) {
        stepOnClock(i, j)
      } else if (targetCell.gameElement === GOLD) {
        stepOnGold(i, j)
      } else if (targetCell.gameElement === THORNS) {
        stepOnThorns()
      }

      // Model:

      gBoard[gUserPos.i][gUserPos.j].gameElement = CAT
      renderCell(gUserPos, CAT_IMG)

      // DOM:
      if (gFreeSteps) {
        handleFreeSteps()
      } else {
        // renderCell(gUserPos, CAT_IMG)
      }
    }
    gH2SpanEl.innerText = gPlayerScore
  }
}

function helperFunction(i, j) {}

// Handing free steps
function handleFreeSteps(i, j) {
  /// Handing free steps, making sure that
  /// that the target class isnt disappearing
  /// and that the green img is added properly
  renderCell(gUserPos, CAT_IMG)
  addClass({ i: gUserPos.i, j: gUserPos.j }, 'green')
  removeClass({ i: gUserPos.i, j: gUserPos.j }, 'target')
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard[0].length; j++) {
      if (
        gBoard[i][j].isTarget &&
        !getElement(i, j).classList.contains('target') &&
        gBoard[i][j].gameElement !== CAT &&
        gBoard[i][j].type !== BOX
      ) {
        getElement(i, j).classList.add('target')
      }
    }
  }
  removeClass({ i: gUserPos.i, j: gUserPos.j }, 'floor')
}

// Move the player by keyboard arrows
function handleKey(event) {
  var i = gUserPos.i
  var j = gUserPos.j

  switch (event.key) {
    case 'ArrowLeft':
      pushBoxLeftOrRight('left')
      if (j === 0) j = gBoard[0].length - 1
      else j--
      break
    case 'ArrowRight':
      pushBoxLeftOrRight('right')
      if (j === gBoard[0].length - 1) j = 0
      else j++
      break
    case 'ArrowUp':
      pushBoxUpOrDown('up')
      if (i === 0) i = gBoard.length - 1
      else i--
      break
    case 'ArrowDown':
      pushBoxUpOrDown('down')
      if (i === gBoard.length - 1) i = 0
      else i++
      break
  }

  moveTo(i, j)
}

// Push box up or down
function pushBoxUpOrDown(UpOrDown) {
  var actionOne
  var actionTwo
  UpOrDown === 'up' ? (actionOne = -1) : (actionOne = +1)
  UpOrDown === 'up' ? (actionTwo = -2) : (actionTwo = +2)

  if (!gIsGameFinished) {
    gMovement = true
    /// check for foul moves
    if (
      (gBoard[gUserPos.i + actionOne][gUserPos.j].type === BOX &&
        gBoard[gUserPos.i + actionTwo][gUserPos.j].type === WALL) ||
      (gBoard[gUserPos.i + actionOne][gUserPos.j].type === BOX &&
        gBoard[gUserPos.i + actionTwo][gUserPos.j].type === BOX)
    ) {
      gMovement = false
    } else if (gBoard[gUserPos.i + actionOne][gUserPos.j].type === BOX) {
      // CHECK IF TARGET MARKED //
      checkTargetMarked('upDown', actionOne, actionTwo)
      // Cat
      // gBoard[gUserPos.i + actionOne][gUserPos.j].gameElement = CAT
      gBoard[gUserPos.i + actionOne][gUserPos.j].type = FLOOR
      renderCell({ i: gUserPos.i + actionOne, j: gUserPos.j }, CAT_IMG)

      // Box
      gBoard[gUserPos.i + actionTwo][gUserPos.j].type = BOX
      removeClass({ i: gUserPos.i + actionOne, j: gUserPos.j }, 'box')

      addClass({ i: gUserPos.i + actionOne, j: gUserPos.j }, 'floor')
      addClass({ i: gUserPos.i + actionTwo, j: gUserPos.j }, 'box')
    }
  }
}

// Push box left or right
function pushBoxLeftOrRight(leftOrRight) {
  var actionOne
  var actionTwo
  leftOrRight === 'left' ? (actionOne = -1) : (actionOne = +1)
  leftOrRight === 'left' ? (actionTwo = -2) : (actionTwo = +2)
  if (!gIsGameFinished) {
    gMovement = true
    /// check for foul moves
    if (
      (gBoard[gUserPos.i][gUserPos.j + actionOne].type === BOX &&
        gBoard[gUserPos.i][gUserPos.j + actionTwo].type === WALL) ||
      (gBoard[gUserPos.i][gUserPos.j + actionOne].type === BOX &&
        gBoard[gUserPos.i][gUserPos.j + actionTwo].type === BOX)
    ) {
      gMovement = false
    } else if (gBoard[gUserPos.i][gUserPos.j + actionOne].type === BOX) {
      // CHECK IF TARGET MARKED
      checkTargetMarked('leftRight', actionOne, actionTwo)
      // Cat
      // gBoard[gUserPos.i][gUserPos.j + actionOne].gameElement = CAT
      gBoard[gUserPos.i][gUserPos.j + actionOne].type = FLOOR
      renderCell({ i: gUserPos.i, j: gUserPos.j + actionOne }, CAT_IMG)

      // Box
      gBoard[gUserPos.i][gUserPos.j + actionTwo].type = BOX
      removeClass({ i: gUserPos.i, j: gUserPos.j + actionOne }, 'box')
      addClass({ i: gUserPos.i, j: gUserPos.j + actionTwo }, 'box')
      addClass({ i: gUserPos.i, j: gUserPos.j + actionOne }, 'floor')
    }
  }
}

// Check if victory for left or right movements
function checkVictory(upDownOrLeftRight, actionOne) {
  /// if its left and right movements
  if (upDownOrLeftRight === 'leftRight') {
    if (gTargetsMarked === 8) {
      gBoard[gUserPos.i][gUserPos.j + actionOne].type = FLOOR
      gBoard[gUserPos.i][gUserPos.j].gameElement = null
      renderCell({ i: gUserPos.i, j: gUserPos.j }, '')
      gBoard[gUserPos.i][gUserPos.j + actionOne].gameElement = CAT
      renderCell({ i: gUserPos.i, j: gUserPos.j + actionOne }, CAT_IMG)
      finishGame('YOU WIN 👑')
      var sound = new Audio('sounds/win.wav')
      sound.play()
    }
  } else {
    /// if its up and down movements
    if (gTargetsMarked === 8) {
      gBoard[gUserPos.i + actionOne][gUserPos.j].type = FLOOR
      gBoard[gUserPos.i][gUserPos.j].gameElement = null
      renderCell({ i: gUserPos.i, j: gUserPos.j }, '')
      gBoard[gUserPos.i + actionOne][gUserPos.j].gameElement = CAT
      renderCell({ i: gUserPos.i + actionOne, j: gUserPos.j }, CAT_IMG)
      finishGame('YOU WIN 👑')
      var sound = new Audio('sounds/win.wav')
      sound.play()
    }
  }
}

// Check target marked for left or right movements
function checkTargetMarked(upDownLeftOrRight, actionOne, actionTwo) {
  // If its left and right movements
  if (upDownLeftOrRight === 'leftRight') {
    if (
      gBoard[gUserPos.i][gUserPos.j + actionOne].type === BOX &&
      gBoard[gUserPos.i][gUserPos.j + actionTwo].isTarget === true
    ) {
      gTargetsMarked++
      removeClass({ i: gUserPos.i, j: gUserPos.j + actionTwo }, 'target')
      checkVictory('leftRight', actionOne)
    } else if (gBoard[gUserPos.i][gUserPos.j + actionOne].isTarget === true) {
      gTargetsMarked--
      addClass({ i: gUserPos.i, j: gUserPos.j + actionOne }, 'target')
    }
  } else {
    // If its up and down movements
    if (
      gBoard[gUserPos.i + actionOne][gUserPos.j].type === BOX &&
      gBoard[gUserPos.i + actionTwo][gUserPos.j].isTarget === true
    ) {
      gTargetsMarked++
      removeClass({ i: gUserPos.i + actionTwo, j: gUserPos.j }, 'target')
      checkVictory('upDown', actionOne)
    } else if (gBoard[gUserPos.i + actionOne][gUserPos.j].isTarget === true) {
      gTargetsMarked--
      addClass({ i: gUserPos.i + actionOne, j: gUserPos.j }, 'target')
    }
  }
}

// Stepping on thorns
function stepOnThorns() {
  var audio = new Audio('sounds/meow.mp3')
  audio.play()
  gPlayerScore -= 5
  gIsGameFinished = true
  gMovement = false
  addClass({ i: gUserPos.i, j: gUserPos.j }, 'red')
  removeClass({ i: gUserPos.i, j: gUserPos.j }, 'floor')
  setTimeout(() => {
    removeClass({ i: gUserPos.i, j: gUserPos.j }, 'red')
    addClass({ i: gUserPos.i, j: gUserPos.j }, 'floor')
    gMovement = true
    gIsGameFinished = false
  }, 3000)
}

// Step on gold
function stepOnGold(i, j) {
  var audio = new Audio('sounds/gold.wav')
  audio.play()
  gPlayerScore += 100
  addClass({ i: gUserPos.i, j: gUserPos.j }, 'green')
  removeClass({ i: gUserPos.i, j: gUserPos.j }, 'floor')
  setTimeout(() => {
    addClass({ i: gUserPos.i, j: gUserPos.j }, 'floor')
  }, 2000)
}

// Step on clock
function stepOnClock() {
  var audio = new Audio('sounds/timer.mp3')
  audio.play()
  gFreeSteps = true
  setTimeout(() => {
    getElement(gUserPos.i, gUserPos.j).classList.remove('green')
    getElement(gUserPos.i, gUserPos.j).classList.add('floor')
    gFreeSteps = false
  }, 10000)
}

// add random clock in board
function addRandomClock() {
  var emptyCell = spawnRandomElement(CLOCK, CLOCK_IMG)
  gClockTimeOut = setTimeout(() => {
    if (gBoard[emptyCell.i][emptyCell.j].gameElement === CLOCK) {
      removeElement(emptyCell)
    }
  }, 5000)
}

// Add random gold in board
function addRandomGold() {
  var emptyCell = spawnRandomElement(GOLD, GOLD_IMG)
  gGoldTimeOut = setTimeout(() => {
    if (gBoard[emptyCell.i][emptyCell.j].gameElement === GOLD) {
      removeElement(emptyCell)
    }
  }, 4000)
}

// Spawn random thorns on board
function addRandomThorns() {
  var emptyCell = spawnRandomElement(THORNS, THORNS_IMG)
  gThornsTimeOut = setTimeout(() => {
    if (gBoard[emptyCell.i][emptyCell.j].gameElement === THORNS) {
      removeElement(emptyCell)
    }
  }, 3000)
}

// Finish game
function finishGame(winOrLose) {
  gIsGameFinished = true
  gMovement = false
  gH1El.innerText = `${winOrLose}`
  resetIntervals()

  return true
}

// Restart game
function restartGame() {
  resetIntervals()
  gH1El.innerText = 'SOKOBAN'
  gFreeSteps = false
  gIsGameFinished = false
  gTargetsMarked = 0
  gMovement = true
  gPlayerScore = 100
  gH2SpanEl.innerText = gPlayerScore
}

// Intervals
function setIntervals() {
  gRandomClockInterval = setInterval(() => addRandomClock(), 12000)
  gRandomGoldInterval = setInterval(() => addRandomGold(), 17000)
  gRandomThornsInterval = setInterval(() => addRandomThorns(), 7000)
}

// reset Intervals
function resetIntervals() {
  clearInterval(gRandomClockInterval)
  clearInterval(gRandomGoldInterval)
  clearInterval(gRandomThornsInterval)
  clearTimeout(gClockTimeOut)
  clearTimeout(gGoldTimeOut)
  clearTimeout(gThornsTimeOut)
  gClockTimeOut = null
  gGoldTimeOut = null
  gThornsTimeOut = null
  gRandomClockInterval = null
  gRandomGoldInterval = null
  gRandomThornsInterval = null
}
