window.addEventListener('load', init);

//globals
let menu;
let dropdown;
let mainText;
let favoriteList;
let memberMenu;
let favoriteMenu;
let selectedMenu = "";
let favorites = [];
let showingMembers = false;

function init(){
    menu = document.querySelector("#menu-button")
    dropdown = document.querySelector("#menu")
    mainText = document.querySelector("#index-text")
    favoriteList = document.querySelector("#favorite-list")
    memberMenu = document.querySelector("#member-select")
    favoriteMenu = document.querySelector("#favorite-list-container")

    menu.addEventListener("click", openMenu)
    dropdown.addEventListener("click", doMenuClick)
    memberMenu.addEventListener("click", memberSelected)

    loadData("JS/data.json", createFavoriteCards)
    populateUpcomingBirthdays()
}

function openMenu(){
    dropdown.classList.toggle("disabled")
    mainText.classList.toggle("disabled")
    favoriteList.classList.toggle("disabled")
    memberMenu.classList.toggle("disabled")
    showingMembers = false;

    loadData("JS/data.json", createFavoriteCards)
}

function doMenuClick(e){
    if (e.target.tagName === "H2") {
        selectedMenu = e.target.dataset.group;

        if (selectedMenu === "random") {
            loadData("JS/data.json", (data) => {
                // Flatten all members across groups into a single array
                const allMembers = Object.values(data).flat();

                // Select a random member
                const randomMember = allMembers[Math.floor(Math.random() * allMembers.length)];

                if (randomMember) {
                    // Store the random member's ID and group in localStorage
                    localStorage.setItem("member", randomMember.id);
                    localStorage.setItem("menu", Object.keys(data).find(group => data[group].includes(randomMember)));

                    // Redirect to the member page
                    window.location.href = "member.html";
                }
            });
        } else {
            loadData("JS/data.json", createCards);
            memberMenu.classList.remove("disabled");
            showingMembers = true;
        }
    }

    if (showingMembers === true) {
        while (memberMenu.hasChildNodes()) {
            memberMenu.removeChild(memberMenu.firstChild);
        }
    }
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

function createCards(data){
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    for(let member of data[selectedMenu]){
        console.log(member)
        let memberArticle = document.createElement("article")
        let memberLink = document.createElement("a")
        let memberIMG = document.createElement("img")

        memberArticle.classList.add("member-card")
        memberArticle.dataset.id = member.id

        if (storedFavorites.some(fav => fav[0] === selectedMenu && fav[1] === member.id)) {
            memberArticle.classList.add("favorite");
        }

        memberIMG.setAttribute("src", member.pfp)
        memberArticle.append(memberIMG)
        memberArticle.addEventListener("contextmenu", favoriteClick)

        memberArticle.addEventListener("click", () => {
            localStorage.setItem("member", member.id);
            localStorage.setItem("menu", selectedMenu);
        });

        memberLink.setAttribute("href", "pages/member.html")
        memberLink.append(memberArticle)
        memberMenu.append(memberLink)
    }
}

function memberSelected(e){
    if(e.target.tagName === "ARTICLE"){
        console.log(e.target.dataset.id)
    }
}
function favoriteClick(e){
    e.preventDefault();
    const memberCard = e.target.closest(".member-card");
    if (!memberCard) return;

    const memberId = memberCard.dataset.id;
    const favoriteKey = [selectedMenu, memberId];

    memberCard.classList.toggle("favorite");

    let storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (memberCard.classList.contains("favorite")) {
        if (!storedFavorites.some(fav => JSON.stringify(fav) === JSON.stringify(favoriteKey))) {
            storedFavorites.push(favoriteKey);
        }
    } else {
        storedFavorites = storedFavorites.filter(fav => JSON.stringify(fav) !== JSON.stringify(favoriteKey));
    }
    localStorage.setItem("favorites", JSON.stringify(storedFavorites));
}

function createFavoriteCards(data){
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favoriteMenu.innerHTML = ""
    for(let favorite of storedFavorites){
        const [menu, memberId] = favorite;

        // Find the matching member in the data
        const member = data[menu]?.find(member => member.id === memberId);
        if (member) {
            let memberArticle = document.createElement("article")
            let memberLink = document.createElement("a")
            let memberIMG = document.createElement("img")

            memberArticle.classList.add("member-card", "favorite")
            memberArticle.dataset.id = member.id

            memberIMG.setAttribute("src", member.pfp)
            memberArticle.append(memberIMG)

            memberArticle.addEventListener("click", () => {
                localStorage.setItem("member", member.id);
                localStorage.setItem("menu", menu);
            });

            memberLink.setAttribute("href", "pages/member.html")
            memberLink.append(memberArticle)
            favoriteMenu.append(memberLink)
        }
    }
}

function populateUpcomingBirthdays() {
    const birthdayList = document.querySelector("#birthday-list");
    birthdayList.innerHTML = ""; // Clear the list

    const today = new Date();
    const currentYear = today.getFullYear();

    loadData("JS/data.json", (data) => {
        const upcomingBirthdays = [];

        // Iterate through all groups and members
        Object.values(data).forEach(group => {
            group.forEach(member => {
                if (member.details && member.details.birthday) {
                    const [day, month] = member.details.birthday.split("/").map(Number);

                    // Create a birthday date for this year
                    const birthdayThisYear = new Date(currentYear, month - 1, day);

                    // If the birthday has already passed this year, use next year's date
                    const birthday = birthdayThisYear < today
                        ? new Date(currentYear + 1, month - 1, day)
                        : birthdayThisYear;

                    // Calculate the difference in days
                    const diffInDays = Math.ceil((birthday - today) / (1000 * 60 * 60 * 24));

                    // Check if the birthday is within the next 7 days
                    if (diffInDays >= 0 && diffInDays <= 7) {
                        upcomingBirthdays.push({ name: member.id, birthday: birthday.toDateString(), diffInDays });
                    }
                }
            });
        });

        // Sort birthdays by the closest date
        upcomingBirthdays.sort((a, b) => a.diffInDays - b.diffInDays);

        // Populate the #birthday-list
        if (upcomingBirthdays.length > 0) {
            upcomingBirthdays.forEach(({ name, birthday }) => {
                const listItem = document.createElement("p");
                listItem.textContent = `${name} - ${birthday}`;
                birthdayList.appendChild(listItem);
            });
        } else {
            birthdayList.textContent = "No upcoming birthdays in the next 7 days.";
        }
    });
}
