"use client";

import { signIn } from "next-auth/react";

export function GoogleSignInButton() {
    return (
        <button
            onClick={() => signIn("google", { callbackUrl: "/today" })}
            className="mt-8 px-12 py-4 bg-transparent border border-white/30 text-white font-light tracking-[0.3em] text-xs uppercase hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all duration-500 active:translate-y-0"
        >
            Continue with Google
        </button>
    );
}
