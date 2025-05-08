import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-black text-gray-200 gap-12">
      {/* Logo - local */}
      <Image
        src="/EPLogo1.png"
        alt="Escape Portal Logo"
        width={220}
        height={80}
        priority
        className="object-contain"
      />

      {/* Headline */}
      <h1 className="text-4xl font-bold text-center text-white">
        Welcome to the Escape Portal
      </h1>

      {/* Subheading */}
      <p className="text-lg text-gray-400 text-center max-w-xl">
        Your gateway to cybersecurity awareness and immersive training games.
      </p>

      {/* Login Button */}
      <Link
  href="/login"
  className="bg-orange-500 text-black font-semibold px-6 py-3 rounded-full text-lg hover:bg-orange-400 transition-all shadow-md"
>
  Login to Admin Portal
</Link>

    </div>
  );
}
