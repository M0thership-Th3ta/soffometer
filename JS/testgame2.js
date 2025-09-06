window.addEventListener('load', init);

let gameData = [];
let gameMalleableData = [];
let dayCount = 1;

function init() {
    // Check if data exists in localStorage first
    const storedData = localStorage.getItem('gameData');
    const storedMalleableData = localStorage.getItem('gameMalleableData');
    const storedDayCount = localStorage.getItem('dayCount');

    if (storedData) {
        gameData = JSON.parse(storedData);
        gameMalleableData = storedMalleableData ? JSON.parse(storedMalleableData) : [];
        if (gameMalleableData.length === 0) {
            calculateBMRForAllCharacters();
        }
    } else {
        loadData("../JS/gamedata.json", gameDataLoading);
    }

    dayCount = storedDayCount ? parseInt(storedDayCount) : 1;

    document.getElementById('reset').addEventListener('click', resetGame);
    document.getElementById('sleep').addEventListener('click', sleepAction);
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
        gameMalleableData[index].data.bmr = Number(((9.247 * character.stats.weight) + (3.098 * character.stats.height_cm) - (4.330 * age) + 447.593).toFixed(0));
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
        const randomBreakfastChance = Math.floor(Math.random() * 3);
        let breakfastCalories;

        if (randomBreakfastChance === 0) {
            breakfastCalories = mealCalories + extraCalories;
        } else if (randomBreakfastChance === 1) {
            breakfastCalories = mealCalories - extraCalories;
        } else {
            breakfastCalories = mealCalories;
        }

        // Random variation for lunch (1/3 chance each)
        const randomLunchChance = Math.floor(Math.random() * 3);
        let lunchCalories;

        if (randomLunchChance === 0) {
            lunchCalories = mealCalories + extraCalories;
        } else if (randomLunchChance === 1) {
            lunchCalories = mealCalories - extraCalories;
        } else {
            lunchCalories = mealCalories;
        }

        // Random variation for dinner (1/3 chance each)
        const randomDinnerChance = Math.floor(Math.random() * 3);
        let dinnerCalories;

        if (randomDinnerChance === 0) {
            dinnerCalories = mealCalories + extraCalories;
        } else if (randomDinnerChance === 1) {
            dinnerCalories = mealCalories - extraCalories;
        } else {
            dinnerCalories = mealCalories;
        }

        characterData.data.breakfastMeal = breakfastCalories;
        characterData.data.lunchMeal = lunchCalories;
        characterData.data.dinnerMeal = dinnerCalories;
    });

    // Store updated malleable data in localStorage
    localStorage.setItem('gameMalleableData', JSON.stringify(gameMalleableData));
    console.log("Meal data calculated and stored:", gameMalleableData);
}

function resetGame() {
    // Clear localStorage
    localStorage.removeItem('gameData');
    localStorage.removeItem('gameMalleableData');
    localStorage.removeItem('dayCount');

    // Clear local variables
    gameData = [];
    gameMalleableData = [];
    dayCount = 1;

    localStorage.setItem('dayCount', '1');

    // Reload the page to start fresh
    location.reload();
}

function sleepAction() {
    dayCount++;
    localStorage.setItem('dayCount', dayCount.toString());

    // Recalculate data for all characters
    calculateBMRForAllCharacters();
    calculateMealsForAllCharacters();

    console.log(`Day ${dayCount} started`);
}