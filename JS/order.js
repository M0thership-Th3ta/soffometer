window.addEventListener('load', init);

//globals
let cm;
let selectedMember;
function init(){
    loadData("JS/data.json", memberListLoading);
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

            if (selectedMember && selectedMember.details) {
                cm = selectedMember.details.cm || null;
            } else {
                console.warn("Details not found for the selected member.");
                cm = null;
            }
        } else {
            cm = null;
        }
        console.log(cm)
    });
}