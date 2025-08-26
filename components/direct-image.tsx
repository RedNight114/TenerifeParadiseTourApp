"use client"

import Image from 'next/image'

interface DirectImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
}

export function DirectImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: DirectImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
        sizes={sizes}
      />
    </div>
  )
}




