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
    loadData("JS/data.json", dataLoading)
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