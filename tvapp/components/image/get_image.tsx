import Image from "next/image";
import React from "react";
import Link from "next/link";


export function fetchImage(imageUrl: string): React.JSX.Element {
    return (
        <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-16 lg:text-left"
            key={imageUrl}>
            <Link href={imageUrl}>
                <Image
                    src={imageUrl}
                    alt={imageUrl}
                    width={1200}
                    height={1200}
                    unoptimized={true}
                />
            </Link>
        </div>
    )
}
