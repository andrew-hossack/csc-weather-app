// eslint-disable-next-line
import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2'
import 'chartjs-plugin-annotation';
import { useContext, useEffect, useState } from 'react';
import { WeatherContext } from '../context/WeatherContext';

function GustChart() {
    const { gustData } = useContext(WeatherContext)
    const [times, setTimes] = useState([])
    const [speeds, setSpeeds] = useState([])
    const [gusts, setGusts] = useState([])


    useEffect(() => {
        const timeStamps = gustData.map(gust => {
            const time = gust.timestamp_stored.split(' ')[1].split(':')
            const [, min, sec] = time
            return `${min}:${sec}`
        })

        const windSpeeds = gustData.map(wind => {
            const speed = wind.wind_speed
            return speed
        })
        const gustSpeeds = gustData.map(wind => {
            const speed = wind.gust_speed
            return speed
        })
        setTimes(timeStamps)
        setSpeeds(windSpeeds)
        setGusts(gustSpeeds)

    }, [gustData])



    // const test1 = [5, 8, 7, 12, 15, 11, 9, 6, 5, 14, 18, 24, 22, 19, 17, 15, 16, 17, 17, 17, 15, 14, 9, 9, 9, 7, 12, 15, 16, 18]

    // const test2 = [0, 0, 0, 0, 20, 20, 20, 20, 20, 20, 20, 27, 27, 27, 24, 24, 24, 21, 21, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    const data = {
        labels: times,
        // datasets is an array of objects where each object represents a set of data to display corresponding to the labels above. for brevity, we'll keep it at one object
        datasets: [
            {
                label: 'Wind Speed',
                data: speeds,

                fill: true, // Enable fill
                backgroundColor: 'rgba(0,0,255,.8)', // Fill color
                borderColor: 'rgba(0,0,0,1)', // Line color
                pointBackgroundColor: 'rgba(0,0,255,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(75,192,192,1)',
                tension: 0.4
            },
            {
                label: 'Gust Speed',
                data: gusts,

                fill: true, // Enable fill
                backgroundColor: 'rgba(255,0,0,.8)', // Fill color
                borderColor: 'rgba(0,0,0,1)', // Line color
                pointBackgroundColor: 'rgba(255,0,0,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(75,192,192,1)',
                tension: 0.4
            }
        ]
    }


    return (
        <div className="gust-chart">
            <Line
                className='chart'
                data={data}
                options={{
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            font: {
                                size: 16,
                                weight: 'bold',
                                color: 'rgba(0, 0, 0, .8)',
                            },
                            text: "Wind Speed in Kts - Previous 30 Mins",
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            min: 0,
                            max: 30,
                            ticks: {
                                color: 'rgba(0, 0, 0, 0.8)',
                            },
                            grid: {
                                color: `rgba(0,0,0,.8)`,
                            },
                        },
                        x: {
                            grid: {
                                color: `rgba(0,0,0,.8)`,
                            }
                        }
                    }
                }}
            />
        </div>
    );
}

export default GustChart
