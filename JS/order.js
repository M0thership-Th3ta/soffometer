window.addEventListener('load', init);

//globals
let cm, tummySpace, stuffings;
let selectedMember;
let eatenFood = [];
let tummySpaceTaken = 0;
let order = [];
function init(){
    const orderButton = document.querySelector("#order");
    document.getElementById("change-modes").addEventListener("click", toggleModes);

    loadData("../JS/data.json", memberListLoading);
    loadData("../JS/food.json", foodLoading);
    addFoodToOrder();
    orderButton.addEventListener("click", createOrder);
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
    const tagSelect = document.querySelector("#tag-select");
    const foodSelect = document.querySelector("#food-select");
    const foodSubmissionButton = document.querySelector("#food-submission");

    // Disable food-related elements by default
    tagSelect.disabled = true;
    foodSelect.disabled = true;
    foodSubmissionButton.disabled = true;

    // Add the "Favorites" tab at the top
    const favoritesOption = document.createElement("option");
    favoritesOption.value = "__favorites__";
    favoritesOption.textContent = "★ Favorites";
    idSelect.appendChild(favoritesOption);

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

        // In the idSelect change event:
        if (selectedId === "__favorites__") {
            const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
            favorites.forEach(fav => {
                const option = document.createElement("option");
                option.value = fav[1]; // memberId (name)
                option.textContent = fav[1]; // Display name
                option.setAttribute("data-selected-id", fav[0]); // selectedId
                memberSelect.appendChild(option);
            });
        } else if (selectedId && data[selectedId]) {
            data[selectedId].forEach(member => {
                const option = document.createElement("option");
                option.value = member.id;
                option.textContent = member.name || member.id;
                memberSelect.appendChild(option);
            });
        }
    });

    // Add event listener to update global variables and enable food-related elements when a member is selected
    memberSelect.addEventListener("change", () => {
        const selectedId = idSelect.value;
        const selectedMemberId = memberSelect.value;

        if (selectedId === "__favorites__") {
            const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
            const selectedOption = memberSelect.options[memberSelect.selectedIndex];
            const favSelectedId = selectedOption.getAttribute("data-selected-id");
            const fav = favorites.find(f => f[1] === selectedMemberId);
            if (fav && data[favSelectedId]) {
                // Find the actual member object in data
                const realMember = data[favSelectedId].find(member => member.id === fav[1]);
                if (realMember) {
                    selectedMember = { ...realMember, selectedId: favSelectedId };
                    cm = realMember.details?.cm || null;
                    stuffings = realMember.details?.stuffings !== undefined ? realMember.details.stuffings : 0;
                } else {
                    selectedMember = null;
                    cm = null;
                    stuffings = null;
                }
            } else {
                selectedMember = null;
                cm = null;
                stuffings = null;
            }
        } else if (selectedId && selectedMemberId) {
            // Normal ID selection
            selectedMember = data[selectedId].find(member => member.id === selectedMemberId);
            if (selectedMember && selectedMember.details) {
                cm = selectedMember.details.cm || null;
                stuffings = selectedMember.details.stuffings !== undefined ? selectedMember.details.stuffings : 0;
            } else {
                cm = null;
                stuffings = 0;
            }
        } else {
            selectedMember = null;
            cm = null;
            stuffings = null;
        }

        // Enable or disable food-related elements
        tagSelect.disabled = !selectedMember;
        foodSelect.disabled = !selectedMember;
        foodSubmissionButton.disabled = !selectedMember;

        updateTummySizeDisplay();
    });
}

function calculateTummySpace(cm, stuffings) {
    tummySpace = (((cm / 200) * 4000)) * (1.01 ** stuffings);
}

function toggleModes() {
    const selectId = document.getElementById("select-id");
    const selectMember = document.getElementById("select-member");
    const nameInput = document.getElementById("name-input");
    const tummy = document.getElementById("tummy-size");
    const tagSelect = document.querySelector("#tag-select");
    const foodSelect = document.querySelector("#food-select");
    const foodSubmissionButton = document.querySelector("#food-submission");

    const isDisabled = selectId.classList.contains("disabled");

    selectId.classList.toggle("disabled");
    selectMember.classList.toggle("disabled");
    nameInput.classList.toggle("disabled");
    tummy.classList.toggle("disabled");

    // Enable or disable food-related elements based on the current mode
    tagSelect.disabled = isDisabled;
    foodSelect.disabled = isDisabled;
    foodSubmissionButton.disabled = isDisabled;
}

function foodLoading(data){
    const tagSelect = document.querySelector("#tag-select");
    const foodSelect = document.querySelector("#food-select");

    Object.keys(data).forEach(id => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = id;
        tagSelect.appendChild(option);
    });

    // Add event listener to update the food dropdown based on selected tag
    tagSelect.addEventListener("change", () => {
        const selectedTag = tagSelect.value;
        foodSelect.innerHTML = '<option value="">--Select a Food--</option>'; // Reset food options
        foodSelect.disabled = !selectedTag;

        if (selectedTag && data[selectedTag]) {
            data[selectedTag].forEach(foodItem => {
                const option = document.createElement("option");
                option.value = foodItem.name;
                option.textContent = `${foodItem.name} (${foodItem.calories} cal)`;
                option.setAttribute("data-serving-size", foodItem.serving_size); // Add serving_size as a data attribute
                foodSelect.appendChild(option);
            });
        }
    });
}

function addFoodToOrder() {
    const foodSelect = document.querySelector("#food-select");
    const foodSubmissionButton = document.querySelector("#food-submission");
    const foodOrderList = document.querySelector("#food-order-list");

    foodSubmissionButton.addEventListener("click", () => {
        const selectedFood = foodSelect.options[foodSelect.selectedIndex];
        if (!selectedFood || !selectedFood.value) {
            alert("Please select a food item.");
            return;
        }

        const foodName = selectedFood.value;
        const calories = parseInt(selectedFood.textContent.match(/\((\d+) cal\)/)[1]);
        const servingSize = parseInt(selectedFood.getAttribute("data-serving-size"));

        // Check if the food is already in the order
        const existingFood = order.find(item => item.name === foodName);
        if (existingFood) {
            alert("This food is already in the order. Use the buttons to adjust the quantity.");
            return;
        }

        // Calculate total serving size
        const totalServingSize = tummySpaceTaken + servingSize;
        if (totalServingSize > tummySpace) {
            alert("Adding this food exceeds the tummy space!");
            return;
        }

        // Add food to the order array
        const foodItem = { name: foodName, calories, servingSize, amount: 1, multiplier: 1 };
        order.push(foodItem);
        tummySpaceTaken += servingSize;

        // Create a new section for the food item
        const foodItemDiv = document.createElement("div");
        foodItemDiv.classList.add("food-item");

        foodItemDiv.innerHTML = `
            <span class="food-name">${foodName}</span>
            <div class="food-counter">
                <button class="food-decrease">-</button>
                <span class="food-amount">1</span>
                <button class="food-increase">+</button>
            </div>
            <input type="number" class="calorie-multiplier" value="1" min="1" style="width: 50px;">
        `;

        // Add event listeners for buttons and input
        const decreaseButton = foodItemDiv.querySelector(".food-decrease");
        const increaseButton = foodItemDiv.querySelector(".food-increase");
        const amountSpan = foodItemDiv.querySelector(".food-amount");
        const multiplierInput = foodItemDiv.querySelector(".calorie-multiplier");

        decreaseButton.addEventListener("click", () => {
            if (foodItem.amount > 1) {
                foodItem.amount--;
                amountSpan.textContent = foodItem.amount;
                tummySpaceTaken -= foodItem.servingSize;
                updateCalories(foodItem, multiplierInput);
                updateTummySizeDisplay();
            } else {
                // Remove the food item from the order array
                order = order.filter(item => item.name !== foodItem.name);

                // Remove the food item from the eatenFood array
                eatenFood = eatenFood.filter(item => item.name !== foodItem.name);

                // Remove the food item from the DOM
                foodItemDiv.remove();

                // Update the total serving size
                tummySpaceTaken -= foodItem.servingSize;

                // Update the total calories in the order details
                const totalCaloriesIngested = eatenFood.reduce((sum, item) => sum + item.calories, 0);
                document.querySelector("#calories-ingested").textContent = `Calories in the Order: ${totalCaloriesIngested}`;

                console.log("Updated eatenFood array:", eatenFood);
                updateTummySizeDisplay();
            }
        });

        increaseButton.addEventListener("click", () => {
            const newTotalServingSize = tummySpaceTaken + foodItem.servingSize;
            if (newTotalServingSize > tummySpace) {
                alert("Adding more of this food exceeds the tummy space!");
                return;
            }

            foodItem.amount++;
            amountSpan.textContent = foodItem.amount;
            tummySpaceTaken += foodItem.servingSize;
            updateCalories(foodItem, multiplierInput);
            updateTummySizeDisplay();
        });

        multiplierInput.addEventListener("input", () => {
            foodItem.multiplier = parseInt(multiplierInput.value) || 1;
            updateCalories(foodItem, multiplierInput);
        });

        // Append the food item to the list
        foodOrderList.appendChild(foodItemDiv);

        // Update the eatenFood array
        updateCalories(foodItem, multiplierInput);

        updateTummySizeDisplay();
    });
}

function updateTummySizeDisplay() {
    const tummySizeElement = document.querySelector("#tummy-size");
    if (cm !== null && stuffings !== null) {
        calculateTummySpace(cm, stuffings);
        const tummySpacePercentage = ((tummySpaceTaken / tummySpace) * 100).toFixed(2);
        tummySizeElement.textContent = `Tummy Size: ${tummySpace.toFixed(0)} Grams (${tummySpacePercentage}% Used)`;
    } else {
        tummySizeElement.textContent = "Tummy Size: Unknown";
    }
}

function updateCalories(foodItem, multiplierInput) {
    const multiplier = parseInt(multiplierInput.value) || 1;
    const totalCalories = foodItem.calories * foodItem.amount * multiplier;
    const totalServingSize = foodItem.servingSize * foodItem.amount;

    // Update the eatenFood array
    const foodIndex = eatenFood.findIndex(item => item.name === foodItem.name);
    if (foodIndex !== -1) {
        eatenFood[foodIndex].calories = totalCalories;
        eatenFood[foodIndex].servingSize = totalServingSize;
    } else {
        eatenFood.push({ name: foodItem.name, calories: totalCalories, servingSize: totalServingSize });
    }

    // Update the total calories in the order details
    const totalCaloriesIngested = eatenFood.reduce((sum, item) => sum + item.calories, 0);
    document.querySelector("#calories-ingested").textContent = `Calories in the Order: ${totalCaloriesIngested}`;

    console.log("Updated eatenFood array:", eatenFood);
}

function createOrder(){
    if (order.length === 0) {
        alert("No items in the order to create a receipt.");
        return;
    }

    let receiptContent = "Receipt:\n\n";

    // Check if a name is provided in the input field
    const nameInput = document.querySelector("#input-name").value.trim();
    if (nameInput) {
        receiptContent += `Name: ${nameInput}\n\n`;
    } else if (selectedMember && selectedMember.id) {
        receiptContent += `Member: ${selectedMember.id}\n\n`;
    } else {
        receiptContent += "Member: Unknown\n\n";
    }

    // Add food items and their amounts
    order.forEach(item => {
        receiptContent += `${item.name}: ${item.amount}\n`;
    });

    // Calculate total calories from the eatenFood array
    const totalCalories = eatenFood.reduce((sum, item) => sum + item.calories, 0);
    receiptContent += `\nTotal Calories: ${totalCalories}`;

    // Add tummy space used and calculate time
    if (cm !== null && stuffings !== null) {
        calculateTummySpace(cm, stuffings);
        const tummySpacePercentage = ((tummySpaceTaken / tummySpace) * 100).toFixed(2);

        // Calculate digestion time
        const minTime = 40; // in minutes
        const maxTime = 120; // in minutes
        let digestionTime = Math.round(minTime + (tummySpacePercentage / 100) * (maxTime - minTime));

        // Halve digestion time if pregnant
        if (selectedMember && selectedMember.details && selectedMember.details.pregnant) {
            digestionTime = Math.round(digestionTime / 2);
        }

        receiptContent += `\nTummy Space Used: ${tummySpacePercentage}%`;
        receiptContent += `\nEstimated Digestion Time: ${digestionTime} minutes`;
    }

    // Create and download the receipt
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "receipt.txt";
    link.click();
}