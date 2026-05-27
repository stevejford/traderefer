import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import {
    Quote
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";

type RegisterPageProps = {
    searchParams?: Promise<{ type?: string }>;
};

const registerOgImage = "https://traderefer.au/invite-preview/opengraph-image";

function getRegisterCopy(type?: string) {
    const isBusiness = type === "business";

    return {
        isBusiness,
        title: isBusiness ? "Create your TradeRefer business account" : "Create your TradeRefer referrer account",
        description: isBusiness
            ? "Claim or create your trade profile, show the areas you service, and review referral lead terms before you unlock paid leads."
            : "Join TradeRefer to refer trusted trade businesses and receive rewards when eligible referrals are accepted.",
        eyebrow: isBusiness ? "For trade businesses" : "For referrers",
        redirectUrl: isBusiness ? "/onboarding/business" : "/onboarding/referrer",
    };
}

export async function generateMetadata({ searchParams }: RegisterPageProps): Promise<Metadata> {
    const params = await searchParams;
    const copy = getRegisterCopy(params?.type);

    return {
        title: copy.title,
        description: copy.description,
        openGraph: {
            title: copy.title,
            description: copy.description,
            type: "website",
            images: [
                {
                    url: registerOgImage,
                    width: 1200,
                    height: 630,
                    alt: copy.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: copy.title,
            description: copy.description,
            images: [registerOgImage],
        },
    };
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
    const params = await searchParams;
    const copy = getRegisterCopy(params?.type);

    return (
        <main className="min-h-screen bg-zinc-50 flex flex-col lg:flex-row">
            {/* Left Side: Branding & Testimonial - Hidden on Mobile */}
            <div className="hidden lg:flex lg:w-5/12 bg-zinc-900 p-12 md:p-20 lg:p-24 flex flex-col justify-between relative overflow-hidden">
                <header className="relative z-10">
                    <nav aria-label="Registration">
                        <Link href="/" className="flex items-center gap-2 mb-16 group" aria-label="TradeRefer home">
                            <Logo size="md" variant="white" />
                        </Link>
                    </nav>

                    <div className="space-y-8">
                        <div className="text-4xl md:text-5xl font-black text-white leading-tight font-display tracking-tight">
                            {copy.isBusiness ? (
                                <>Create a clearer path for <span className="text-orange-500">local enquiries</span></>
                            ) : (
                                <>Refer trusted tradies through a <span className="text-orange-500">clearer reward flow</span></>
                            )}
                        </div>

                        <div className="relative p-8 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-sm">
                            <Quote className="absolute top-6 left-6 w-12 h-12 text-orange-500/20" aria-hidden="true" />
                            <p className="text-zinc-300 text-lg italic leading-relaxed mb-6 relative z-10">
                                "Set up your profile once, keep your trade details tidy, and make referral terms clear before anyone commits."
                            </p>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-zinc-800 rounded-full border-2 border-orange-500/30 overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center text-orange-500 font-bold">TR</div>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">TradeRefer</div>
                                    <div className="text-sm text-zinc-500">{copy.eyebrow}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="relative z-10 mt-12 grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                        <div className="text-2xl font-black text-white mb-1">No monthly fee</div>
                        <div className="text-base font-black text-zinc-500 uppercase tracking-widest">Business profiles</div>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                        <div className="text-2xl font-black text-white mb-1">Terms first</div>
                        <div className="text-base font-black text-zinc-500 uppercase tracking-widest">Referral flow</div>
                    </div>
                </div>

                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute -left-20 top-40 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl rotate-45" />
            </div>

            {/* Right Side: Registration Form */}
            <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center bg-white lg:bg-zinc-50">
                <header className="lg:hidden flex flex-col items-center mb-10 text-center">
                    <nav aria-label="Registration">
                        <Link href="/" className="mb-6 inline-flex" aria-label="TradeRefer home">
                            <Logo size="md" />
                        </Link>
                    </nav>
                    <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mb-2">Create account</h2>
                    <p className="text-sm font-bold text-zinc-500 max-w-[260px]">{copy.description}</p>
                </header>
                
                <div className="w-full max-w-sm shadow-2xl lg:shadow-none rounded-[28px] overflow-hidden">
                    <Suspense fallback={<div className="p-12 text-center text-zinc-400 font-black animate-pulse">Initializing...</div>}>
                        <SignUp 
                            fallbackRedirectUrl={copy.redirectUrl}
                            signInUrl="/login" 
                            appearance={{
                                elements: {
                                    card: "shadow-none border-none",
                                    footerAction: "font-black text-orange-600 hover:text-orange-700",
                                    formButtonPrimary: "bg-orange-600 border-none shadow-xl hover:bg-orange-700 text-base py-6 rounded-2xl transition-all active:scale-95",
                                    headerTitle: "font-black tracking-tight",
                                    headerSubtitle: "font-bold text-zinc-500",
                                    socialButtonsBlockButton: "rounded-2xl border-2 border-zinc-100 hover:bg-zinc-50 font-bold",
                                    formFieldLabel: "font-black text-xs uppercase tracking-widest text-zinc-400",
                                    formFieldInput: "rounded-2xl h-12 border-2 border-zinc-100 focus:border-zinc-900 transition-all font-bold"
                                }
                            }}
                        />
                    </Suspense>
                </div>

                <footer className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-bold text-zinc-500">
                    <Link href="/privacy" className="hover:text-zinc-900 transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-zinc-900 transition-colors">Terms</Link>
                    <Link href="/support" className="hover:text-zinc-900 transition-colors">Support</Link>
                </footer>
            </div>
        </main>
    );
}
