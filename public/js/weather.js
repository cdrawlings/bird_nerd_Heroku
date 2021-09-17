class UI {
    constructor() {
        this.desc = document.getElementById('w-desc');
        this.string = document.getElementById('w-string');
        this.icon = document.getElementById('w-icon');
        this.tempature = document.getElementById('tempature');
        this.condition = document.getElementById('condition');
        this.wlac = document.getElementById('w-loc');
    }

    paint(weather) {
        this.desc.textContent = weather.weather[0].description;
        this.string.textContent = weather.main.temp + '°F';
        this.icon.setAttribute(
            'src',
            `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`
        );
        this.tempature.value = weather.main.temp;
        this.condition.value = weather.weather[0].description;
    }
}

// Stores the location information


// Gets the weather information from Open Weather API

let lat = document.getElementById('w-lat').innerText;
let lon = document.getElementById('w-lon').innerText;


class Weather {
    constructor(city, state) {
        this.apiKey = '63f1828967b828f1de472282124073ee';
        this.city = city;
        this.state = state;
    }

    //fetch weather from api
    async getWeather() {
        console.log(lat, lon)
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`
        );
        const responseData = await response.json()
        let temp = responseData.main.temp;
        let round = Math.round(temp);
        responseData.main.temp = round
        return responseData;
    }
}

//init weather object
const weather = new Weather();

//init ui
const ui = new UI();

//get weather on dom load
document.addEventListener('DOMContentLoaded', getWeather);

//get weather on dom load

function getWeather() {
    weather
        .getWeather()
        .then(results => {
            ui.paint(results)
        })
        .catch(err => console.log(err))
}


//  api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={your api key}