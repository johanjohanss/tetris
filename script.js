
//Decode cookies function
function decode() {
    let cookies = document.cookie
      .split(";")
      .map((cookie) => cookie.split("="))
      .reduce(
        (accumulator, [key, value]) => ({
          ...accumulator,
          [key.trim()]: decodeURIComponent(value),
        }),
        {}
      );
    return cookies;
}

//TETRIS CODE
function playTetris() {
  "use strict";

  const width = 10;
  let nextRandom = 0;
  let score = 0;
  let reset = 0;

  let grid = document.querySelector(".grid");
  let minigrid = document.querySelector(".mini-grid");

  //GET HIGHSCORE
  let checkCookies = decode();

  let hsDiv = document.getElementById("highscore");
  hsDiv.innerHTML = "";
  let p = document.createElement("p");
  hsDiv.appendChild(p);

  if (checkCookies.highscore !== undefined) {
    let hsValue = document.createTextNode(
      "Highscore: " + checkCookies.highscore
    );
    p.appendChild(hsValue);
  } else {
    let hsValue = document.createTextNode("Highscore: 0");
    p.appendChild(hsValue);
  }
  //----------------

  for (let i = 0; i < 200; i++) {
    let div = document.createElement("div");
    grid.appendChild(div);
  }

  for (let i = 0; i < 10; i++) {
    let div = document.createElement("div");
    div.setAttribute("class", "taken");
    grid.appendChild(div);
  }

  for (let i = 0; i < 16; i++) {
    let div = document.createElement("div");
    minigrid.appendChild(div);
  }

  let squares = Array.from(document.querySelectorAll(".grid div"));

  const scoreDisplay = document.querySelector("#score");
  const startBtn = document.querySelector("#start-button");
  let timerId;

  //Defining the shapes
  const lTetromino = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
  ];

  const zTetromino = [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
  ];

  const tTetromino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1],
  ];

  const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ];

  const iTetromino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ];

  const tetrominoes = [
    lTetromino,
    zTetromino,
    tTetromino,
    oTetromino,
    iTetromino,
  ];

  let currentPosition = 4;
  let currentRotation = 0;

  let random = Math.floor(Math.random() * tetrominoes.length); //tetrominoes.length = 5

  //current tilldelas en slumpmässig form och dess rotation
  let current = tetrominoes[random][0];

  //draw

  function draw() {
    //för varje index som formen har (varje koordinat), sätts klassen tetromino
    current.forEach((index) => {
      squares[currentPosition + index].classList.add("tetromino");
    });
  }

  //undraw
  function undraw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove("tetromino");
    });
  }

  //let timerId = setInterval(moveDown, 1000);

  //assign functions to keycodes
  function control(e) {
    e.preventDefault();

    if (e.keyCode === 37) {
      moveLeft();
    } else if (e.keyCode === 38) {
      rotate();
    } else if (e.keyCode === 39) {
      moveRight();
    } else if (e.keyCode === 40) {
      moveDown();
    }
  }
  document.addEventListener("keydown", control);

  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }

  //some - kollar om det är sant för någon av sakerna i arrayen och utför isåfall if statement
  function freeze() {
    if (
      current.some((index) =>
        squares[currentPosition + index + width].classList.contains("taken")
      )
    ) {
      current.forEach((index) =>
        squares[currentPosition + index].classList.add("taken")
      ); //ger klassen "taken" för att även ge dessa block "hit detection"
      random = nextRandom;
      nextRandom = Math.floor(Math.random() * tetrominoes.length); //ny random shape
      current = tetrominoes[random][currentRotation];
      currentPosition = 4;
      draw();
      displayShape();
      addScore();
      gameOver();
      //den formen som rörde sig nedåt stannar av sig själv eftersom funktionen draw nu har börjat om på pos 4.
    }
    //för varje index => kollar vi om squares för raden under den rad som index är ritad på
    //har klassen taken. Om detta är sant för något av indexen så körs if satsen
  }

  function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some(
      (index) => (currentPosition + index) % width === 0
    );

    if (!isAtLeftEdge) {
      currentPosition -= 1;
    }

    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      currentPosition += 1;
    }

    draw();
  }

  function moveRight() {
    undraw();
    const isAtRightEdge = current.some(
      (index) => (currentPosition + index) % width === width - 1
    );

    if (!isAtRightEdge) {
      currentPosition += 1;
    }

    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      currentPosition -= 1;
    }

    draw();
  }

  function rotate() {
    undraw();

    currentRotation++;
    if (currentRotation === current.length) {
      currentRotation = 0;
    }

    current = tetrominoes[random][currentRotation];

    //rotation fix - makes it so it can't rotate through previous shapes
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      currentRotation--;
      current = tetrominoes[random][currentRotation];
    }

    draw();
  }

  const displaySquares = document.querySelectorAll(".mini-grid div");
  const displayWidth = 4;
  let displayIndex = 0;

  //Tetrominoes without their rotations
  const nextTetrominoes = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2], //l
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //z
    [1, displayWidth, displayWidth + 1, displayWidth + 2], //t
    [0, 1, displayWidth, displayWidth + 1], //o
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], //i
  ];

  //display shape in mini-grid
  function displayShape() {
    displaySquares.forEach((square) => {
      square.classList.remove("tetromino");
    });

    nextTetrominoes[nextRandom].forEach((index) => {
      displaySquares[displayIndex + index].classList.add("tetromino");
    });
  }

  startBtn.addEventListener("click", function () {
    const soundtrack = document.querySelector("audio");
    soundtrack.play();

    //om timerId inte är null
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      draw();
      timerId = setInterval(moveDown, 1000);

      //kollar reset variabeln så att inte nästa form byts varje gång man pausar
      if (reset === 0) {
        nextRandom = Math.floor(Math.random() * tetrominoes.length);
        displayShape();
        reset++;
      }
    }
  });

  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [
        i,
        i + 1,
        i + 2,
        i + 3,
        i + 4,
        i + 5,
        i + 6,
        i + 7,
        i + 8,
        i + 9,
      ];

      if (row.every((index) => squares[index].classList.contains("taken"))) {
        score += 10;
        scoreDisplay.innerHTML = score;
        row.forEach((index) => {
          squares[index].classList.remove("taken");
          squares[index].classList.remove("tetromino");
        });
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach((cell) => grid.appendChild(cell));
      }
    }
  }

  // game over

  function gameOver() {
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      scoreDisplay.innerHTML = score + ", Game Over!";

      var cookies = decode();

      if (cookies.highscore === undefined) {
        document.cookie = "highscore=" + score;
      }

      if (cookies.highscore !== undefined) {
        if (score > cookies.highscore) {
          document.cookie = "highscore=" + score;
        }
      }

      cookies = decode();
      console.log("high score is" + cookies.highscore);

      let hsDiv = document.getElementById("highscore");
      hsDiv.innerHTML = "";
      let hsValue = document.createTextNode("Highscore: " + cookies.highscore);

      let p = document.createElement("p");
      p.appendChild(hsValue);
      hsDiv.appendChild(p);

      clearInterval(timerId);
      const soundtrack = document.querySelector("audio");
      soundtrack.pause();
    }
  }
}

playTetris();