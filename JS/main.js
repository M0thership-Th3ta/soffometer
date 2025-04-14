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
}

function openMenu(){
    dropdown.classList.toggle("disabled")
    mainText.classList.toggle("disabled")
    favoriteList.classList.toggle("disabled")
    memberMenu.classList.toggle("disabled")
    showingMembers = false;

    loadData("js/data.json", createFavoriteCards)
}

function doMenuClick(e){
    if(e.target.tagName === "H2"){
        selectedMenu = e.target.dataset.group
        loadData("JS/data.json", createCards)
        memberMenu.classList.remove("disabled")
        showingMembers = true
    }
    if(showingMembers === true){
        while(memberMenu.hasChildNodes()){
            memberMenu.removeChild(memberMenu.firstChild)
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

        memberLink.setAttribute("href", "member.html")
        memberLink.append(memberArticle)
        memberMenu.append(memberLink)
    }
}

function memberSelected(e){
    if(e.target.tagName === "ARTICLE"){
        console.log(e.target.dataset.id)
    }
}

function goToMember(name, menu){
    localStorage.removeItem("member")
    localStorage.removeItem("menu")
    localStorage.setItem("menu", menu)
    localStorage.setItem("member", name)
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

            memberLink.setAttribute("href", "member.html")
            memberLink.append(memberArticle)
            favoriteMenu.append(memberLink)
        }
    }
}