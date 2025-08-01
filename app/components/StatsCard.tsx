'use client'
import CountUp from 'react-countup'
interface StatsCardProps{
    title: string 
    value:number
    prefix?:string
    suffix?:string 
}
export default function StatsCar({title,value ,prefix='',suffix='+'}: StatsCardProps){
    return <div>
        <p className="text-xl font-semibold">
        <CountUp end={value} duration={5} prefix={prefix} suffix={suffix}/>
        </p></div>
}