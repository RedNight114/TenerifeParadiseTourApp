"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AvatarUploadProps {
  currentAvatarUrl?: string
  userId: string
  fallbackText: string
  onAvatarChange: (url: string) => void
  size?: "sm" | "md" | "lg"
}

const BUCKET = "avatars"

export function AvatarUpload({
  currentAvatarUrl,
  userId,
  fallbackText,
  onAvatarChange,
  size = "lg",
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-24 w-24",
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen debe ser menor a 5MB")
      return
    }

    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Subir archivo
    uploadAvatar(file)
  }

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true)

      // Generar nombre único para el archivo
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`

      // El nombre completo queda: <uid>/<uid-timestamp.ext>
      const filePath = `${userId}/${fileName}`

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        throw uploadError
      }

      // Obtener URL pública
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

      const publicUrl = data.publicUrl

      // Actualizar perfil en la base de datos
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId)

      if (updateError) {
        throw updateError
      }

      onAvatarChange(publicUrl)
      setPreviewUrl(null)
    } catch (error) {
      alert("Error al subir la imagen. Inténtalo de nuevo.")
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="relative group">
      <Avatar className={`${sizeClasses[size]} cursor-pointer transition-all duration-200 group-hover:opacity-80`}>
        <AvatarImage src={previewUrl || currentAvatarUrl} alt="Avatar" className="object-cover" />
        <AvatarFallback className="bg-gradient-to-r from-[#0061A8] to-[#F4C762] text-white text-xl">
          {fallbackText}
        </AvatarFallback>
      </Avatar>

      {/* Overlay con botón de cámara */}
      <div
        className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer`}
        onClick={handleClick}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        ) : (
          <Camera className="h-6 w-6 text-white" />
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Botón alternativo para móviles */}
      <Button
        variant="outline"
        size="sm"
        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white shadow-md"
        onClick={handleClick}
        disabled={uploading}
      >
        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
      </Button>
    </div>
  )
}
