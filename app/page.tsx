"use client";
import Image from "next/image";
import Aside from "@/components/slidebar"
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { date } from "zod";


export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("")

    try {
      const res = await fetch("/api/auth/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "Application/json "
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
       toast.error(data.message || "Login failed.");
        return;
      }

      toast.success(data.message ||"Login Successfully")
      router.push("/home")
      console.log("token", data.token)
    } catch (error) {
      toast.error("Cannot connect to server")
    } finally {
      setLoading(false)
    }
  }
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(0,163,108,0.15),transparent_40%),linear-gradient(135deg,#F7F7F7_0%,#EDEDED_45%,#E5F2EC_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-4xl border border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur md:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden bg-[linear-gradient(160deg,#059669_0%,#10b981_55%,#34d399_100%)] p-10 text-white md:flex md:flex-col md:justify-between lg:p-12">
            <div className="space-y-4">
              <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium tracking-wide">
                Family Flow
              </span>
              <div className="space-y-3">
                <h1 className="max-w-md text-4xl font-semibold leading-tight">
                  Manage your family finances in one calm, simple place.
                </h1>
                <p className="max-w-md text-sm leading-6 text-blue-100/90">
                  ยินดีต้อนรับเข้าสู่ระบบการจัดการเงิน
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center p-6 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8 space-y-2 text-center md:text-left">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-green-600">
                  Welcome back
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Sign in to your account
                </h2>
                <p className="text-sm leading-6 text-slate-500">
                  Enter your email and password to continue.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <button 
                type="submit" 
                disabled={loading}
                 className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 cursor-pointer"
                >
                  {loading ? "Loading..." : "Sign in"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500 md:text-left">
                Don&apos;t have an account?{" "}
                <a
                  href="/register"
                  className="font-semibold text-green-600 transition hover:text-green-500"
                >
                  Create one
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
