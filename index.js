/**
 * VARIABLES
 */

/**
 * @typedef  {Object} MatrixObject
 * @property {Fields} field
 * @property {Figures} figure
 */

/**
 * Indicate if field have some figure on it
 * @enum {number}
 */
const Figures = {
  None: -1,
  Small: 0,
  Medium: 1,
  Big: 2,
};

/**
 * @enum {number}
 */
const Player = {
  P1: 1,
  P2: 2,
};

/**
 * Indicate if field is alredy taken by player or its empty
 * @enum {number}
 */
const Fields = {
  Empty: 0,
  P1: Player.P1,
  P2: Player.P2,
};

/**
 * Store object
 */
const store = {
  grid: initGrid(),
  remaining: {
    p1: initFigures(),
    p2: initFigures(),
  },
  onMove: Player.P1,
};

/**
 * ELEMENTS
 */

const container = document.querySelector('.container');

const restartButton = container.querySelector('#restartGame');
restartButton.addEventListener('click', handleRestartButton);

const grid = container.querySelector('.grid');

const remaining = {
  el: container.querySelector('.remaining'),
  p1: document.querySelector('.remaining .p1'),
  p2: document.querySelector('.remaining .p2'),
};

/**
 * FUNCTIONS
 */

/**
 * return Matrix of field and figures object
 * @returns {MatrixObject[][]} matrix 3x3
 */
function initGrid() {
  return new Array(3).fill(0).map(() =>
    new Array(3).fill(0).map(() => ({
      field: Fields.Empty,
      figure: Figures.None,
    }))
  );
}

/**
 * Return array of figures user can use in game
 * @returns {Figures[]} figures
 */
function initFigures() {
  return new Array(2)
    .fill(Figures.Small)
    .concat(new Array(2).fill(Figures.Medium))
    .concat(new Array(2).fill(Figures.Big));
}

function drawGrid() {
  grid.innerHTML = '';
  let rowIndex = 0;

  for (let row of store.grid) {
    let fieldIndex = 0;
    const div = document.createElement('div');
    div.classList.add('row');
    div.classList.add('row-' + rowIndex++);

    for (let item of row) {
      const field = document.createElement('div');
      field.classList.add('field');
      field.classList.add('field-' + fieldIndex++);

      switch (item.field) {
        case Fields.P1:
          field.classList.add('P1');
          break;
        case Fields.P2:
          field.classList.add('P2');
          break;
        case Fields.Empty:
        default:
          field.classList.add('Empty');
          break;
      }

      switch (item.figure) {
        case Figures.Big:
          field.classList.add('Big');
          break;
        case Figures.Medium:
          field.classList.add('Medium');
          break;
        case Figures.Small:
          field.classList.add('Small');
          break;
        case Figures.None:
        default:
          field.classList.add('Empty');
      }

      field.addEventListener('dragenter', handleDragEnter);
      field.addEventListener('dragover', handleDragOver);
      field.addEventListener('dragleave', handleDragLeave);
      field.addEventListener('drop', handleDrop);

      div.appendChild(field);
    }
    grid.appendChild(div);
  }
}

function drawRemainingItems() {
  const {
    remaining: { p1, p2 },
  } = store;

  const countEach = (arr) => arr.reduce((t, c) => ((t[c] = t[c] || 0), t[c]++, t), {});

  [countEach(p1), countEach(p2)].forEach((p, ix) => {
    const div = remaining['p' + (ix + 1)];
    div.classList.add('item');
    div.innerHTML = '';

    Object.entries(p)
      .reverse()
      .forEach(([figure, count]) => {
        const div2 = document.createElement('div');
        div2.classList.add('field');
        div2.classList.add('P' + (ix + 1));
        div2.draggable = true;

        let dragFigure = Figures.None;
        const dragPlayer = Player['P' + (ix + 1)];

        switch (Number(figure)) {
          case Figures.Big:
            dragFigure = Figures.Big;
            div2.classList.add('Big');
            break;
          case Figures.Medium:
            dragFigure = Figures.Medium;
            div2.classList.add('Medium');
            break;
          case Figures.Small:
            dragFigure = Figures.Small;
            div2.classList.add('Small');
            break;
          case Figures.None:
          default:
            dragFigure = Figures.None;
            div2.classList.add('Empty');
            break;
        }
        div2.innerText = count;
        div2.addEventListener('dragstart', handleDragStart.bind(null, dragFigure, dragPlayer));
        div2.addEventListener('dragend', handleDragEnd.bind(null, dragFigure, dragPlayer));
        div.appendChild(div2);
      });
  });
}

function handleRestartButton() {
  store.grid = initGrid();
  store.remaining.p1 = initFigures();
  store.remaining.p2 = initFigures();

  handleNextMove(Player.P1);
}

function handleNextMove(onMove) {
  store.onMove = onMove || (store.onMove === Player.P1 ? Player.P2 : Player.P1);

  
  drawGrid();
  drawRemainingItems();
  
  remaining.p1.classList.toggle('flip');
  remaining.p2.classList.toggle('flip');

  if(checkWinConditions()){
    alert("Player " + Player["P"+(3 - draggingStore.store.draggingPlayer)] + " won");
    return handleRestartButton();
  }
}

/**
 * CALLS
 */

handleRestartButton();

/**
 * DRAGGING
 */
const defaultDraggingStore = {
  isDragging: false,
  draggingEl: null,
  draggingFigure: null,
  draggingPlayer: null,
};

let draggingStore = { store: { ...defaultDraggingStore } };

function handleDragStart(figure, player, e) {
  draggingStore.store.draggingFigure = figure;
  draggingStore.store.draggingPlayer = player;
  draggingStore.store.isDragging = true;
  draggingStore.store.draggingEl = e.target;
}
function handleDragEnd(figure, player, e) {
  draggingStore = { store: { ...defaultDraggingStore } };
  handleDragLeave(e);
}
function handleDragEnter(e) {
  e.target.classList.add('dragging');
  if (calcIfThisCanBeDropped(e.target)) {
    e.target.classList.add('green');
  } else {
    e.target.classList.add('red');
  }
}
function handleDragOver(e) {
  e.preventDefault();
}
function handleDragLeave(e) {
  e.target.classList.remove('dragging');
  e.target.classList.remove('green');
  e.target.classList.remove('red');
}
function handleDrop(e) {
  if (calcIfThisCanBeDropped(e.target)) {
    const p = draggingStore.store.draggingPlayer === Player.P1 ? 'p1' : 'p2';
    let removed = false;
    store.remaining[p] = store.remaining[p].filter((f) => {
      if (!removed && f === draggingStore.store.draggingFigure) {
        removed = true;
        return false;
      }
      return true;
    });

    const x = parseInt(e.target.classList.value.match(/field-(\d)+/)[1]); // x
    const y = parseInt(e.target.parentNode.classList.value.match(/row-(\d)+/)[1]); // y
    store.grid[y][x] = {
      field: draggingStore.store.draggingPlayer,
      figure: draggingStore.store.draggingFigure,
    };

    handleNextMove();
  }
  handleDragLeave(e);
}

function calcIfThisCanBeDropped(el) {
  const holdingEl = el.classList.contains('Big')
    ? Figures.Big
    : el.classList.contains('Medium')
    ? Figures.Medium
    : el.classList.contains('Small')
    ? Figures.Small
    : Figures.None;
  const holdingPlayer = el.classList.contains('P1')
    ? Fields.P1
    : el.classList.contains('P2')
    ? Fields.P2
    : Fields.Empty;
  if (
    holdingEl === Figures.None ||
    holdingPlayer === Fields.Empty ||
    (draggingStore.store.draggingFigure > holdingEl &&
      holdingPlayer !== draggingStore.store.draggingPlayer)
  ) {
    return true;
  }
  return false;
}

function checkWinConditions(){
  const checkIfAllSame = (arr)=>arr.every(el=>el.field != Fields.Empty && el.field === arr[0].field);
  let winCondition = checkIfAllSame(store.grid[0]) || checkIfAllSame(store.grid[1]) || checkIfAllSame(store.grid[2]);
  winCondition = winCondition || checkIfAllSame(
    [
      store.grid[0][0],
      store.grid[1][0],
      store.grid[2][0]
    ]
  )|| checkIfAllSame(
    [
      store.grid[0][1],
      store.grid[1][1],
      store.grid[2][1]
    ]
  )|| checkIfAllSame(
    [
      store.grid[0][2],
      store.grid[1][2],
      store.grid[2][2]
    ]
  )
  winCondition = winCondition || checkIfAllSame(
    [
      store.grid[0][0],
      store.grid[1][1],
      store.grid[2][2]
    ]
  )|| checkIfAllSame(
    [
      store.grid[0][2],
      store.grid[1][1],
      store.grid[2][0]
    ]
  )


  return winCondition;
}