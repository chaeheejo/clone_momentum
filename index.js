async function setBackground(){
    const imageUrl = "https://picsum.photos/1280/720"

    const result = await axios.get(imageUrl, {
        responseType: 'blob'
    })

    //해당 이미지로 임시 url 생성
    const data = URL.createObjectURL(result.data)

    document.body.style.backgroundImage = `url(${data})`
}

function makeZeroForm(item){
    if(item<10){
        return '0'+item
    }
    return item
}

function setTime(){
    const timer = document.querySelector(".timer")

    setInterval(()=>{
        const date = new Date()
        
        const hours = makeZeroForm(date.getHours())
        const minutes = makeZeroForm(date.getMinutes())
        const seconds = makeZeroForm(date.getSeconds())

        timer.textContent = `${hours}:${minutes}:${seconds}`
    },1000)
}

function setMemo(){
    const memoInput = document.querySelector('.memo-input')
    //엔터를 입력한 경우에 메모를 저장
    memoInput.addEventListener("keyup", function(e){
        //e.code에 키보드 입력이 담김
        //e.target.value는 input의 value가 존재하는 경우 true
        if(e.target.value && e.code === "Enter"){
            //메모 저장
            //새로고침을 해도 날아가면 안됨 - 로컬 스토리지 이용
            //but, 로컬 스토리지는 보안에 취약 thus, 보안에 상관없는 내용을 저장
            localStorage.setItem("todo", e.target.value)
            getMemo()
            memoInput.value = ""
        }
    })
}

function getMemo(){
    const memo = document.querySelector(".memo")
    const memoValue = localStorage.getItem("todo")
    memo.textContent = memoValue
}

function deleteMemo(){
    document.addEventListener("click", function(e){
        //e.target : 이벤트가 발생한 객체
        //memo가 포함된 태그를 눌렀을 때에만
        if(e.target.classList.contains("memo")){
            localStorage.removeItem("todo")
            getMemo()
        }
    })
}

function getPosition(){
    return new Promise((resolve, reject) => {
        //param : (성공 콜백, 실패 콜백) - Promise화를 시키기 위해
        //각각 resolve와 reject를 넣어줌
        //성공한다면 resolve를 호출하고, 실패했다면 reject를 호출
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}

function getWeatherIcon(){
    const weatherIcon = new Map()
    weatherIcon.set('01n', "./images/039-sun.png")
    weatherIcon.set('02n', "./images/038-cloudy-3.png")
    weatherIcon.set('03n', "./images/001-cloud.png")
    weatherIcon.set('04n', "./images/011-cloudy.png")
    weatherIcon.set('09n', "./images/003-rainy.png")
    weatherIcon.set('10n', "./images/034-cloudy-1.png")
    weatherIcon.set('11n', "./images/037-cloudy-2.png")
    weatherIcon.set('13n', "./images/031-snowflake.png")
    weatherIcon.set('50n', "./images/050-windy-3.png")
    return weatherIcon
}

async function renderWeather(){
    let latitude = null;
    let longitude = null;
    try{
        //위도랑 경도가 정상적으로 들어오면
        //위에서 선언한 getPosition으로 위도랑 경도를 받아올 것
        const position = await getPosition()
        latitude = position.coords.latitude
        longitude = position.coords.longitude

    }catch(e){
        console.log(e)
    }finally{ //try던 catch던 실행
        //위도랑 경도가 있어도 호출
        //없어도 날씨 정보는 받아와야 함

        //날씨 API(위도, 경도)
        const weatherResponse = await getWeather(latitude, longitude)
        const representWeather = weatherResponse.data.list.filter(element => element.dt_txt.includes("12:00:00"))
        console.log(representWeather)
    
        const modalBody = document.querySelector(".modal-body")
        representWeather.forEach(element => {
            const date = document.createElement("div")
            date.textContent = element.dt_txt.split(' ')[0]
            console.log(date)

            const weather = document.createElement("div")
            weather.textContent = element.weather[0].main
            console.log(weather)

            const temperature = document.createElement("div")
            temperature.textContent = (element.main.temp-273.15).toFixed(1)
            console.log(temperature)

            const iconMap = getWeatherIcon()
            const icon = document.createElement("img")
            icon.classList.add("weather-icon")
            icon.src = iconMap.get(element.weather[0].icon)

            const eachModal = document.createElement("div")
            eachModal.classList.add("modal-item")
            eachModal.append(date)
            eachModal.append(weather)
            eachModal.append(icon)
            eachModal.append(temperature)
            modalBody.append(eachModal)
        });
        
    }
}

function getWeather(latitude, longitude){
    const API_KEY = process.env.API_KEY
    if(latitude && longitude){ //위도, 경도가 존재하는 경우
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
        const result = axios.get(url)
        return result //promise를 리턴
    }else{ //위도, 경도가 존재하지 않는 경우
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=${API_KEY}`
        const result = axios.get(url)
        return result
    }
}


renderWeather()

setMemo()
getMemo()
deleteMemo()

setTime()

setBackground()

//5초마다 이미지를 바꿔줌
setInterval(()=> setBackground(), 5000)