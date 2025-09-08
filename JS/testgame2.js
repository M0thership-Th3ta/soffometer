window.addEventListener('load', init);

let gameData = [];
let gameMalleableData = [];
let gameSprites = [];
let gameLines = [];
let dayCount = 1;
let isLoading = false;

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
    document.getElementById('paradise').addEventListener('click', (e) => {
        if (!isLoading) showParadiseMenu();
    });
    document.getElementById('synth').addEventListener('click', (e) => {
        if (!isLoading) showSynthMenu();
    });
    document.getElementById('cotv').addEventListener('click', (e) => {
        if (!isLoading) showCOTVMenu();
    });
    document.getElementById('other').addEventListener('click', (e) => {
        if (!isLoading) showOtherMenu();
    });

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
    gameLines = data;
}

function loadSprites(data) {
    console.log("Sprite data loaded from server");
    gameSprites = data;
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

function showLocationMenu(cityName, locations) {
    if (isLoading) return; // Prevent multiple calls

    isLoading = true;
    const dialogueBox = document.getElementById('dialogue-box');

    const locationOptions = locations.map(loc =>
        `<div class="menu-option" data-location="${loc.id}" data-city="${cityName}">> ${loc.name}</div>`
    ).join('');

    const menuHTML = `
        <div class="location-menu">
            <h3>Welcome to ${cityName}!</h3>
            <p>Where would you like to go?</p>
            <div class="menu-options">
                ${locationOptions}
            </div>
        </div>
    `;

    typeWriter(dialogueBox, menuHTML, 50, () => {
        const menuOptions = dialogueBox.querySelectorAll('.menu-option');
        menuOptions.forEach(option => {
            option.addEventListener('click', handleLocationVisit);
        });
        isLoading = false; // Re-enable buttons after loading completes
    });
}

function showParadiseMenu() {
    const paradiseLocations = [
        { id: 'kfp', name: 'KFP' },
        { id: 'gym', name: 'Burnafat Gym' },
        { id: 'studio', name: 'Westside Recording Studio' },
        { id: 'dock', name: 'The Docks' },
        { id: 'beach', name: 'The Beach' }
    ];
    showLocationMenu('Paradise City', paradiseLocations);
}

function showSynthMenu() {
    const synthLocations = [
        { id: 'mall', name: 'Synthesizer Shopping Mall' },
        { id: 'arcade', name: 'Kool-aid Arcade' },
        { id: 'skatepark', name: 'Raddock Skatepark' },
        { id: 'studio', name: 'Move Your Body Dance Studio' },
        { id: 'pool', name: 'Seabreeze Pool' }
    ];
    showLocationMenu('Synth City', synthLocations);
}

function showCOTVMenu() {
    const cotvLocations = [
        { id: 'mall', name: 'Abyssal Call Mall' },
        { id: 'bar', name: "Seaside Bar 'n Grill" },
        { id: 'restaurant', name: "Diner by the Ocean Restaurant" },
        { id: 'waterpark', name: 'Call of the Splash Waterpark' },
        { id: 'kfp', name: 'KFP' }
    ];
    showLocationMenu('Call of the Void', cotvLocations);
}

function showOtherMenu() {
    const otherLocations = [
        { id: 'school', name: 'Synthwave University' },
        { id: 'hospital', name: 'Synthwave General Hospital' },
        { id: 'park', name: 'Central Park' },
        { id: 'forest', name: 'Synthwave National Forest' }
    ];
    showLocationMenu('Other locations', otherLocations);
}

function hideCityButtons() {
    const buttons = ['paradise', 'synth', 'cotv', 'other'];
    buttons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        button.style.display = 'none';
    });
}

function showCityButtons() {
    const buttons = ['paradise', 'synth', 'cotv', 'other'];
    buttons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        button.style.display = 'block';
    });
}

function handleLocationVisit(event) {
    if (isLoading) return;

    isLoading = true;
    hideCityButtons();

    const location = event.target.getAttribute('data-location');
    const city = event.target.getAttribute('data-city');
    const locationName = event.target.textContent.replace('> ', '').trim(); // Capture the name here
    const dialogueBox = document.getElementById('dialogue-box');
    const gameBg = document.getElementById('game-bg');

    const locationKey = `${city.toLowerCase()}_${location}`;

    const callback = () => {
        // Add 1.5 second delay before starting the scene
        setTimeout(() => {
            isLoading = false;
            startScene(city, location, locationName); // Pass the location name
        }, 1500);
    };

    switch(locationKey) {
        case 'paradise city_kfp':
            typeWriter(dialogueBox, 'You are now at KFP in Paradise City.', 50, callback);
            gameBg.src = '../images/synthwave/bg/kfp.jpg';
            break;
        case 'paradise city_beach':
            typeWriter(dialogueBox, 'You are now at the Beach in Paradise City.', 50, callback);
            gameBg.src = '../images/synthwave/bg/beach.png';
            break;
        case 'synth city_mall':
            typeWriter(dialogueBox, 'You are now at the Mall in Synth City.', 50, callback);
            break;
        default:
            typeWriter(dialogueBox, `You are now at ${event.target.textContent.replace('> ', '')} in ${city}.`, 50, callback);
            break;
    }
}

function startScene(city, location, locationName) {
    // Find characters that can appear at this location
    const availableCharacters = [];

    gameData.forEach((character) => {
        const locationKey = location.toLowerCase();

        // Check if character has this location in their stats
        if (character.stats.locations && character.stats.locations[locationKey]) {
            const spawnChance = character.stats.locations[locationKey];

            availableCharacters.push({
                name: character.character,
                spawnChance: spawnChance,
                characterData: character
            });
        }
    });

    // Select a character based on weighted spawn chances
    const selectedCharacter = selectCharacterForLocation(availableCharacters);

    if (selectedCharacter) {
        showCharacterEncounter(selectedCharacter, locationName);
        return selectedCharacter;
    } else {
        // Clear sprite if no character spawns
        clearCharacterSprite();
        endScene();
        return null;
    }
}

function showCharacterEncounter(selectedCharacter, locationName) {
    const dialogueBox = document.getElementById('dialogue-box');

    const encounterHTML = `
        <p>Entering the ${locationName}, you see ${selectedCharacter.name}</p>
        <div class="encounter-options">
            <div class="menu-option" data-action="approach" data-character="${selectedCharacter.name}"> > approach</div>
            <div class="menu-option" data-action="leave"> > leave</div>
        </div>
    `;

    typeWriter(dialogueBox, encounterHTML, 50, () => {
        const options = dialogueBox.querySelectorAll('.menu-option');
        options.forEach(option => {
            option.addEventListener('click', handleEncounterChoice);
        });
    });
}

function handleEncounterChoice(event) {
    const action = event.target.getAttribute('data-action');
    const characterName = event.target.getAttribute('data-character');

    if (action === 'approach') {
        loadCharacterSprite(characterName);
        const dialogueBox = document.getElementById('dialogue-box');

        // Show approach message first
        typeWriter(dialogueBox, `<p>You approach ${characterName}.</p>`, 50, () => {
            // Wait 1.5 seconds then show acquisition dialogue
            setTimeout(() => {
                showAcquisitionDialogue(characterName);
            }, 1500);
        });
    } else if (action === 'leave') {
        endScene();
    }
}

function showAcquisitionDialogue(characterName) {
    // Find the character's dialogue data (case-insensitive)
    const characterDialogue = gameLines.find(dialogue =>
        dialogue.character.toLowerCase() === characterName.toLowerCase()
    );

    const dialogueBox = document.getElementById('dialogue-box');

    if (characterDialogue && characterDialogue.aquisition) {
        typeWriter(dialogueBox, `<p>"${characterDialogue.aquisition}"</p>`);
    } else {
        typeWriter(dialogueBox, `<p>${characterName} doesn't say anything.</p>`);
    }
}

function loadCharacterSprite(characterName) {
    const characterSprite = document.getElementById('character1-sprite');

    // Find the sprite data for this character (case-insensitive)
    const spriteData = gameSprites.find(sprite =>
        sprite.character.toLowerCase() === characterName.toLowerCase()
    );

    if (spriteData && spriteData.base) {
        // Add '../' since HTML is in pages folder, need to go up one level
        characterSprite.src = `../${spriteData.base}`;
        characterSprite.style.display = 'block';
        console.log(`Loaded sprite for ${characterName}: ${spriteData.base}`);
    } else {
        console.log(`No sprite found for ${characterName}`);
        clearCharacterSprite();
    }
}


function selectCharacterForLocation(availableCharacters) {
    if (availableCharacters.length === 0) return null;

    // Calculate total spawn weight
    const totalWeight = availableCharacters.reduce((sum, char) => sum + char.spawnChance, 0);

    // Generate random number between 1 and total weight
    const randomPick = Math.floor(Math.random() * totalWeight) + 1;

    console.log(`Total spawn weight: ${totalWeight}, Random pick: ${randomPick}`);

    // Find which character the random number corresponds to
    let currentWeight = 0;
    for (let i = 0; i < availableCharacters.length; i++) {
        currentWeight += availableCharacters[i].spawnChance;

        if (randomPick <= currentWeight) {
            console.log(`Selected ${availableCharacters[i].name} (weight range: ${currentWeight - availableCharacters[i].spawnChance + 1}-${currentWeight})`);
            return availableCharacters[i];
        }
    }

    // Fallback (shouldn't happen)
    return availableCharacters[0];
}

function clearCharacterSprite() {
    const characterSprite = document.getElementById('character1-sprite');
    characterSprite.src = '';
    characterSprite.style.display = 'none';
}

function endScene() {
    const dialogueBox = document.getElementById('dialogue-box');
    const gameBg = document.getElementById('game-bg');

    showCityButtons(); // Restore city navigation
    gameBg.src = ''; // Clear background image

    const text = '<p>Where to go next?</p>';
    typeWriter(dialogueBox, text);
}