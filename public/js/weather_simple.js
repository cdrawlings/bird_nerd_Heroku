let desc = document.getElementById('w-desc');
let string = document.getElementById('w-string');
let icon = document.getElementById('w-icon');
let tempature = document.getElementById('tempature');
let condition = document.getElementById('condition');
let wlat = document.getElementById('w-lat');
let wlon = document.getElementById('w-lon');
let wlac = document.getElementById('w-loc');
let weatherBar = document.getElementById('weather-bar');
const apiKey = '63f1828967b828f1de472282124073ee';


async function getWeather() {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${wlat}&lon=${wlon}&appid=${apiKey}&units=imperial`
    );

    const weather = await response.json()

    console.log(weather);

    return weather;


    let icon = icon.setAttribute(
        'src',
        `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`
    );
    console.log("w", weather)


    weatherBar.innerHTML = `
   
    <div id="w-loc">{{location.location}}</div>
    <div id="w-string">{{weather.main.temp}} °F</div>
    <div id="w-icon">{{icon}}</div>
    <div id="w-desc">{{weather.weather[0].description}}</div>
    <h3 id="w-lat">{{location.longitude}}</h3>
    <h3 id="w-lon">{{location.latitude}}</h3>
     <h1>Hello</h1>
    
    `
}



