window.addEventListener('load', init);

//globals
let cm, tummySpace, stuffings;
let selectedMember;
let eatenFood = [];
let tummySpaceTaken = 0;
let order = [];
function init(){
    const orderButton = document.querySelector("#order");

    loadData("JS/data.json", memberListLoading);
    loadData("JS/food.json", foodLoading);
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

            if (selectedMember && selectedMember.id) {
                console.log(`Member ID: ${selectedMember.id}`);
            } else {
                console.warn("Selected member does not have an ID property.");
            }

            if (selectedMember && selectedMember.details) {
                cm = selectedMember.details.cm || null;
                stuffings = selectedMember.details.stuffings !== undefined ? selectedMember.details.stuffings : 0;
            } else {
                console.warn("Details not found for the selected member.");
                cm = null;
                stuffings = 0;
            }
        } else {
            selectedMember = null;
            cm = null;
            stuffings = null;
        }

        const tummySizeElement = document.querySelector("#tummy-size");

        if (cm !== null && stuffings !== null) {
            calculateTummySpace(cm, stuffings);
            console.log("Tummy Space:", tummySpace);
            tummySizeElement.textContent = `Tummy Size: ${tummySpace} Grams`;
        } else {
            console.warn("Cannot calculate tummy space due to missing data.");
            tummySizeElement.textContent = "Tummy Size: Unknown";
        }
    });
}

function calculateTummySpace(cm, stuffings) {
    tummySpace = (((cm / 200) * 4000)) * (1.01 ** stuffings);
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
        });

        multiplierInput.addEventListener("input", () => {
            const multiplier = parseInt(multiplierInput.value) || 1;
            foodItem.multiplier = multiplier;
            updateCalories(foodItem, multiplierInput);
        });

        // Append the food item to the list
        foodOrderList.appendChild(foodItemDiv);

        // Update the eatenFood array
        updateCalories(foodItem, multiplierInput);
    });
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

    // Add selected member's ID to the receipt
    if (selectedMember && selectedMember.id) {
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

    // Calculate the percentage of tummy space used
    const tummySpacePercentage = ((tummySpaceTaken / tummySpace) * 100).toFixed(2);
    receiptContent += `\nTummy Space Used: ${tummySpacePercentage}%`;

    // Create and download the receipt
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "receipt.txt";
    link.click();
}