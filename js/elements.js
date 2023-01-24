'use strict'

var gRandomClockInterval
var gRandomGoldInterval
var gRandomThornsInterval
var gThornsTimeOut
var gClockTimeOut
var gGoldTimeOut

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
