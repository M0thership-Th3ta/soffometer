window.addEventListener('load', init);

//globals
let member = localStorage.getItem("member")
let group = localStorage.getItem("menu")
let userImage, ageGender, weightHeight, nameGroup, statusMessage, postsList;
let details = [];
let BMI, BRI, difference, starterWeight, waistCircumference, counter, BMR, age;
let waistCircumferenceThreshold, mealCalories;

function init(){
    // Cache DOM elements
    const elements = {
        pageTitle: document.querySelector("#page-title"),
        nameGroup: document.querySelector("#user-name"),
        userImage: document.querySelector("#user-image"),
        statusMessage: document.querySelector("#user-status"),
        ageGender: document.querySelector("#age-gender"),
        weightHeight: document.querySelector("#weight-height"),
        postsList: document.querySelector("#member-posts"),
    };

    ({ userImage, ageGender, weightHeight, nameGroup, statusMessage, postsList } = elements);

    elements.pageTitle.innerText = member;

    loadData("../JS/data.json", dataLoading);
    loadData("../JS/posts.json", postsLoading);
    loadData("../JS/body.json", bodyLoading);
    loadData("../JS/mood.json", moodLoading);
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

function dataLoading(data){
    const memberData = data[group]?.find(memberData => memberData.id === member);
    if (memberData) {
        details = [memberData.details];
        if (memberData.pfp) {
            const imagePath = `../${memberData.pfp}`;
            preloadImages([imagePath]);
            userImage.setAttribute("src", imagePath);
        }
    }
    detailsLoading();
}

function detailsLoading(){
    const detail = details[0];
    if (!detail) return;

    const heightInCM = Number(detail.cm);
    const heightInM = (heightInCM / 100).toFixed(2);
    const currentWeight = Number(detail.weight);
    const currentWeightInLB = (currentWeight * 2.205).toFixed(0);

    calculatePercentages(heightInCM);
    calculateBMI(heightInM, currentWeight);
    calculateBRI(BMI);
    calculateStarterWeight(18.5, heightInCM);
    calculateWaistCircumference(heightInCM, BRI);

    nameGroup.innerText = detail.group ? `${member} - ${detail.group}` : member;

    weightHeight.innerText = `${currentWeight}kg / ${currentWeightInLB}lbs / ${heightInM}m / ${detail.ft} / ${BMI} BMI`;
    statusMessage.innerText = detail.status || "";

    // Update hobbies, favorite foods, and kinks
    const hobbiesElement = document.querySelector("#hobbies");
    const favoriteFoodsElement = document.querySelector("#favorite-foods");
    const kinksElement = document.querySelector("#kinks");

    if (hobbiesElement) {
        hobbiesElement.innerText = detail.hobbies?.join(", ") || "None";
    }
    if (favoriteFoodsElement) {
        favoriteFoodsElement.innerText = detail.favorite_foods?.join(", ") || "None";
    }
    if (kinksElement) {
        kinksElement.innerText = detail.kinks?.join(", ") || "None";
    }
    calculateCounter(waistCircumference, waistCircumferenceThreshold);

    memberCurrentLevel();
    checkBirthday();
}
function calculatePercentages(CM){
    difference = (CM / 163).toFixed(2)
}

function calculateBMI(M, Weight){
    BMI = (Weight / (M * M)).toFixed(1)
}

function calculateBRI(BMI){
    BRI = (BMI / 5).toFixed(1)
}

function calculateStarterWeight(BMI, CM){
    starterWeight = (BMI * (CM * CM)/10000).toFixed(1)
}

function calculateWaistCircumference(CM, BRI){
    let calculationMatrix = (CM * 0.5) ** 2;
    let waistMatrix = Math.sqrt((1 - (((364.2 - BRI) / 365.5) ** 2)) * calculationMatrix);
    waistCircumference = (waistMatrix * (2 * Math.PI)).toFixed(1)

    const waistMatrixForBRI5 = Math.sqrt((1 - (((364.2 - 5) / 365.5) ** 2)) * calculationMatrix);
    waistCircumferenceThreshold = (waistMatrixForBRI5 * (2 * Math.PI)).toFixed(1);
}

function calculateCounter(waistCircumference, waistCircumferenceThreshold) {
    counter = 0;

    // Convert to numbers to ensure proper comparison
    const waistCircumferenceNum = Number(waistCircumference);
    const waistCircumferenceThresholdNum = Number(waistCircumferenceThreshold);

    console.log("waist circumference:", waistCircumferenceNum);
    console.log("waist circumference threshold:", waistCircumferenceThresholdNum);

    if (waistCircumferenceNum > waistCircumferenceThresholdNum) {
        const difference = waistCircumferenceNum - waistCircumferenceThresholdNum;
        console.log("difference:", difference);
        counter = Math.floor(difference / 2.54);
    }

    console.log("Counter:", counter);
}

function postsLoading(data){
    // Find the group in the posts data
    const groupPosts = data[group];
    if (!groupPosts) {
        postsList.innerHTML = "<p>There are no posts here at this time.</p>";
        return;
    }

    // Find the member's posts within the group
    const memberData = groupPosts.find(memberData => memberData.id === member);
    if (!memberData || !memberData.posts || memberData.posts.length === 0) {
        postsList.innerHTML = "<p>There are no posts here at this time.</p>";
        return;
    }

    // Clear the posts list container
    postsList.innerHTML = "";
    memberData.posts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(post => {
            const postElement = document.createElement("div");
            postElement.classList.add("post");

            if (post.title) {
                const postTitle = document.createElement("h3");
                postTitle.innerText = post.title;
                postElement.appendChild(postTitle);
            }

            if (post.date) {
                const postDate = document.createElement("p");
                postDate.classList.add("post-date");
                postDate.innerText = `Date: ${post.date}`;
                postElement.appendChild(postDate);
            }

            if (post.type === "text" && post.content) {
                const postContent = document.createElement("p");
                postContent.classList.add("post-content");
                postContent.innerText = post.content;
                postElement.appendChild(postContent);
            }

            if (post.type === "image" && post.source) {
                const postImageContainer = document.createElement("div");
                postImageContainer.classList.add("post-image");
                const postImage = document.createElement("img");
                postImage.setAttribute("src", post.source);
                postImageContainer.appendChild(postImage);
                postElement.appendChild(postImageContainer);
            }

            postsList.appendChild(postElement);
        });
}

function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

function bodyLoading(data) {
    // Determine which artist to use based on the counter value
    const artistKey = counter > 20 ? details[0]?.obese_artist : details[0]?.body_artist;
    if (!artistKey) return;

    // Find the artist's data in body.json
    const artistData = data[artistKey];
    if (!artistData) return;

    // Preload all images for the artist
    const imageUrls = artistData.map(item => item.img).filter(url => url);
    preloadImages(imageUrls);

    // Find the image corresponding to the counter value or the last available image
    let bodyImage = null;
    for (let i = counter; i >= 0; i--) {
        bodyImage = artistData.find(item => item.size === i)?.img;
        if (bodyImage) break; // Stop when a valid image is found
    }

    if (bodyImage) {
        const bodyReference = document.querySelector("#body-reference");
        bodyReference.setAttribute("src", bodyImage); // Set the image source
    }
}

function moodLoading(data){
    const personality = details[0]?.personality; // Get the personality array from details
    if (!personality || personality.length === 0) return;

    let selectedMood = null;

    if (personality.length === 1) {
        // If there's only one personality trait, find the matching mood
        const moodArray = data[personality[0]];
        if (moodArray) {
            selectedMood = moodArray.find(mood => mood.moods && mood.moods.length > 0);
        }
    } else if (personality.length === 2) {
        // If there are two personality traits, apply weighted probability
        const random = Math.random();
        const selectedTrait = random < 0.75 ? personality[0] : personality[1];
        const moodArray = data[selectedTrait];
        if (moodArray) {
            selectedMood = moodArray.find(mood => mood.moods && mood.moods.length > 0);
        }
    }

    if (!selectedMood) return;

    // Pick a random mood message
    const randomMood = selectedMood.moods[Math.floor(Math.random() * selectedMood.moods.length)];

    // Update the #user-mood element
    const userMoodElement = document.querySelector("#user-mood");
    if (userMoodElement) {
        userMoodElement.innerText = randomMood;
    }

    // Update the #user-feeling element
    const userFeelingElement = document.querySelector("#user-feeling");
    if (userFeelingElement) {
        userFeelingElement.innerText = `Feeling: ${selectedMood.feeling} ${selectedMood.emoji}`;
    }
}

function memberCurrentLevel() {
    // Ensure details and required properties exist
    if (!details || !details[0] || typeof BMI === "undefined") return;

    const level = details[0]?.level || 0; // Default level to 0 if not defined
    const currentXP = 95 + ((BMI - 35) / 1.4); // Calculate current XP
    const lvlCap = 110 * (1.1 ** level); // Calculate level cap

    // Log the values for debugging
    console.log("Current XP:", currentXP);
    console.log("Level Cap:", lvlCap);

    // Check if current XP exceeds level cap
    if (currentXP > lvlCap) {
        const userInfoElement = document.querySelector("#user-info");
        if (userInfoElement) {
            userInfoElement.classList.add("victory"); // Add the "victory" class
        }
    }
}

function checkBirthday() {
    if (!details || !details[0] || !details[0].birthday) return;

    const today = new Date();
    const [day, month, year] = [today.getDate(), today.getMonth() + 1, today.getFullYear()];

    // Extract day, month, and year (if available) from the birthday string
    const birthdayParts = details[0].birthday.split("/");
    const birthdayDay = parseInt(birthdayParts[0], 10);
    const birthdayMonth = parseInt(birthdayParts[1], 10);
    const birthdayYear = birthdayParts[2] ? parseInt(birthdayParts[2], 10) : null;

    // Update ageGender based on the birthday
    if (birthdayYear) {
        const calculatedAge = year - birthdayYear - (month < birthdayMonth || (month === birthdayMonth && day < birthdayDay) ? 1 : 0);
        ageGender.innerText = `${calculatedAge} years old / ${details[0].gender}`;
    } else if (typeof details[0].age === "number") {
        ageGender.innerText = `${details[0].age} years old / ${details[0].gender}`;
    } else {
        ageGender.innerText = `Age unknown / ${details[0].gender}`;
    }

    // Check if today's day and month match the birthday's day and month
    if (day === birthdayDay && month === birthdayMonth) {
        const userInfoElement = document.querySelector("#user-info");
        if (userInfoElement) {
            userInfoElement.classList.add("victory");
        }
    }
}

function checkPregnancy() {
    if (!details || !details[0] || typeof details[0].pregnant === "undefined") return;

    if (details[0].pregnant === true) {
        const userInfoElement = document.querySelector("#user-info");
        if (userInfoElement) {
            userInfoElement.classList.add("victory");
        }
    }
}