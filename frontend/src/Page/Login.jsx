import AuthForm from "../components/auth/AuthForm";
import AuthImage from "../components/auth/AuthImage";

export default function Login(){
    return (
        <div className="flex items-center justify-center mt-22">
            <AuthForm type="login" />
        </div>
    )
}