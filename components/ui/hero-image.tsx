import React from "react";
import Image from "next/image";
import { LiaVoteYeaSolid } from "react-icons/lia";
import { HiOutlineLink } from "react-icons/hi2";
import { GiFist } from "react-icons/gi";
import { BsFillShieldLockFill } from "react-icons/bs";

const HeroImage = () => {
  return (
    <div className="relative flex items-center justify-center mt-10 mb-10">
      <div className="flex justify-center items-center gap-4">
        {/*Ballot Paper*/}
        <div className="size-16 lg:size-20 z-10  bg-white/10 rounded-full shadow-xl backdrop-blur-sm border border-white/30 items-center justify-center text-gray-800 font-semibold flex flex-col will-change-transform">
          <LiaVoteYeaSolid className="text-5xl text-[#978AE5] size-[50px]" />
        </div>
        {/*Shield Paper*/}
        <div className="size-20 lg:size-30 z-20  bg-white/10 rounded-full shadow-xl backdrop-blur-md border border-white/30 items-center justify-center text-gray-800 font-semibold flex flex-col will-change-transform -mr-12 p-2">
          <div className="size-full bg-white/10 rounded-full shadow-xl backdrop-blur-sm border border-white/30 items-center justify-center text-gray-800 font-semibold flex flex-col will-change-transform ">
            <BsFillShieldLockFill className="text-5xl text-[#978AE5] size-[50px]" />
          </div>
        </div>
      </div>

      <div className="size-60 lg:size-96 z-10  bg-white/10 rounded-full shadow-xl backdrop-blur-sm border border-white/30 items-center justify-center text-gray-800 font-semibold flex flex-col will-change-transform">
        {/* Embossed fingerprint container with multiple shadow layers */}
        <div className="relative size-48 lg:size-64 rounded-full flex justify-center items-center">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200/30 via-indigo-300/20 to-pink-200/30 blur-sm"></div>

          {/* Main embossed circle */}
          <div className="relative size-40 lg:size-60 rounded-full bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1),inset_0_-2px_8px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.05)] border border-white/50 flex items-center justify-center overflow-hidden">
            {/* Inner shadow rim for depth */}
            <div className="absolute inset-2 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.08)]"></div>

            {/* Fingerprint image with embossed effect */}
            <div className="relative w-52 h-52 rounded-full overflow-hidden">
              <Image
                src="/images/home/fingerprint-hero-image.jpeg"
                alt="Fingerprint"
                width={300}
                height={300}
                className="w-full h-full object-cover opacity-70 mix-blend-multiply"
                priority={false}
                loading="lazy"
                sizes="160px"
              />

              {/* Overlay for embossed effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 mix-blend-overlay"></div>

              {/* Subtle inner glow */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_rgba(255,255,255,0.3)]"></div>
            </div>

            {/* Highlight on top edge for 3D effect */}
            <div className="absolute -top-1 left-1/4 right-1/4 h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm rounded-full"></div>
          </div>

          {/* Additional outer glow for warmth */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200/20 via-transparent to-purple-200/20 blur-md scale-110"></div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4">
        {/*Links*/}
        <div className="size-20 lg:size-30 z-20  bg-white/10 rounded-full shadow-xl backdrop-blur-md border border-white/30 items-center justify-center text-gray-800 font-semibold flex flex-col will-change-transform -ml-12 p-2">
          <div className="size-full bg-white/10 rounded-full shadow-xl backdrop-blur-sm border border-white/30 items-center justify-center text-gray-800 font-semibold flex flex-col will-change-transform ">
            <GiFist className="text-5xl text-[#978AE5] size-[50px]" />
          </div>
        </div>
        {/*Shield Paper*/}
        <div className="size-16 lg:size-20 z-10  bg-white/10 rounded-full shadow-xl backdrop-blur-sm border border-white/30 items-center justify-center text-gray-800 font-semibold flex flex-col will-change-transform">
          <HiOutlineLink className="text-5xl text-[#978AE5] size-[50px]" />
        </div>
      </div>
    </div>
  );
};
export default HeroImage;
