import AuthForm from "../components/auth/AuthForm";
import AuthImage from "../components/auth/AuthImage";

export default function Signup() {
  return (
    <div className="flex items-center justify-center mt-20">
      <AuthForm type="signup" />
    </div>
  );
}
