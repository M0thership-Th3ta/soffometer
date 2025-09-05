window.addEventListener('load', init);

let gameData = [];
let gameMaluableData = [];

function init() {
    // Check if data exists in localStorage first
    const storedData = localStorage.getItem('gameData');
    const storedMaluableData = localStorage.getItem('gameMaluableData');

    if (storedData) {
        gameData = JSON.parse(storedData);
        characterBMRData = storedMaluableData ? JSON.parse(storedMaluableData) : {};
        console.log("Game data loaded from localStorage");
        calculateBMRForAllCharacters();
        if (Object.keys(characterBMRData).length === 0) {
            calculateBMRForAllCharacters();
        }
    } else {
        loadData("../JS/gamedata.json", gameDataLoading);
    }
}

function loadData(url, successHandler){
    fetch(url).then(response => {
        if(!response.ok){
            throw new Error(response.statusText);
        }
        return response.json();
    })
        .then(successHandler)
        .catch(errorHandler)
}

function errorHandler(error){
    console.error(error)
}

function gameDataLoading(data){
    console.log("game data loaded")
}

function calculateBMR(Character, Weight, CM, Age){
    BMR = Number(((9.247 * Weight) + (3.098 * CM) - (4.330 * Age) + 447.593).toFixed(0));
}