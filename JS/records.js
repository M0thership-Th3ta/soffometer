window.addEventListener('load', init);

let heaviestMemberList = [];
let levelMemberList = [];

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

function recordDataLoading(data) {
    const allMembers = Object.values(data).flat();

    // Sort copies so we don’t mutate each other
    const sortedByWeight = [...allMembers].sort(
        (a, b) => parseFloat(b.details.weight) - parseFloat(a.details.weight)
    );
    const sortedByLevel = [...allMembers].sort(
        (a, b) => b.details.level - a.details.level
    );

    const heaviestRecordsList = document.getElementById('heaviest-records');
    const levelRecordsList   = document.getElementById('level-records');

    heaviestRecordsList.innerHTML = '';
    levelRecordsList.innerHTML   = '';

    // ---- populate lists --------------------------------------------------
    sortedByWeight.slice(0, 25).forEach(member => {
        const li = document.createElement('li');
        li.textContent = `${member.id} - ${member.details.weight} kg`;
        heaviestRecordsList.appendChild(li);
    });

    sortedByLevel.slice(0, 25).forEach(member => {
        const li = document.createElement('li');
        li.textContent = `${member.id} - level ${member.details.level}`;
        levelRecordsList.appendChild(li);
    });
}