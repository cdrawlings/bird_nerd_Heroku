navigator.geolocation.getCurrentPosition(async position => {
    const KEY = "AIzaSyAF2o2lBWk9H8JQhpwvI_U9e5rFZUikQY4";
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lon;

    let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${KEY}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            let parts = data.results[0].address_components;
            parts.forEach(part => {
                if (part.types.includes("locality")) {
                    document.getElementById('locality').value = part.long_name;
                }
            });
        })
        .catch(err => console.warn(err));
});