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

    loadData("../JS/gamelines.json", loadDialogue);
    loadData("../JS/gamesprites.json", loadSprites);

    dayCount = storedDayCount ? parseInt(storedDayCount) : 1;

    document.getElementById('reset').addEventListener('click', resetGame);
    document.getElementById('sleep').addEventListener('click', sleepAction);
    document.getElementById('paradise').addEventListener('click', showParadiseMenu);

    const dialogueBox = document.getElementById('dialogue-box');
    const introText = '<h2>Welcome to Synthwave!</h2><p>Navigate through the system, meet our members, and experience the system in a way not done before. Use the buttons on the right to travel between locations or manage your game. When you meet people you can contact them with the menu to your left.</p>';
    typeWriter(dialogueBox, introText);
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

function loadDialogue(data) {
    console.log("Dialogue data loaded from server");
}

function loadSprites(data) {
    console.log("Sprite data loaded from server");
}

function typeWriter(element, text, speed = 50, callback = null) {
    element.innerHTML = '';

    // Check if text contains HTML
    if (text.includes('<')) {
        // Parse HTML into segments (text and tags)
        const segments = [];
        let tempText = text;
        let lastIndex = 0;

        // Find all HTML tags and their positions
        const tagRegex = /<[^>]+>/g;
        let match;

        while ((match = tagRegex.exec(text)) !== null) {
            // Add text before the tag
            if (match.index > lastIndex) {
                segments.push({
                    type: 'text',
                    content: text.substring(lastIndex, match.index)
                });
            }

            // Add the tag
            segments.push({
                type: 'tag',
                content: match[0]
            });

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            segments.push({
                type: 'text',
                content: text.substring(lastIndex)
            });
        }

        let segmentIndex = 0;
        let charIndex = 0;
        let currentHTML = '';

        function type() {
            if (segmentIndex < segments.length) {
                const currentSegment = segments[segmentIndex];

                if (currentSegment.type === 'tag') {
                    // Add the entire tag at once
                    currentHTML += currentSegment.content;
                    element.innerHTML = currentHTML;
                    segmentIndex++;
                    charIndex = 0;
                    setTimeout(type, speed);
                } else {
                    // Type text character by character
                    if (charIndex < currentSegment.content.length) {
                        currentHTML += currentSegment.content.charAt(charIndex);
                        element.innerHTML = currentHTML;
                        charIndex++;
                        setTimeout(type, speed);
                    } else {
                        segmentIndex++;
                        charIndex = 0;
                        setTimeout(type, speed);
                    }
                }
            } else {
                // Animation complete, call callback if provided
                if (callback) callback();
            }
        }
        type();
    } else {
        // For plain text, use the original method
        let i = 0;
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                // Animation complete, call callback if provided
                if (callback) callback();
            }
        }
        type();
    }
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

function createBackground(scene) {
    console.log("changing scene");
}

function spawnCharacter(character) {
    console.log("Spawning character:", character);
}

function showParadiseMenu() {
    const dialogueBox = document.getElementById('dialogue-box');

    const menuHTML = `
        <div class="location-menu">
            <h3>Welcome to Paradise City!</h3>
            <p>Where would you like to go?</p>
            <div class="menu-options">
                <div class="menu-option" data-location="kfp">> KFP</div>
                <div class="menu-option" data-location="gym">> Gym</div>
                <div class="menu-option" data-location="studio">> Recording Studio</div>
                <div class="menu-option" data-location="park">> Central Park</div>
                <div class="menu-option" data-location="beach">> Beach</div>
            </div>
        </div>
    `;

    typeWriter(dialogueBox, menuHTML, 50, () => {
        const menuOptions = dialogueBox.querySelectorAll('.menu-option');
        menuOptions.forEach(option => {
            option.addEventListener('click', handleParadiseLocation);
        });
    });
}

function handleParadiseLocation(event) {
    const location = event.target.getAttribute('data-location');
    const dialogueBox = document.getElementById('dialogue-box');
    const gameBg = document.getElementById('game-bg');

    switch(location) {
        case 'kfp':
            typeWriter(dialogueBox, 'You are now at KFP in Paradise City.');
            break;
        case 'gym':
            typeWriter(dialogueBox, 'You are now at the Gym in Paradise City.');
            break;
        case 'studio':
            typeWriter(dialogueBox, 'You are now at the Recording Studio in Paradise City.');
            break;
        case 'park':
            typeWriter(dialogueBox, 'You are now at Central Park in Paradise City.');
            break;
        case 'beach':
            typeWriter(dialogueBox, 'You are now at the Beach in Paradise City.');
            gameBg.src = '../images/synthwave/bg/beach.png';
            break;
        default:
            typeWriter(dialogueBox, '');
            break;
    }
}