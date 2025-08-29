import { useState } from "react";
import AuthImage from "./AuthImage";
import { Link } from "react-router-dom";

export default function AuthForm({ type }) {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  return (
    <div className="w-full max-w-xl bg-gray-600 m-4 p-10 rounded-md">
      <div className="text-2xl font-semibold w-full mb-4">
        {type === "signup" ? (
          <h1 className="text-2xl font-semibold text-center">
            Create an Account
          </h1>
        ) : (
          <h1 className="text-2xl font-semibold text-center">Welcome Back</h1>
        )}
      </div>

      <form className="flex gap-2 flex-col w-full">
        {type === "signup" && (
          <div className="flex flex-col gap-2">
            <label htmlFor="name"> <sup className="text-red-500">*</sup> Name </label>
            <input
              id="name"
              className="w-full p-2 rounded-md text-white text-[17px] border-1 border-gray-400 outline-none"
              type="text"
              name="name"
              value={userData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="email"><sup className="text-red-500">*</sup> Email </label>
          <input
            className="w-full p-2 rounded-md text-white text-[17px] border-1 border-gray-400 outline-none"
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password"> <sup className="text-red-500">*</sup> Password </label>
          <input
           className="w-full p-2 rounded-md text-white text-[17px] border-1 border-gray-400 outline-none"
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
          />
        </div>

        {
            type === "login" && (
                <Link className="text-end text-gray-200 hover:text-gray-500 cursor-pointer" to="/forgot-password">
                    Forget Password ?
                </Link>
            )
        }

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          {type === "signup" ? "Signup" : "Login"}
        </button>
      </form>

      <Link to={type === "signup" ? "/login" : "/signup"}>
        <div className="text-center text-gray-200 hover:text-gray-500 cursor-pointer pt-4">
          {type === "signup" ? "Already have an account? Login" : "Don't have an account? Signup"}
        </div>
      </Link>
    </div>
  );
}
