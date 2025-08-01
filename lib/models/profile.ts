import mongoose from "mongoose"
const ProfileSchema=new mongoose.Schema({
    name:String,
    profile_id:String,
    role:String},
    { collection: 'profiles' });
export default mongoose.models.Profile||mongoose.model("Profile",ProfileSchema);