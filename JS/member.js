window.addEventListener('load', init);

//globals
let member = localStorage.getItem("member")
let group = localStorage.getItem("menu")
let userImage, ageGender, weightHeight, nameGroup, statusMessage, postsList;
let details = [];
let BMI, BRI, difference, starterWeight, waistCircumference, counter;
let waistCircumferenceThreshold;

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

    loadData("JS/data.json", dataLoading);
    loadData("JS/posts.json", postsLoading);
    loadData("JS/body.json", bodyLoading);

    calculateCounter()
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
        if (memberData.pfp) userImage.setAttribute("src", memberData.pfp);
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

    nameGroup.innerText = `${member} - ${detail.group || ""}`;
    ageGender.innerText = `${detail.age} / ${detail.gender}`;
    weightHeight.innerText = `${currentWeight}kg / ${currentWeightInLB}lbs / ${heightInM}m / ${detail.ft} / ${BMI} BMI`;
    statusMessage.innerText = detail.status || "";
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

    if (waistCircumference > waistCircumferenceThreshold) {
        const difference = waistCircumference - waistCircumferenceThreshold;
        counter = Math.floor(difference / 2.54);
    }
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

function bodyLoading(data) {
    const bodyArtist = details[0]?.body_artist; // Get the body_artist from details
    if (!bodyArtist) return;

    // Find the artist's data in body.json
    const artistData = data[bodyArtist];
    if (!artistData) return;

    // Find the image corresponding to the counter value
    const bodyImage = artistData.find(item => item.size === counter)?.img;
    if (bodyImage) {
        const bodyReference = document.querySelector("#body-reference");
        bodyReference.setAttribute("src", bodyImage); // Set the image source
    }
}