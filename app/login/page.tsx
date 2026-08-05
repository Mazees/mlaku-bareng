"use client";
import Link from "next/link";
import { useActionState } from "react";
import { FiLock, FiMail, FiKey, FiArrowLeft, FiShield } from "react-icons/fi";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);
  return (
    <div className="hero min-h-screen bg-base-100">
      <div className="hero-content flex-col w-full max-w-sm">
        <div className="text-center mb-4">
          <img
            src="/icon.png"
            alt="MLAKUBARENG Logo"
            className="w-16 h-16 object-contain mx-auto mb-3"
          />
          <h1 className="text-base sm:text-lg font-bold">Login Bendahara</h1>
          <p className="text-xs text-base-content/70 mt-1">
            Akses Admin MLAKUBARENG
          </p>
        </div>

        <div className="card bg-base-200 w-full shrink-0 shadow-2xl border border-base-300">
          <div className="card-body">
            <form action={formAction} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Email Admin</span>
                </label>
                <label className="flex input input-bordered">
                  <FiMail className="w-4 h-4" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Masukkan Email"
                    className="w-full"
                    required
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Password</span>
                </label>
                <label className="flex input input-bordered">
                  <FiMail className="w-4 h-4" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Masukkan Password"
                    className="w-full"
                    required
                  />
                </label>
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary w-full font-semibold"
                >
                  <FiLock className="w-4 h-4 mr-1" />
                  {isPending ? "Sedang Memeriksa..." : "Masuk ke Dashboard"}
                </button>
              </div>
              {state?.error && (
                <div
                  className="alert alert-error text-xs    
  font-semibold"
                >
                  {state.error}
                </div>
              )}
            </form>

            <div className="text-center pt-4 mt-2 border-t border-base-300">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                <FiArrowLeft className="w-4 h-4 mr-1.5" />
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
