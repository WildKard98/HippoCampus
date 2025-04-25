"use client";
import { useState } from "react";
import axios from "axios";

export default function AuthForm({ screenWidth, onBack, setIsAuth, setUsername }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [inputUsername, setInputUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.post(`${apiUrl}${endpoint}`, {
                username: inputUsername,
                email,
                password,
            });

            if (isLogin) {
                localStorage.setItem("username", res.data.user.username);
                localStorage.setItem("token", res.data.token);
                setMessage("✅ Login successful!");
                setIsAuth(true);
                setUsername(res.data.user.username);
                onBack();
                setTimeout(() => {
                    onBack();
                }, 800);
            } else {
                setMessage("✅ Registered successfully. You can now login.");
                setIsLogin(true); // Switch to login form after registration
            }
        } catch (err) {
            console.error("❌ Auth error:", err.response?.data || err.message);
            setMessage(err.response?.data?.message || "Something went wrong.");
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="bg-[#1a2e30] p-10 rounded-2xl shadow-[0_0_20px_#00e0ff] w-full max-w-md mx-4">

                {/* Your existing content starts here */}
                <div className="text-[#00e0ff] font-[Itim]">
                    {/* Header */}
                    <div className={`flex justify-between items-center ${screenWidth <= 770 ? "flex-col gap-3" : ""}`}>
                        <h1 className="text-3xl font-bold drop-shadow-[0_0_8px_#00e0ff]">
                            {isLogin ? "Login" : "Register"}
                        </h1>
                        <button
                            onClick={onBack}
                            className="px-4 py-2 border border-[#00e0ff] rounded-lg hover:bg-[#00e0ff] hover:text-black text-[#00e0ff] transition shadow-md hover:shadow-[0_0_12px_#00e0ff]"
                        >
                            ← Back
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
                        {!isLogin && (
                            <input
                                type="text"
                                placeholder="Username"
                                className="bg-black border border-[#00e0ff] px-4 py-2 rounded-lg text-[#00e0ff] shadow-[0_0_8px_#00e0ff] focus:outline-none"
                                value={inputUsername}
                                onChange={(e) => setInputUsername(e.target.value)}
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email"
                            className="bg-black border border-[#00e0ff] px-4 py-2 rounded-lg text-[#00e0ff] shadow-[0_0_8px_#00e0ff] focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="bg-black border border-[#00e0ff] px-4 py-2 rounded-lg text-[#00e0ff] shadow-[0_0_8px_#00e0ff] focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="bg-black border-2 border-[#ff7700] text-[#ff7700] px-6 py-2 rounded-lg hover:bg-[#ff7700] hover:text-black transition shadow-md hover:shadow-[0_0_12px_#ff7700]"
                        >
                            {isLogin ? "Login" : "Register"}
                        </button>
                        {message && (
                            <p className="text-sm text-center text-[#ff7700] drop-shadow-[0_0_8px_#ff7700]">{message}</p>
                        )}
                        <div className="text-sm text-center mt-4">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button
                                type="button"
                                className="underline text-[#00e0ff] hover:text-[#ffaa33] transition"
                                onClick={() => setIsLogin(!isLogin)}
                            >
                                {isLogin ? "Register" : "Login"}
                            </button>
                        </div>
                    </form>
                </div>
                {/* Your existing content ends here */}

            </div>
        </div>
    );

}
