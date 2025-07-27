import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normaliza una URL de imagen para que funcione con Next.js Image
 * Maneja tanto URLs completas como nombres de archivo locales
 */
export function normalizeImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return "/images/placeholder.jpg"
  }

  // Si ya es una URL completa (http/https), la devolvemos tal como está
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // Si es un nombre de archivo local, agregamos la ruta base
  if (imageUrl.includes('.jpg') || imageUrl.includes('.jpeg') || imageUrl.includes('.png') || imageUrl.includes('.webp') || imageUrl.includes('.avif')) {
    return `/images/${imageUrl}`
  }

  // Si no es ninguno de los anteriores, devolvemos el placeholder
  return "/images/placeholder.jpg"
}
