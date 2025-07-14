const playArea = document.querySelector('.play-area');
const currentScore = document.querySelector('.score');
const highestScore = document.querySelector('.high-score');
const leaderboard = document.querySelector('.leaderboard');
const leaderboardContainer = document.querySelector('.leaderboard-container');

let foodX;
let foodY;

let snakeX = 5;
let snakeY = 10;

let speedX = 0;
let speedY = 0;

let snakeTail = [];
let gameEnd = false;

let intervalSet;

let score = 0;
let highScore = localStorage.getItem('high-score') || 0;
highestScore.innerHTML = `Highest Score: ${highScore}`;

const displayLeaderboard = () => {
    const leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];

    // Display up to the top 10 users
    const topUsers = leaderboardData.slice(0, 10);

    leaderboardData.innerHTML = ''

    topUsers.forEach((entry, index) => {
        leaderboardContainer.innerHTML += `<p><span>${index + 1}.</span> ${entry.name}: ${entry.score}</p>`;
    });
};

const addToLeaderboard = (name, score) => {
    const leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];

    // Check if the user already exists in the leaderboard
    const existingUserIndex = leaderboardData.findIndex(entry => entry.name === name);

    if (existingUserIndex !== -1) {
        // If the user exists, update the score only if the new score is higher
        if (score > leaderboardData[existingUserIndex].score) {
            leaderboardData[existingUserIndex].score = score;
        }
    } else {
        // Add a new entry if the user doesn't exist
        leaderboardData.push({ name, score });
    }

    // Sort the leaderboard in descending order
    leaderboardData.sort((a, b) => b.score - a.score);

    // Save the updated leaderboard back to localStorage
    localStorage.setItem('leaderboard', JSON.stringify(leaderboardData));

    // Clear the current leaderboard container
    leaderboardContainer.innerHTML = '';

    // Display up to the top 10 users
    const topUsers = leaderboardData.slice(0, 10);

    topUsers.forEach((entry, index) => {
        leaderboardContainer.innerHTML += `<p><span>${index + 1}.</span> ${entry.name}: ${entry.score}</p>`;
    });
};

const scoreCheck = () => {
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (loggedInUser) {
        addToLeaderboard(loggedInUser, score);
    }
    location.reload();
};



const foodPosition = () => {
    foodX = Math.floor(Math.random() * 40) + 1;
    foodY = Math.floor(Math.random() * 40) + 1;
};

const handleGameEnd = () => {
    clearInterval(intervalSet);
    alert('Game Over!');

    scoreCheck();

};

const keyDirection = (e) => {
    if (e.key === 'ArrowUp' && speedY !== 1) {
        speedX = 0;
        speedY = -1;
    } else if (e.key === 'ArrowDown' && speedY !== -1) {
        speedX = 0;
        speedY = 1;
    } else if (e.key === 'ArrowLeft' && speedX !== 1) {
        speedX = -1;
        speedY = 0;
    } else if (e.key === 'ArrowRight' && speedX !== -1) {
        speedX = 1;
        speedY = 0;
    }
};

const startGame = () => {
    // localStorage.clear();
    if (gameEnd) {
        return handleGameEnd();
    }

    let foodElement = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    if (snakeX === foodX && snakeY === foodY) {
        foodPosition();
        snakeTail.push([foodX, foodY]);
        score++;

        highScore = score >= highScore ? score : highScore;
        localStorage.setItem('high-score', highScore);
        currentScore.innerHTML = `Score: ${score}`;
    }

    for (let i = snakeTail.length - 1; i > 0; i--) {
        snakeTail[i] = snakeTail[i - 1];
    }

    snakeTail[0] = [snakeX, snakeY];

    snakeX += speedX;
    snakeY += speedY;

    if (snakeX <= 0 || snakeX > 40 || snakeY <= 0 || snakeY > 40) {
        gameEnd = true;
    }

    for (let i = 0; i < snakeTail.length; i++) {
        foodElement += `<div class="snake-head" style="grid-area: ${snakeTail[i][1]} / ${snakeTail[i][0]}"></div>`;

        if (i !== 0 && snakeTail[0][1] === snakeTail[i][1] && snakeTail[0][0] === snakeTail[i][0]) {
            gameEnd = true;
        }
    }

    playArea.innerHTML = foodElement;
};

foodPosition();
intervalSet = setInterval(startGame, 125);
document.addEventListener('keydown', keyDirection);

// Display leaderboard on page load
displayLeaderboard();