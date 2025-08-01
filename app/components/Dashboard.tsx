import StatsCard from './StatsCard'
import DashImages from './DashImages'
export default function Dashboard(){
    return(
        <main className="p-6">
        <div>
            <div className="flex items-center justify-center">
            <h1 className="italic font-medium text-lg text-white-800">Connect and Earn Together!!!</h1>
            
            </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        <div><h1 className="text-xl font-semibold">Creators-Creator</h1><StatsCard title="B2B" value={50}/></div>
        <div><h1 className="text-xl font-semibold">Brand-Creators</h1><StatsCard title="B2C" value={100}/></div>
        <div><h1 className="text-xl font-semibold">Brand-Brand</h1><StatsCard title="C2C" value={200}/></div>
        </div>
        <div> <DashImages/></div>
        </div></main>
        
    )
}