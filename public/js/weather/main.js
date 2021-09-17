const storage = new Storage()

// WEATHER JAVASCRIPT

//get stored location data
const weatherLocation = storage.getLocationData();

//init weather object
const weather = new Weather(weatherLocation.city, weatherLocation.state);

//init ui
const ui = new UI();


//get weather on dom load
document.addEventListener('DOMContentLoaded', getWeather);
//get weather on dom load

//change location event
document.getElementById('w-change-btn').addEventListener('click', e => {
    const city = document.getElementById('city').value
    const state = document.getElementById('state').value

    //change location
    weather.changeLocation(city, state)

    //set location in local storage
    storage.setLocationData(city, state)

    //get and display weather
    getWeather();

    // Make data avilable to DOM

    //close modal
    $('#locModal').modal('hide')
});


function getWeather() {
    weather
        .getWeather()
        .then(results => {
            ui.paint(results)
        })
        .catch(err => console.log(err))
}

