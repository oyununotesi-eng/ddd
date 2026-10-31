import React from "react";
import heroImage from "@/assets/hero.png";

export const Hero: React.FC = () => {
  const imgSrc = typeof heroImage === "string" ? heroImage : (heroImage as any)?.src || heroImage;

  return (
    <main className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 place-items-center pt-16 pb-8 md:pt-12 md:pb-24">
      <div className="py-6 md:order-1 flex justify-center">
        <img
          src={imgSrc}
          alt="Murat Krhl's WorkSpace"
          className="w-full max-w-[540px] h-auto object-contain rounded-xl"
          loading="eager"
        />
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] xl:text-[42px] font-bold tracking-normal whitespace-nowrap text-slate-900">
          Murat Krhl's WorkSpace
        </h1>
        <p className="text-lg mt-4 text-slate-600 max-w-xl">
          Work. Tools. Projects. Ideas. Everything I need, in one place.
        </p>

        {/* Social Links ("Yazı gibi" - Simple text links with icons) */}
        <div className="mt-8 flex flex-wrap items-center gap-6">
          {/* 1. Connect with Twitter */}
          <a
            href="https://x.com/M_karahaliloglu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#55acee] hover:text-[#388ec9] hover:underline transition-colors cursor-pointer group"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
            </svg>
            <span>Connect with Twitter</span>
          </a>

          {/* 2. Connect with Linkedin */}
          <a
            href="https://www.linkedin.com/in/murat-karahalilo%C4%9Flu/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0077b5] hover:text-[#005582] hover:underline transition-colors cursor-pointer group"
          >
            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            <span>Connect with Linkedin</span>
          </a>

          {/* 3. Connect with Github */}
          <a
            href="https://github.com/MuratKrhl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#333333] hover:text-black hover:underline transition-colors cursor-pointer group"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>Connect with Github</span>
          </a>
        </div>
      </div>
    </main>
  );
};

export default Hero;
