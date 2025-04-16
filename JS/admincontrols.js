window.addEventListener('load', init);

//globals
let weight, cm, age;
let BMR, mealCalories;
let selectedMember;

function init(){
    loadData("JS/data.json", memberListLoading);

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

            if (selectedMember && selectedMember.details) {
                weight = selectedMember.details.weight || null;
                cm = selectedMember.details.cm || null;

                // Check and set age
                age = selectedMember.details.age || 50; // Default to 50 if age is unknown
                if (age > 50) {
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
}

function calculateBMR(Weight, CM, Age){
    BMR = Number(((9.247 * Weight) + (3.098 * CM) - (4.330 * Age) + 447.593).toFixed(0));
    mealCalories = Number(((BMR + 1000) / 5).toFixed(0));
}

function calculateWeightChange(inputCalories) {
    const weightCheck = document.querySelector("#weight-check");

    if (BMR !== undefined && !isNaN(inputCalories)) {
        const leftoverCalories = inputCalories - BMR;

        // Adjust the divisor based on the level
        const level = selectedMember?.details?.level || 0; // Default level to 0 if not available
        const adjustedDivisor = 7000 * (1 - (level * 0.01));

        const weightChange = (leftoverCalories / adjustedDivisor).toFixed(1); // Round to 1 decimal place

        weightCheck.textContent = `Weight change: ${weightChange} kg`;
    } else {
        weightCheck.textContent = "Invalid input or BMR not calculated.";
    }
}