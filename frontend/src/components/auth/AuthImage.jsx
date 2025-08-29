
import LoginImage from  "../../assets/Login.jpg"; 
import SignupImage from "../../assets/Signup.jpg";

export default function AuthImage({ type }){
    return (
        <div className="flex flex-col items-center justify-center w-[50%]">
            {
                type === "signup" ? (
                <div className="h-[640px] w-[640px] relative rounded-xl border-1 border-slate-600 shadow-xl shadow-gray-500/50">
                        <img className="w-full h-full rounded-xl" src={SignupImage} alt="" />
                    </div>
                ) : (
                    <div className="h-[640px] w-[640px] relative rounded-xl">
                        <img className="w-full h-full rounded-xl" src={LoginImage} alt="" />
                    </div>
                )
            }
        </div>
    )
}