window.addEventListener('load', init);

// Globals
export const defaultKinks = ["Foodplay", "Stuffing", "Weight gain", "Teasing", "Burping", "Affection", "Body worship", "Cuddling", "Sex", "Pregnancy", "Belly Fucking", "Hugs", "Kisses", "Immobility", "Cosplay", "Bimbofication", "Cheerleading", "Trophee Wife", "Fast Food Employment", "Vacation Gains", "Office Job", "Hypnotism", "Corruption", "Coercion", "False Diet Advice", "Crushing", "Humiliation", "Slob", "Messy", "Sweating", "Gain Multipliers"];

function init() {
    console.log("Initializing application...");
    const generateJsonButton = document.querySelector("#generate-json");
    const jsonDisplay = document.querySelector("#json-display");
    const personalityCheckboxes = document.querySelectorAll("#personality-checkboxes input[type='checkbox']");
    const kinksContainer = document.querySelector("#kinks-checkboxes");
    let selectedPersonalities = [];
    let selectedKinks = [...defaultKinks]; // Initialize with default values

    console.log("Setting up personality checkboxes...");
    setupPersonalityCheckboxes(personalityCheckboxes, selectedPersonalities);

    console.log("Setting up kinks checkboxes...");
    setupKinksCheckboxes(kinksContainer, selectedKinks);

    console.log("Setting up generate JSON button...");
    setupGenerateJsonButton(generateJsonButton, jsonDisplay, selectedPersonalities, selectedKinks);
}

function setupPersonalityCheckboxes(checkboxes, selectedPersonalities) {
    console.log("Styling and adding event listeners to personality checkboxes...");
    const container = document.querySelector("#personality-checkboxes");
    container.innerHTML = ""; // Clear existing content

    checkboxes.forEach(checkbox => {
        const wrapper = document.createElement("div"); // Create a wrapper for each checkbox and label
        wrapper.classList.add("checkbox-wrapper"); // Add a class for styling

        const label = document.createElement("label");
        label.appendChild(checkbox); // Append the checkbox to the label
        label.appendChild(document.createTextNode(` ${checkbox.value}`)); // Add the label text

        wrapper.appendChild(label); // Append the label to the wrapper
        container.appendChild(wrapper); // Append the wrapper to the container

        checkbox.addEventListener("change", () => handleCheckboxChange(checkbox, selectedPersonalities));
    });
}

function handleCheckboxChange(checkbox, selectedArray) {
    console.log("Checkbox changed:", checkbox.value, "Checked:", checkbox.checked);
    if (checkbox.checked) {
        selectedArray.push(checkbox.value);
        console.log("Added to array:", selectedArray);
    } else {
        selectedArray.splice(selectedArray.indexOf(checkbox.value), 1);
        console.log("Removed from array:", selectedArray);
    }
}

function setupKinksCheckboxes(container, selectedKinks) {
    console.log("Generating kinks checkboxes...");
    defaultKinks.forEach(kink => {
        const wrapper = document.createElement("div"); // Create a wrapper for each checkbox and label
        wrapper.classList.add("checkbox-wrapper"); // Add a class for styling

        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = kink;
        checkbox.checked = true; // Default checked
        checkbox.addEventListener("change", () => handleCheckboxChange(checkbox, selectedKinks));

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${kink}`));
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    });
}

function setupGenerateJsonButton(button, display, selectedPersonalities, selectedKinks) {
    console.log("Adding event listener to generate JSON button...");
    button.addEventListener("click", () => {
        console.log("Generate JSON button clicked.");
        const newMember = collectMemberData(selectedPersonalities, selectedKinks);
        if (newMember) {
            console.log("Generated JSON object:", newMember);
            display.textContent = JSON.stringify(newMember, null, 2)
                .replace(/\[\s+([^\]]+)\s+]/g, (match, arrayContent) => {
                    return `[ ${arrayContent.trim().replace(/\s+/g, ' ')} ]`;
                });
        } else {
            console.log("Failed to generate JSON object due to validation errors.");
        }
    });
}

function collectMemberData(selectedPersonalities, selectedKinks) {
    console.log("Collecting member data...");
    const memberId = document.querySelector("#member-id").value.trim();
    const memberName = document.querySelector("#member-name").value.trim();
    const memberWeight = Number(document.querySelector("#member-weight").value);
    const memberHeight = Number(document.querySelector("#member-height").value);
    const memberFt = document.querySelector("#member-ft").value.trim(); // Keep the value as a string
    const memberAge = document.querySelector("#member-age").value.trim();
    const memberBirthday = document.querySelector("#member-birthday").value.trim();
    const memberDiet = document.querySelector("#member-diet").value.trim();
    const memberExercise = document.querySelector("#member-exercise").value.trim();
    const memberBodyArtist = document.querySelector("#member-body-artist").value.trim();
    const memberObeseArtist = document.querySelector("#member-obese-artist").value.trim();
    const memberGender = document.querySelector("#member-gender").value.trim();
    const memberGroup = document.querySelector("#member-group").value.trim() || undefined;
    const memberStatus = document.querySelector("#member-status").value.trim();
    const memberHobbies = document.querySelector("#member-hobbies").value.trim().split(",").map(h => h.trim());
    const memberFavoriteFoods = document.querySelector("#member-favorite-foods").value.trim().split(",").map(f => f.trim());

    if (!memberId || !memberName || isNaN(memberWeight) || isNaN(memberHeight) || !memberFt || !memberAge) {
        alert("Please fill in all required fields (ID, PFP Path, Weight, Height, Ft, Age).");
        console.log("Validation failed: Missing required fields.");
        return null;
    }

    const newMember = {
        id: memberId,
        pfp: memberName,
        details: {
            cm: memberHeight,
            ft: memberFt, // Include ft in the JSON object
            weight: memberWeight,
            body_artist: memberBodyArtist || undefined,
            obese_artist: memberObeseArtist || undefined,
            age: isNaN(Number(memberAge)) ? memberAge : Number(memberAge),
            birthday: memberBirthday || undefined,
            level: 0,
            stuffings: 0,
            diet: memberDiet || "low",
            exercise: memberExercise || "none",
            gender: memberGender || undefined,
            group: memberGroup || undefined,
            status: memberStatus || undefined,
            personality: selectedPersonalities || [],
            hobbies: memberHobbies || [],
            favorite_foods: memberFavoriteFoods || [],
            kinks: selectedKinks || [],
            pregnant: false
        }
    };

    console.log("Successfully created new member object:", newMember);
    return newMember;
}
