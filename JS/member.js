window.addEventListener('load', init);

//globals
let member = localStorage.getItem("member")
let group = localStorage.getItem("menu")
let ageGender
let weightHeight
let birthDate
let nameGroup
let statusMessage
let pageTitle
let postsList

let details = [];
let BMI
let BRI
let difference
let starterWeight
let waistCircumference
let waistCircumferenceThreshold

function init(){
    pageTitle = document.querySelector("#page-title")
    pageTitle.innerText = member
    nameGroup = document.querySelector("#user-name")
    statusMessage = document.querySelector("#user-status")
    ageGender = document.querySelector("#age-gender")
    weightHeight = document.querySelector("#weight-height")
    postsList = document.querySelector("#member-posts")
    loadData("JS/data.json", dataLoading)
    loadData("JS/posts.json", postsLoading)
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
    for(let memberData of data[group]){
        if(memberData.id === member){
            details.push(memberData.details)
        }
    }
    detailsLoading()
}

function detailsLoading(){
    for(let detail of details){
        let heightInCM = Number(detail.cm)
        let heightInM = Number((heightInCM / 100).toFixed(2))
        let heightInFT = detail.ft
        let currentWeight = Number(detail.weight)
        let currentWeightInLB = Number((currentWeight * 2.205).toFixed(0))
        calculatePercentages(heightInCM)
        calculateBMI(heightInM, currentWeight)
        calculateBRI(BMI)
        calculateStarterWeight(18.5, heightInCM)
        calculateWaistCircumference(heightInCM, BRI)
        calculateWaistCircumferenceThreshold(heightInCM)

        if(detail.group){
            nameGroup.innerText = `${member} - ${detail.group}`
        } else {
            nameGroup.innerText = `${member}`
        }

        console.log(BMI)
        console.log(BRI)
        console.log(difference)
        console.log(starterWeight)
        console.log(waistCircumference)
        console.log(waistCircumferenceThreshold)

        ageGender.innerText = `${detail.age} / ${detail.gender}`
        weightHeight.innerText = `${currentWeight}kg / ${currentWeightInLB}lbs / ${heightInM}m / ${heightInFT} / ${BMI} BMI`
    }
}
function calculatePercentages(CM){
    difference = Number((CM / 163).toFixed(2))
}

function calculateBMI(M, Weight){
    BMI = Number((Weight / (M * M)).toFixed(1))
}

function calculateBRI(BMI){
    BRI = Number((BMI / 5).toFixed(1))
}

function calculateStarterWeight(BMI, CM){
    starterWeight = Number((BMI * (CM * CM)/10000).toFixed(1))
}

function calculateWaistCircumference(CM, BRI){
    let calculationMatrix = Number((CM * 0.5) * (CM * 0.5))
    let waistMatrix = Number(Math.sqrt((1 - (((364.2 - BRI) / 365.5) * ((364.2 - BRI) / 365.5)))* calculationMatrix).toFixed(2))
    waistCircumference = Number((waistMatrix * (2 * 3.1415)).toFixed(1))
}

function calculateWaistCircumferenceThreshold(CM){
    let calculationMatrix = Number((CM * 0.5) * (CM * 0.5))
    let waistMatrix = Number(Math.sqrt((1 - (((364.2 - 5) / 365.5) * ((364.2 - 5) / 365.5)))* calculationMatrix).toFixed(2))
    waistCircumferenceThreshold = Number((waistMatrix * (2 * 3.1415)).toFixed(1))
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

    // Iterate through the member's posts and display them
    for (let post of memberData.posts) {
        let postElement = document.createElement("div");
        postElement.classList.add("post");

        // Add post title
        if (post.title) {
            let postTitle = document.createElement("h3");
            postTitle.innerText = post.title;
            postElement.appendChild(postTitle);
        }

        // Add post date
        if (post.date) {
            let postDate = document.createElement("p");
            postDate.classList.add("post-date");
            postDate.innerText = `Date: ${post.date}`;
            postElement.appendChild(postDate);
        }

        // Add post content (if it's a text post)
        if (post.type === "text" && post.content) {
            let postContent = document.createElement("p");
            postContent.classList.add("post-content");
            postContent.innerText = post.content;
            postElement.appendChild(postContent);
        }

        // Add post image (if it's an image post)
        if (post.type === "image" && post.source) {
            let postImage = document.createElement("img");
            let postImageContainer = document.createElement("div");
            postImageContainer.classList.add("post-image");
            postImage.setAttribute("src", post.source);
            postImageContainer.append(postImage)
            postElement.appendChild(postImageContainer);
        }

        // Append the post element to the posts list
        postsList.appendChild(postElement);
    }
}