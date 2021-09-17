birdTime = document.getElementById('birdTime');
date = dayjs()
date = date.$d
day = dayjs(date).format('dddd, MMMM D, YYYY')
birdTime.innerText = day