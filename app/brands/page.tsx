import Navbar from "../components/Navbar"
import BrandDash from '../components/BrandDash'
export default function About(){
    return(
         <div className="min-h-screen bg-balck-100">
                    <div><Navbar/></div>
                    <div className="container mx-auto px-4 py-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white-800">Connect with Brands!!!</h1>
                        </div>
                        <main> <div><BrandDash/></div></main>
                    </div>
                </div>
    )
}