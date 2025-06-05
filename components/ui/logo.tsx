import React from "react";
import Link from "next/link";
import Image from "next/image";

const Logo = () => {
  return (
    <div className="flex flex-1 items-center">
      <Link href="/" className="flex items-center">
        <Image
          src="/images/logo.png"
          alt="Vots Logo"
          width={40}
          height={40}
          loading="lazy"
        />
      </Link>
    </div>
  );
};
export default Logo;
