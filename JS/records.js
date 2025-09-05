window.addEventListener('load', init);

let heaviestMemberList = [];

function init() {
    loadData("../JS/data.json", recordDataLoading);
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

function recordDataLoading(data){
    const allMembers = Object.values(data).flat();
    const sortedByWeight = allMembers.sort((a, b) => b.details.weight - a.details.weight);
    heaviestMemberList = sortedByWeight.slice(0, 25);

    const heaviestRecordsList = document.getElementById('heaviest-records');
    heaviestMemberList.forEach(member => {
        const listItem = document.createElement('li');
        listItem.textContent = `${member.id} - ${member.details.weight} kg`;
        heaviestRecordsList.appendChild(listItem);
    });
}