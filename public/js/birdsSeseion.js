loc = document.getElementById('b-location').innerText;
lat = document.getElementById('b-latitude').innerText;
lon = document.getElementById('b-longitude').innerText;

id = document.getElementById('seshId').innerText;

console.log("pre-Lat: ", lat)


lat = Math.round(lat * 1e2) / 1e2;
lon = Math.round(lon * 1e2) / 1e2;

//  GET BIRDS FroM eBIRD

console.log("Lat: ", lat)

let myHeaders = new Headers();
myHeaders.append("X-eBirdApiToken", "vsqqs32292mi");

let requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
};

let birdView = document.getElementById('bird-list');

fetch(`https://api.ebird.org/v2/data/obs/geo/recent?lat=${lat}&lng=${lon}`, requestOptions)
    .then(response => response.json())
    .then(function (birds) {
        console.log(birds);

        // DISPLAY THE RETURNED LIST
        let output = '';

        birds.forEach((bird) => {
            output +=
                `
                     <li class="all-bird-list list-group-item">
                     
                         <a class="bird-name-js ${bird.speciesCode}" href="https://ebird.org/species/${bird.speciesCode}/US">
                            ${bird.comName}
                         </a> 
                            
                        <form method="POST" action="/birds/add_bird_session/${id}">
                           <div class="add-bird-btn">
                               <input type="hidden" value="${bird.comName}" name="comName" >
                               <input type="hidden" value="${bird.speciesCode}" name="speciesCode">
                           </div>
                           <button type="submit" class="btn"><i class="fa fa-plus"></i></button>
                       </form>
                    </li>
                 `
        });

        birdView.innerHTML = output;

        // FILTER THE LIST OF BIRDS REMOVING THE <li> OF THE BIRDS THAR DON'T MATCH THE FILTER

        let filterBird = document.getElementById('filterBird');
        let fullBird = document.getElementById('full-list');

        // Add event listener
        if (filterBird) {

            filterBird.addEventListener('keyup', filterNames);

            function filterNames() {
                // Get value of input
                let filterValue = document.getElementById('filterBird').value.toUpperCase();

                // Get names ul
                let ul = document.getElementById('bird-list');

                document.getElementById('bird-list').style.display = "block"

                // Get lis from ul
                let li = ul.querySelectorAll('li.all-bird-list');

                // Loop through collection-item lis
                for (let i = 0; i < li.length; i++) {
                    let a = li[i].getElementsByTagName('a')[0];
                    // If matched
                    if (a.innerHTML.toUpperCase().indexOf(filterValue) > -1) {
                        li[i].style.display = '';
                    } else {
                        li[i].style.display = 'none';
                    }
                }
            }
        }

        if (fullBird) {

            fullBird.addEventListener('click', e => {

                document.getElementById('bird-list').style.display = "block"
            })
        }


    })
    .catch(error => console.log('error', error));