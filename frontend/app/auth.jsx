"use client";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
export default function AuthForm({ screenWidth, onBack, setIsAuth, setUsername, reloadAuthInfo }) {

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [inputUsername, setInputUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
        // const apiUrl = "http://localhost:5001";


        if (!isLogin) {
            try {
                const res = await axios.post(`${apiUrl}/api/auth/check-availability`, {
                    username: inputUsername,
                    email,
                });

                if (res.data.usernameTaken) {
                    setUsernameError("❌ Username is already taken.");
                    setMessage("❌ Username is already taken.");
                    setLoading(false);
                    return;
                }

                if (res.data.emailTaken) {
                    setEmailError("❌ Email is already used.");
                    setMessage("❌ Email is already used.");
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.error("❌ Availability check error:", err.message);
                setMessage("❌ Server error during availability check.");
                setLoading(false);
                return;
            }
        }

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

        try {
            const payload = isLogin
                ? { email, password }
                : { username: inputUsername, email, password };

            const res = await axios.post(`${apiUrl}${endpoint}`, payload);

            console.log("🔥 API response data:", res.data);

            localStorage.setItem("username", res.data.user.username);
            localStorage.setItem("token", res.data.token);

            setMessage(isLogin ? "✅ Login successful!" : "✅ Registered successfully.");
            reloadAuthInfo();
            onBack();
            setTimeout(() => {
                onBack();
            }, 800);

        } catch (err) {
            console.error("❌ Auth error:", err.response?.data || err.message);
            setMessage(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!isLogin && inputUsername.trim() !== "") {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
                    // const apiUrl = "http://localhost:5001";
                    const res = await axios.post(`${apiUrl}/api/auth/check-availability`, { username: inputUsername });
                    setUsernameError(res.data.usernameTaken ? "❌ Username is already taken." : "");
                } catch (err) {
                    console.error(err);
                }
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [inputUsername, isLogin]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!isLogin && email.trim() !== "") {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
                    // const apiUrl = "http://localhost:5001";
                    const res = await axios.post(`${apiUrl}/api/auth/check-availability`, { email });
                    setEmailError(res.data.emailTaken ? "❌ Email is already used." : "");
                } catch (err) {
                    console.error(err);
                }
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [email, isLogin]);


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
                            <>
                                <input
                                    value={inputUsername}
                                    onChange={(e) => setInputUsername(e.target.value)}
                                    placeholder="Username"
                                    className="bg-black border border-[#00e0ff] px-4 py-2 rounded-lg text-[#00e0ff] shadow-[0_0_8px_#00e0ff] focus:outline-none"
                                />
                                {usernameError && (
                                    <p className="text-red-500 text-sm mt-1 animate-pulse-glow">{usernameError}</p>
                                )}
                            </>
                        )}
                        {/* Email Input */}
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="bg-black border border-[#00e0ff] px-4 py-2 rounded-lg text-[#00e0ff] shadow-[0_0_8px_#00e0ff] focus:outline-none"
                        />
                        {emailError && (
                            <p className="text-red-500 text-sm mt-1 animate-pulse-glow">{emailError}</p>
                        )}
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
                            {loading ? (
                                <div className="flex flex-col items-center justify-center">
                                    <svg className="animate-spin h-6 w-6 text-[#00e0ff] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"></path>
                                    </svg>
                                    <span className="text-[#00e0ff] font-bold">Loading...</span>
                                </div>
                            ) : (
                                <>
                                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                                    <button
                                        type="button"
                                        className="underline text-[#00e0ff] hover:text-[#ffaa33] transition"
                                        onClick={() => setIsLogin(!isLogin)}
                                    >
                                        {isLogin ? "Register" : "Login"}
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
                {/* Your existing content ends here */}

            </div>
        </div>
    );

}
