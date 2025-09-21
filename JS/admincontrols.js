window.addEventListener('load', init);

//globals
let weight, cm, age;
let BMR, mealCalories;
let selectedMember;
import { defaultKinks } from './jsoncreator.js';
let globalData = null;

function init(){
    loadData("../JS/data.json", memberListLoading);

    // Add event listener for ingested calories input
    const ingestedCaloriesInput = document.querySelector("#ingested-calories");
    const satisfiedCheck = document.querySelector("#satisfied-check");

    ingestedCaloriesInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") { // Check if Enter key is pressed
            const ingestedCalories = Number(ingestedCaloriesInput.value);

            if (ingestedCalories > mealCalories) {
                satisfiedCheck.textContent = "I'm satisfied";
            } else {
                satisfiedCheck.textContent = "I'm not satisfied";
            }
            calculateWeightChange(ingestedCalories);
        }
    });
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

function memberListLoading(data){
    globalData = data;
    const idSelect = document.querySelector("#id-select");
    const memberSelect = document.querySelector("#member-select");

    // Populate the ID dropdown
    Object.keys(data).forEach(id => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = id;
        idSelect.appendChild(option);
    });

    // Add event listener to update the member dropdown based on selected ID
    idSelect.addEventListener("change", () => {
        const selectedId = idSelect.value;
        memberSelect.innerHTML = '<option value="">--Select a Member--</option>'; // Reset members
        memberSelect.disabled = !selectedId;

        if (selectedId && data[selectedId]) {
            data[selectedId].forEach(member => {
                const option = document.createElement("option");
                option.value = member.id;
                option.textContent = member.name || member.id; // Use name or ID as display text
                memberSelect.appendChild(option);
            });
        }
    });

    // Add event listener to update global variables when a member is selected
    memberSelect.addEventListener("change", () => {
        const selectedId = idSelect.value;
        const selectedMemberId = memberSelect.value;

        if (selectedId && selectedMemberId) {
            selectedMember = data[selectedId].find(member => member.id === selectedMemberId);
            console.log("Selected Member:", selectedMember);

            if (selectedMember) {
                calculateDaysToBirthday(selectedMember);
            }

            if (selectedMember && selectedMember.details) {
                weight = selectedMember.details.weight || null;
                cm = selectedMember.details.cm || null;

                // Check and set age
                age = selectedMember.details.age;
                if (typeof age !== "number" || isNaN(age)) {
                    age = 50; // Default to 50 if age is not a valid number
                } else if (age > 50) {
                    age = 50; // Cap age at 50
                }

                // Calculate BMR if all required values are available
                if (weight && cm && age) {
                    calculateBMR(weight, cm, age);
                } else {
                    console.warn("Missing data for BMR calculation.");
                }
            } else {
                console.warn("Details not found for the selected member.");
                weight = null;
                cm = null;
                age = 50; // Default to 50 if details are missing
            }
        } else {
            weight = null;
            cm = null;
            age = 50; // Default to 50 if no member is selected
        }
    });
    // Populate the heaviest list
    populateHeaviestList(data);
    populateKinkSelect();
    const kinkSelect = document.getElementById('member-kink-select');
    const membersList = document.getElementById('members-kinks-ul');
    if (kinkSelect && membersList) {
        kinkSelect.addEventListener('change', function() {
            const selectedKink = this.value;
            const members = listMembersWithKink(selectedKink);
            membersList.innerHTML = members.map(name => `<li>${name}</li>`).join('');
            addRandomPicker('random-kink-btn', 'members-kinks-ul', 'random-kink-result');
        });
    }
    populateFoodSelect();
    const foodSelect = document.getElementById('member-food-select');
    const membersFoodList = document.getElementById('members-food-ul');
    if (foodSelect && membersFoodList) {
        foodSelect.addEventListener('change', function() {
            const selectedFood = this.value;
            const members = listMembersWithFood(selectedFood);
            membersFoodList.innerHTML = members.map(name => `<li>${name}</li>`).join('');
            addRandomPicker('random-food-btn', 'members-food-ul', 'random-food-result');
        });
    }
}

function calculateDaysToBirthday(member) {
    if (!member || !member.details || !member.details.birthday) {
        console.error("Invalid member or birthday not available.");
        return null;
    }

    const birthdayParts = member.details.birthday.split("/");
    const day = parseInt(birthdayParts[0], 10);
    const month = parseInt(birthdayParts[1], 10);

    // Calculate the days from January 1st
    const birthdayDate = new Date(0, month - 1, day); // Year is irrelevant
    const janFirst = new Date(0, 0, 1);
    const diffInDays = Math.ceil((birthdayDate - janFirst) / (1000 * 60 * 60 * 24));

    // Calculate the total days from January 1st to today
    const today = new Date();
    const daysFromJanFirstToToday = Math.ceil((today - new Date(today.getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24));

    // Update cycle position to include both diffInDays and daysFromJanFirstToToday
    const cycleLength = 32;
    const cyclePosition = (diffInDays + daysFromJanFirstToToday) % cycleLength;

    console.log("Days from January 1st to Birthday:", diffInDays);
    console.log("Days from January 1st to Today:", daysFromJanFirstToToday);
    console.log("Updated Cycle Position:", cyclePosition);

    const getPregnantButton = document.querySelector("#get-pregnant");
    const isPregnantElement = document.querySelector("#is-pregnant");

    getPregnantButton.addEventListener("click", () => {
        if (cyclePosition >= 0 && cyclePosition <= 24) {
            const randomNumber = Math.floor(Math.random() * 100) + 1; // Random number between 1 and 100
            if (randomNumber >= 1 && randomNumber <= 26) {
                isPregnantElement.textContent = "is pregnant";
            } else {
                isPregnantElement.textContent = "is not pregnant";
            }
        } else if (cyclePosition >= 25 && cyclePosition <= 28) {
            const randomNumber = Math.floor(Math.random() * 100) + 1; // Random number between 1 and 100
            if (randomNumber >= 1 && randomNumber <= 33) {
                isPregnantElement.textContent = "is pregnant";
            } else {
                isPregnantElement.textContent = "is not pregnant";
            }
        } else if (cyclePosition >= 29 && cyclePosition <= 31) {
            const randomNumber = Math.floor(Math.random() * 100) + 1; // Random number between 1 and 100
            if (randomNumber >= 1 && randomNumber <= 6) {
                isPregnantElement.textContent = "is pregnant";
            } else {
                isPregnantElement.textContent = "is not pregnant";
            }
        }
    });
}

function calculateBMR(Weight, CM, Age){
    BMR = Number(((9.247 * Weight) + (3.098 * CM) - (4.330 * Age) + 447.593).toFixed(0));
    mealCalories = Number(((BMR + 1000) / 5).toFixed(0));
}

function populateHeaviestList(data) {
    const heaviestList = document.querySelector("#heaviest-list");
    if (!heaviestList) return;

    // Flatten all members into a single array
    const allMembers = Object.values(data).flat();

    // Calculate BMI for each member and attach level
    const membersWithBMI = allMembers.map(member => {
        const { weight, cm, level = 0 } = member.details || {};
        let bmi = null;
        if (weight && cm) {
            const m = cm / 100;
            bmi = weight / (m * m);
        }
        return {
            ...member,
            bmi,
            level: Number(level) || 0
        };
    });

    // Sort by level (desc), then BMI (desc)
    membersWithBMI.sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        return (b.bmi || 0) - (a.bmi || 0);
    });

    // Take top 10
    const top10 = membersWithBMI.slice(0, 10);

    // Populate the list
    heaviestList.innerHTML = "";
    top10.forEach((member, idx) => {
        const li = document.createElement("li");
        li.textContent = `${idx + 1}. ${member.name || member.id} - Level: ${member.level}, BMI: ${member.bmi ? member.bmi.toFixed(1) : "N/A"}`;
        heaviestList.appendChild(li);
    });
}

function calculateWeightChange(inputCalories) {
    const weightCheck = document.querySelector("#weight-check");

    console.log("Input Calories:", inputCalories);
    console.log("BMR:", BMR);

    if (BMR !== undefined && !isNaN(inputCalories)) {
        let adjustedBMR = BMR; // Start with the original BMR
        const diet = selectedMember?.details?.diet || "low"; // Default to "low" if diet is not available
        const exercise = selectedMember?.details?.exercise || "none"; // Default to "none" if exercise is not available

        console.log("Diet:", diet);
        console.log("Exercise:", exercise);

        // Adjust BMR based on diet
        if (diet === "low") {
            adjustedBMR -= mealCalories;
        } else if (diet === "medium") {
            adjustedBMR -= mealCalories * 2;
        } else if (diet === "high") {
            adjustedBMR -= mealCalories * 3;
        }

        console.log("Adjusted BMR after diet:", adjustedBMR);

        // Adjust BMR based on exercise
        if (exercise === "low") {
            adjustedBMR += 500;
        } else if (exercise === "high") {
            adjustedBMR += 750;
        }

        console.log("Adjusted BMR after exercise:", adjustedBMR);

        const leftoverCalories = inputCalories - adjustedBMR;
        console.log("Leftover Calories:", leftoverCalories);

        // Adjust the divisor based on the level
        const level = selectedMember?.details?.level || 0; // Default level to 0 if not available
        const adjustedDivisor = 7000 * (1 - (level * 0.01));

        console.log("Level:", level);
        console.log("Adjusted Divisor:", adjustedDivisor);

        const weightChange = (leftoverCalories / adjustedDivisor).toFixed(1); // Round to 1 decimal place

        console.log("Weight Change:", weightChange);

        // After calculating weightChange
        const currentWeight = selectedMember?.details?.weight || 0;
        const newWeight = (Number(currentWeight) + Number(weightChange)).toFixed(1);

        weightCheck.textContent = `Weight change: ${weightChange} kg (New weight: ${newWeight} kg)`;
    } else {
        console.log("Invalid input or BMR not calculated.");
        weightCheck.textContent = "Invalid input or BMR not calculated.";
    }
}

function populateKinkSelect() {
    const select = document.getElementById('member-kink-select');
    if (!select) return;
    select.innerHTML = '';
    defaultKinks.forEach(kink => {
        const option = document.createElement('option');
        option.value = kink;
        option.textContent = kink;
        select.appendChild(option);
    });
}

function listMembersWithKink(kink) {
    const result = [];
    if (!globalData) return result;
    Object.values(globalData).forEach(group => {
        group.forEach(member => {
            if (member.details && Array.isArray(member.details.kinks) && member.details.kinks.includes(kink)) {
                result.push(member.name || member.id);
            }
        });
    });
    return result;
}

// Populate on page load
document.addEventListener('DOMContentLoaded', () => {
    populateKinkSelect();
    document.getElementById('member-kink-select').addEventListener('change', function() {
        const selectedKink = this.value;
        const members = listMembersWithKink(selectedKink);
        // Display the result as you wish, e.g. in #member-list
        const list = document.getElementById('members-kinks-ul');
        list.innerHTML = members.map(name => `<li>${name}</li>`).join('');
    });
});

function populateFoodSelect() {
    const select = document.getElementById('member-food-select');
    if (!select || !globalData) return;

    // Collect all unique favorite foods
    const foodSet = new Set();
    Object.values(globalData).forEach(group => {
        group.forEach(member => {
            if (member.details && Array.isArray(member.details.favorite_foods)) {
                member.details.favorite_foods.forEach(food => foodSet.add(food));
            }
        });
    });

    // Convert to array and sort alphabetically
    const sortedFoods = Array.from(foodSet).sort((a, b) => a.localeCompare(b));

    // Populate the select menu
    select.innerHTML = '';
    sortedFoods.forEach(food => {
        const option = document.createElement('option');
        option.value = food;
        option.textContent = food;
        select.appendChild(option);
    });
}

function listMembersWithFood(food) {
    const result = [];
    if (!globalData) return result;
    Object.values(globalData).forEach(group => {
        group.forEach(member => {
            if (
                member.details &&
                Array.isArray(member.details.favorite_foods) &&
                member.details.favorite_foods.includes(food)
            ) {
                result.push(member.name || member.id);
            }
        });
    });
    return result;
}

function addRandomPicker(buttonId, listId, resultId) {
    let button = document.getElementById(buttonId);
    let result = document.getElementById(resultId);

    if (!button) {
        button = document.createElement('button');
        button.id = buttonId;
        button.textContent = 'Pick Random Member';
        document.getElementById(listId).after(button);
    }
    if (!result) {
        result = document.createElement('div');
        result.id = resultId;
        button.after(result);
    }

    button.onclick = function() {
        const list = document.getElementById(listId);
        const items = Array.from(list.querySelectorAll('li'));
        if (items.length === 0) {
            result.textContent = 'No members to pick from.';
            return;
        }
        const randomItem = items[Math.floor(Math.random() * items.length)];
        result.textContent = `Random member: ${randomItem.textContent}`;
    };
}