window.addEventListener('load', init);

let gameData = [];
let gameMalleableData = [];

function init() {
    // Check if data exists in localStorage first
    const storedData = localStorage.getItem('gameData');
    const storedMalleableData = localStorage.getItem('gameMalleableData');

    if (storedData) {
        gameData = JSON.parse(storedData);
        gameMalleableData = storedMalleableData ? JSON.parse(storedMalleableData) : [];
        if (gameMalleableData.length === 0) {
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
    console.log("Game data loaded from server");
    gameData = data;

    // Store game data in localStorage
    localStorage.setItem('gameData', JSON.stringify(data));

    // Initialize malleable data structure
    initializeMalleableData();

    // Calculate malleable data for all characters
    calculateBMRForAllCharacters();
    calculateMealsForAllCharacters();
}

function initializeMalleableData() {
    gameMalleableData = [];

    gameData.forEach(character => {
        gameMalleableData.push({
            character: character.character,
            data: {}
        });
    });

    console.log("Malleable data structure initialized:", gameMalleableData);
}

function calculateBMRForAllCharacters() {
    gameData.forEach((character, index) => {
        const age = isNaN(parseInt(character.stats.age)) ? 50 : parseInt(character.stats.age);
        const bmr = Number(((9.247 * character.stats.weight) + (3.098 * character.stats.height_cm) - (4.330 * age) + 447.593).toFixed(0));

        gameMalleableData[index].data.bmr = bmr;
    });

    // Store malleable data in localStorage
    localStorage.setItem('gameMalleableData', JSON.stringify(gameMalleableData));
    console.log("BMR data calculated and stored:", gameMalleableData);
}

function calculateMealsForAllCharacters() {
    gameMalleableData.forEach(characterData => {
        const mealCalories = Math.round(characterData.data.bmr / 4);
        const extraCalories = Math.round(mealCalories * 0.05);

        // Random variation for breakfast (1/3 chance each)
        const randomChance = Math.floor(Math.random() * 3);
        let breakfastCalories;

        if (randomChance === 0) {
            // Add extra calories
            breakfastCalories = mealCalories + extraCalories;
        } else if (randomChance === 1) {
            // Subtract extra calories
            breakfastCalories = mealCalories - extraCalories;
        } else {
            // Standard meal calories
            breakfastCalories = mealCalories;
        }

        characterData.data.breakfastMeal = breakfastCalories;
        characterData.data.lunchMeal = mealCalories;
        characterData.data.dinnerMeal = mealCalories;
    });

    // Store updated malleable data in localStorage
    localStorage.setItem('gameMalleableData', JSON.stringify(gameMalleableData));
    console.log("Meal data calculated and stored:", gameMalleableData);
}