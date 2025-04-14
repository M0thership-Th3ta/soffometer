window.addEventListener('load', init);

//globals
let menu;
let dropdown;
let memberMenu;
let selectedMenu = "";
let showingMembers = false;

function init(){
    menu = document.querySelector("#menu-button")
    dropdown = document.querySelector("#menu")
    memberMenu = document.querySelector("#member-select")
    menu.addEventListener("click", openMenu)
    dropdown.addEventListener("click", doMenuClick)
    memberMenu.addEventListener("click", memberSelected)
}

function openMenu(){
    dropdown.classList.toggle("disabled")
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
    for(let member of data[selectedMenu]){
        console.log(member)
        let memberArticle = document.createElement("article")
        let memberLink = document.createElement("a")
        let memberIMG = document.createElement("img")
        memberArticle.classList.add("member-card")
        memberArticle.dataset.id = member.id
        memberIMG.setAttribute("src", member.pfp)
        memberArticle.append(memberIMG)
        memberLink.setAttribute("href", "member.html")
        memberLink.append(memberArticle)
        memberMenu.append(memberLink)

        memberArticle.onclick = e => {
            if(e.target.dataset.id === member.id){
                goToMember(member.id, selectedMenu)
            }
        }
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