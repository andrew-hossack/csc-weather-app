import { useEffect, useState, createContext } from 'react'

export const WeatherContext = createContext()


const WindSpeedProvider = props => {
    const [speed, setSpeed] = useState()
    const [gustSpeed, setGustSpeed] = useState()
    const [direction, setDirection] = useState(0)
    const [metar, setMetar] = useState()
    const [temp, setTemp] = useState()
    const [tempC, setTempC] = useState()
    const [skyCondition1, setSkyCondition1] = useState()
    const [skyCondition2, setSkyCondition2] = useState()
    const [skyCondition3, setSkyCondition3] = useState()
    const [cloudCeiling1, setCloudCeiling1] = useState()
    const [cloudCeiling2, setCloudCeiling2] = useState()
    const [cloudCeiling3, setCloudCeiling3] = useState()
    const [metarAbbr, setMetarAbbr] = useState()
    const [metarDesc, setMetarDesc] = useState()
    const [gustData, setGustData] = useState([])
    const [darkTheme, setDarkTheme] = useState('true')
    const [tempSetting, setTempSetting] = useState('true')
    const [directions, setDirections] = useState({})
    const [temps, setTemps] = useState({})
    const [speeds, setSpeeds] = useState({})
    const [received, setReceived] = useState()

    // eslint-disable-next-line
    const windData = []
    // eslint-disable-next-line
    const weatherData = []

    useEffect(() => {
        const data = async () => {
            const res = await fetch('https://corsproxy.io/?https://markschulze.net/winds/winds.php?lat=41.8930014&lon=-89.07829&hourOffset=0&referrer=MSWA')
            const winds = await res.json()
            setDirections(winds.direction)
            setTemps(winds.temp)
            setSpeeds(winds.speed)
            setReceived(winds.validtime)
        }
        data()
        const interval = setInterval(() => {
            data()
        }, 1000000)

        return function() {
            clearInterval(interval)
        }
    }, [])


    useEffect(() => {
        const WebSocket = require('websocket').w3cwebsocket

        const windQuery = `
        subscription {
          wind: windReported {
            receivedAt
            speed
            gustSpeed
            direction
            variableDirection
          }
        }
        `;

        const websocket = new WebSocket("wss://api.skydivecsc.com/graphql", ["graphql-ws"]);
        websocket.onopen = function () {
            websocket.send(JSON.stringify(
                { type: "connection_init", payload: {} }
            ));
            websocket.send(JSON.stringify(
                { type: "start", id: "wind", payload: { query: windQuery, variables: null } }
            ));
        };
        websocket.onmessage = function (event) {
            const res = JSON.parse(event.data)

            windData.unshift(res.payload)
            if (windData[0]) {
                setSpeed(windData[0].data.wind.speed)
                setGustSpeed(windData[0].data.wind.gustSpeed)
                if (windData[0].data.wind.direction) {
                    setDirection(windData[0].data.wind.direction)
                } else {
                    setDirection(null)
                }
            }
        };
    }, [windData])

    useEffect(() => {
        const WebSocket = require('websocket').w3cwebsocket

        const weatherQuery = `
        subscription {
          weather: weatherReported {
            receivedAt
            metar
            presentWeather
            temperature
            dewPoint
            visibility
            densityAltitude
            skyCondition {
              cloudCover
              altitude
            }
          }
        }
        `;

        const websocket = new WebSocket("wss://api.skydivecsc.com/graphql", ["graphql-ws"]);
        websocket.onopen = function () {
            websocket.send(JSON.stringify(
                { type: "connection_init", payload: {} }
            ));
            websocket.send(JSON.stringify(
                { type: "start", id: "weather", payload: { query: weatherQuery, variables: null } }
            ));
        };
        websocket.onmessage = function (event) {
            const res = JSON.parse(event.data)

            weatherData.unshift(res.payload)
            if (weatherData[0]) {

                const metArr = weatherData[0].data.weather.metar.split(' ')
                metArr.pop()
                metArr.pop()
                metArr.pop()
                metArr.shift()

                const metArr2 = metArr.join(' ')

                setMetar(metArr2)
                if (weatherData[0].data.weather.temperature) {
                setTemp(weatherData[0].data.weather.temperature)
                setTempC(((weatherData[0].data.weather.temperature - 32) / 1.8).toFixed(1))
                }

                if (weatherData[0].data.weather.skyCondition[0].altitude) {
                    setCloudCeiling1(`${weatherData[0].data.weather.skyCondition[0].altitude}'`)
                }

                if (weatherData[0].data.weather.skyCondition[0].altitude === null) {
                    setCloudCeiling1()
                }

                if (weatherData[0].data.weather.skyCondition[1]) {
                    setCloudCeiling2(`${weatherData[0].data.weather.skyCondition[1].altitude}'`)
                }

                if (weatherData[0].data.weather.skyCondition[2]) {
                    setCloudCeiling3(`${weatherData[0].data.weather.skyCondition[2].altitude}'`)
                }

                if (weatherData[0].data.weather.presentWeather) {

                    if (weatherData[0].data.weather.presentWeather.includes('-')) {
                        setMetarDesc('Light')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('+')) {
                        setMetarDesc('Heavy')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('VC')) {
                        setMetarDesc('Vicinity')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('MI')) {
                        setMetarDesc('Shallow')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('PR')) {
                        setMetarDesc('Partial')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('BC')) {
                        setMetarDesc('Patches')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('DR')) {
                        setMetarDesc('Low Drifting')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('BL')) {
                        setMetarDesc('Blowing')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('FZ')) {
                        setMetarDesc('Freezing')
                    }

                    if (weatherData[0].data.weather.presentWeather.includes('BR')) {
                        setMetarAbbr('Mist')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('TS')) {
                        setMetarAbbr('Thunderstorms')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('SH')) {
                        setMetarAbbr('Shower')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('DZ')) {
                        setMetarAbbr('Drizzle')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('RA')) {
                        setMetarAbbr('Rain')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('UP')) {
                        setMetarAbbr('Unknown Precipitation')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('SN')) {
                        setMetarAbbr('Snow')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('PO')) {
                        setMetarAbbr('DUST DEVILS')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('SS')) {
                        setMetarAbbr('Sand Storm')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('GR')) {
                        setMetarAbbr('Hail')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('FG')) {
                        setMetarAbbr('Fog')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('FU')) {
                        setMetarAbbr('Smoke')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('HZ')) {
                        setMetarAbbr('Haze')
                    }
                    if (weatherData[0].data.weather.presentWeather.includes('FC')) {
                        setMetarAbbr('Tornado')
                    }
                }

                if (weatherData[0].data.weather.skyCondition[0].cloudCover) {
                    if (weatherData[0].data.weather.skyCondition[0].cloudCover === 'CLR') {
                        setSkyCondition1('Clear Sky')
                    }
                    if (weatherData[0].data.weather.skyCondition[0].cloudCover === 'SCT') {
                        setSkyCondition1('Scattered')
                    }
                    if (weatherData[0].data.weather.skyCondition[0].cloudCover === 'BKN') {
                        setSkyCondition1('Broken')
                    }
                    if (weatherData[0].data.weather.skyCondition[0].cloudCover === 'OVC') {
                        setSkyCondition1('Overcast')
                    }
                }

                if (weatherData[0].data.weather.skyCondition[1]) {
                    if (weatherData[0].data.weather.skyCondition[1].cloudCover === 'CLR') {
                        setSkyCondition2('Clear Sky')
                    }
                    if (weatherData[0].data.weather.skyCondition[1].cloudCover === 'SCT') {
                        setSkyCondition2('Scattered')
                    }
                    if (weatherData[0].data.weather.skyCondition[1].cloudCover === 'BKN') {
                        setSkyCondition2('Broken')
                    }
                    if (weatherData[0].data.weather.skyCondition[1].cloudCover === 'OVC') {
                        setSkyCondition2('Overcast')
                    }
                }

                if (weatherData[0].data.weather.skyCondition[2]) {
                    if (weatherData[0].data.weather.skyCondition[2].cloudCover === 'CLR') {
                        setSkyCondition3('Clear Sky')
                    }
                    if (weatherData[0].data.weather.skyCondition[2].cloudCover === 'SCT') {
                        setSkyCondition3('Scattered')
                    }
                    if (weatherData[0].data.weather.skyCondition[2].cloudCover === 'BKN') {
                        setSkyCondition3('Broken')
                    }
                    if (weatherData[0].data.weather.skyCondition[2].cloudCover === 'OVC') {
                        setSkyCondition3('Overcast')
                    }
                }
                if (weatherData[0].data.weather.skyCondition[0]?.cloudCover === "CLR" &&
                    (!weatherData[0].data.weather.skyCondition[1] || !weatherData[0].data.weather.skyCondition[1].cloudCover) &&
                    (!weatherData[0].data.weather.skyCondition[2] || !weatherData[0].data.weather.skyCondition[2].cloudCover)) {
                    setSkyCondition1('Clear Sky');
                    setSkyCondition2('');
                    setSkyCondition3('');
                }
            }
        };
    }, [weatherData, temp])



    useEffect(() => {
        const getWind = async () => {
          const res = await fetch('https://corsproxy.io/?https://lifeatterminalvelocity.com/csc_awos/data.php');
          const resArr = await res.json();

          if (!gustData.length || gustData[0].receivedAt !== resArr[0].receivedAt) {
            setGustData([...resArr]);
          }
        };
        getWind()
        const interval = setInterval(() => {
          getWind();
        }, 20000); // Fetch data every minute

        return () => {
          clearInterval(interval); // Clear the interval on component unmount
        };
        // eslint-disable-next-line
      }, []);

    return (
        <WeatherContext.Provider value={{ speed, gustSpeed, direction, metar, temp, tempC, tempSetting, setTempSetting, skyCondition1, skyCondition2, skyCondition3, cloudCeiling1, cloudCeiling2, cloudCeiling3, metarAbbr, metarDesc, gustData, darkTheme, setDarkTheme, directions, speeds, temps, received }}>
            {props.children}
        </WeatherContext.Provider>
    )
}

export default WindSpeedProvider;
