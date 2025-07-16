"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Loader2, Plus, Trash2, Check, Shield, Car, Utensils, Activity, ClipboardList } from "lucide-react"
import { useCategories } from "@/hooks/use-categories"
import type { Service } from "@/lib/supabase"
import { upload } from "@vercel/blob/client"
import imageCompression from "browser-image-compression"

// --- Componente de "Etiquetas" reutilizable ---
function TagInput({
  label,
  items,
  setItems,
  placeholder,
}: { label: string; items: string[]; setItems: (items: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState("")

  const handleAddItem = () => {
    if (input.trim() && !items.includes(input.trim())) {
      setItems([...items, input.trim()])
      setInput("")
    }
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 mt-1">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem())}
        />
        <Button type="button" onClick={handleAddItem} disabled={!input.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {item}
            <Trash2 className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => handleRemoveItem(index)} />
          </Badge>
        ))}
      </div>
    </div>
  )
}

// --- Componente para campos específicos de categoría ---
function CategorySpecificFields({ categoryName, formData, handleInputChange, setFormData, loading }: any) {
  if (!categoryName) return null

  const adventureFields = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> Detalles de la Actividad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="activity_type">Tipo de Actividad</Label>
              <Input
                id="activity_type"
                value={formData.activity_type}
                onChange={(e) => handleInputChange("activity_type", e.target.value)}
                disabled={loading}
                placeholder="Ej: Senderismo, Buceo"
              />
            </div>
            <div>
              <Label htmlFor="fitness_level_required">Nivel Físico Requerido</Label>
              <select
                id="fitness_level_required"
                value={formData.fitness_level_required}
                onChange={(e) => handleInputChange("fitness_level_required", e.target.value)}
                disabled={loading}
                className="w-full mt-1 p-2 border rounded-md bg-white"
              >
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty_level">Nivel de dificultad</Label>
              <select
                id="difficulty_level"
                value={formData.difficulty_level}
                onChange={(e) => handleInputChange("difficulty_level", e.target.value)}
                disabled={loading}
                className="w-full mt-1 p-2 border rounded-md bg-white"
              >
                <option value="facil">Fácil</option>
                <option value="moderado">Moderado</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>
            <div>
              <Label htmlFor="duration">Duración (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", Number.parseInt(e.target.value) || 0)}
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="meeting_point_details">Detalles del Punto de Encuentro</Label>
            <Textarea
              id="meeting_point_details"
              value={formData.meeting_point_details}
              onChange={(e) => handleInputChange("meeting_point_details", e.target.value)}
              disabled={loading}
              placeholder="Ej: Frente a la entrada principal del hotel..."
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" /> Incluido / No Incluido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TagInput
            label="Qué debe llevar el cliente"
            items={formData.what_to_bring}
            setItems={(items) => setFormData({ ...formData, what_to_bring: items })}
            placeholder="Ej: Crema solar"
          />
          <TagInput
            label="Equipo Proporcionado"
            items={formData.equipment_provided}
            setItems={(items) => setFormData({ ...formData, equipment_provided: items })}
            placeholder="Ej: Casco, Arneses"
          />
          <TagInput
            label="Servicios Incluidos"
            items={formData.included_services}
            setItems={(items) => setFormData({ ...formData, included_services: items })}
            placeholder="Ej: Guía profesional"
          />
          <TagInput
            label="Servicios No Incluidos"
            items={formData.not_included_services}
            setItems={(items) => setFormData({ ...formData, not_included_services: items })}
            placeholder="Ej: Almuerzo"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" /> Logística y Planificación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="itinerary">Itinerario</Label>
            <Textarea
              id="itinerary"
              value={formData.itinerary}
              onChange={(e) => handleInputChange("itinerary", e.target.value)}
              disabled={loading}
              placeholder="Describe el plan del día, paradas, etc."
              rows={5}
            />
          </div>
          <div>
            <Label htmlFor="cancellation_policy">Política de Cancelación</Label>
            <Textarea
              id="cancellation_policy"
              value={formData.cancellation_policy}
              onChange={(e) => handleInputChange("cancellation_policy", e.target.value)}
              disabled={loading}
              placeholder="Ej: Cancelación gratuita hasta 24 horas antes."
              rows={3}
            />
          </div>
          <TagInput
            label="Idiomas del Guía"
            items={formData.guide_languages}
            setItems={(items) => setFormData({ ...formData, guide_languages: items })}
            placeholder="Ej: Español"
          />
        </CardContent>
      </Card>
    </div>
  )

  const vehicleFields = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" /> Especificaciones del Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="vehicle_type">Tipo de vehículo</Label>
              <Input
                id="vehicle_type"
                value={formData.vehicle_type}
                onChange={(e) => handleInputChange("vehicle_type", e.target.value)}
                disabled={loading}
                placeholder="Ej: Coche, Moto, Barco"
              />
            </div>
            <div>
              <Label htmlFor="transmission">Transmisión</Label>
              <select
                id="transmission"
                value={formData.transmission}
                onChange={(e) => handleInputChange("transmission", e.target.value)}
                disabled={loading}
                className="w-full mt-1 p-2 border rounded-md bg-white"
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automática</option>
              </select>
            </div>
            <div>
              <Label htmlFor="fuel_policy">Política de Combustible</Label>
              <Input
                id="fuel_policy"
                value={formData.fuel_policy}
                onChange={(e) => handleInputChange("fuel_policy", e.target.value)}
                disabled={loading}
                placeholder="Ej: Lleno/Lleno"
              />
            </div>
            <div>
              <Label htmlFor="seats">Asientos</Label>
              <Input
                id="seats"
                type="number"
                min="1"
                value={formData.seats}
                onChange={(e) => handleInputChange("seats", Number.parseInt(e.target.value) || 0)}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="doors">Puertas</Label>
              <Input
                id="doors"
                type="number"
                min="1"
                value={formData.doors}
                onChange={(e) => handleInputChange("doors", Number.parseInt(e.target.value) || 0)}
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="characteristics">Otras Características</Label>
            <Textarea
              id="characteristics"
              value={formData.characteristics}
              onChange={(e) => handleInputChange("characteristics", e.target.value)}
              rows={3}
              disabled={loading}
              placeholder="Ej: Aire acondicionado, 5 puertas, GPS incluido"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Cobertura y Depósitos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="insurance_included"
                checked={formData.insurance_included}
                onCheckedChange={(checked) => handleInputChange("insurance_included", checked)}
                disabled={loading}
              />
              <Label htmlFor="insurance_included">Seguro incluido</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="fuel_included"
                checked={formData.fuel_included}
                onCheckedChange={(checked) => handleInputChange("fuel_included", checked)}
                disabled={loading}
              />
              <Label htmlFor="fuel_included">Combustible incluido</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="deposit_required"
                checked={formData.deposit_required}
                onCheckedChange={(checked) => handleInputChange("deposit_required", checked)}
                disabled={loading}
              />
              <Label htmlFor="deposit_required">Se requiere depósito</Label>
            </div>
          </div>
          {formData.deposit_required && (
            <div>
              <Label htmlFor="deposit_amount">Monto del Depósito (€)</Label>
              <Input
                id="deposit_amount"
                type="number"
                min="0"
                value={formData.deposit_amount}
                onChange={(e) => handleInputChange("deposit_amount", Number.parseFloat(e.target.value) || 0)}
                disabled={loading}
              />
            </div>
          )}
          <TagInput
            label="Puntos de Recogida"
            items={formData.pickup_locations}
            setItems={(items) => setFormData({ ...formData, pickup_locations: items })}
            placeholder="Ej: Aeropuerto Sur"
          />
        </CardContent>
      </Card>
    </div>
  )

  const gastronomyFields = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" /> Detalles de la Experiencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="experience_type">Tipo de Experiencia</Label>
              <Input
                id="experience_type"
                value={formData.experience_type}
                onChange={(e) => handleInputChange("experience_type", e.target.value)}
                disabled={loading}
                placeholder="Ej: Menú degustación, Clase de cocina"
              />
            </div>
            <div>
              <Label htmlFor="ambience">Ambiente</Label>
              <Input
                id="ambience"
                value={formData.ambience}
                onChange={(e) => handleInputChange("ambience", e.target.value)}
                disabled={loading}
                placeholder="Ej: Formal, Casual, Romántico"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="chef_name">Nombre del Chef (Opcional)</Label>
            <Input
              id="chef_name"
              value={formData.chef_name}
              onChange={(e) => handleInputChange("chef_name", e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="drink_options">Opciones de Bebida</Label>
            <Input
              id="drink_options"
              value={formData.drink_options}
              onChange={(e) => handleInputChange("drink_options", e.target.value)}
              disabled={loading}
              placeholder="Ej: Bebidas incluidas, Maridaje disponible"
            />
          </div>
          <div>
            <Label htmlFor="menu">Descripción del Menú</Label>
            <Textarea
              id="menu"
              value={formData.menu}
              onChange={(e) => handleInputChange("menu", e.target.value)}
              rows={3}
              disabled={loading}
              placeholder="Describe el menú, platos incluidos, etc."
            />
          </div>
          <TagInput
            label="Opciones Dietéticas"
            items={formData.dietary_options}
            setItems={(items) => setFormData({ ...formData, dietary_options: items })}
            placeholder="Ej: Vegetariano"
          />
        </CardContent>
      </Card>
    </div>
  )

  switch (categoryName) {
    case "Actividades & Aventura":
      return adventureFields
    case "Alquiler de Vehículos":
      return vehicleFields
    case "Experiencias Gastronómicas":
      return gastronomyFields
    default:
      return <p className="text-sm text-gray-500">Esta categoría no tiene campos específicos.</p>
  }
}

// --- Componente principal del formulario ---
interface ServiceFormProps {
  service?: Service | null
  onSubmit: (service: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ServiceForm({ service, onSubmit, onCancel, loading = false }: ServiceFormProps) {
  const { categories, subcategories, loadingCategories, loadingSubcategories, fetchSubcategories, setSubcategories } =
    useCategories()
  const [uploadingImages, setUploadingImages] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    subcategory_id: "",
    price: 0,
    price_type: "per_person" as "per_person" | "total",
    images: [] as string[],
    available: true,
    featured: false,
    duration: 60,
    location: "",
    min_group_size: 1,
    max_group_size: 1,
    difficulty_level: "facil" as "facil" | "moderado" | "dificil",
    vehicle_type: "",
    characteristics: "",
    insurance_included: false,
    fuel_included: false,
    menu: "",
    schedule: [] as string[],
    capacity: 0,
    dietary_options: [] as string[],
    min_age: 18,
    license_required: false,
    permit_required: false,
    what_to_bring: [] as string[],
    included_services: [] as string[],
    not_included_services: [] as string[],
    meeting_point_details: "",
    transmission: "manual" as "manual" | "automatic",
    seats: 4,
    doors: 4,
    fuel_policy: "",
    pickup_locations: [] as string[],
    deposit_required: false,
    deposit_amount: 0,
    experience_type: "",
    chef_name: "",
    drink_options: "",
    ambience: "",
    activity_type: "",
    fitness_level_required: "medio" as "bajo" | "medio" | "alto",
    equipment_provided: [] as string[],
    cancellation_policy: "",
    itinerary: "",
    guide_languages: [] as string[],
  })

  useEffect(() => {
    if (service) {
      setFormData((prev) => ({
        ...prev,
        ...service,
        schedule: service.schedule || [],
        what_to_bring: service.what_to_bring || [],
        included_services: service.included_services || [],
        not_included_services: service.not_included_services || [],
        pickup_locations: service.pickup_locations || [],
        dietary_options: service.dietary_options || [],
        equipment_provided: service.equipment_provided || [],
        guide_languages: service.guide_languages || [],
      }))
    }
  }, [service])

  useEffect(() => {
    if (formData.category_id) {
      fetchSubcategories(formData.category_id)
    } else {
      setSubcategories([])
    }
  }, [formData.category_id, fetchSubcategories, setSubcategories])

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === formData.category_id),
    [formData.category_id, categories],
  )

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    setUploadingImages(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        })
        const newBlob = await upload(file.name, compressedFile, { access: "public", handleUploadUrl: "/api/upload" })
        return newBlob.url
      })
      const uploadedUrls = await Promise.all(uploadPromises)
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }))
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error subiendo imágenes")
    } finally {
      setUploadingImages(false)
      event.target.value = ""
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
          <CardDescription>Detalles principales del servicio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título del servicio *</Label>
              <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="location">Ubicación General</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <select
                id="category"
                value={formData.category_id}
                onChange={(e) => {
                  handleInputChange("category_id", e.target.value)
                  handleInputChange("subcategory_id", "")
                }}
                disabled={loadingCategories}
                className="w-full mt-1 p-2 border rounded-md bg-white"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="subcategory">Subcategoría</Label>
              <select
                id="subcategory"
                value={formData.subcategory_id}
                onChange={(e) => handleInputChange("subcategory_id", e.target.value)}
                disabled={loadingSubcategories || !formData.category_id || subcategories.length === 0}
                className="w-full mt-1 p-2 border rounded-md bg-white"
              >
                <option value="">
                  {loadingSubcategories
                    ? "Cargando..."
                    : subcategories.length === 0
                      ? "Sin subcategorías"
                      : "Selecciona una subcategoría"}
                </option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precios y Capacidad</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Precio (€) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="price_type">Tipo de precio</Label>
            <select
              id="price_type"
              value={formData.price_type}
              onChange={(e) => handleInputChange("price_type", e.target.value)}
              className="w-full mt-1 p-2 border rounded-md bg-white"
            >
              <option value="per_person">Por persona</option>
              <option value="total">Precio total</option>
            </select>
          </div>
          <div>
            <Label htmlFor="capacity">Capacidad total</Label>
            <Input
              id="capacity"
              type="number"
              min="0"
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", Number.parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="min_group_size">Mín. personas</Label>
            <Input
              id="min_group_size"
              type="number"
              min="1"
              value={formData.min_group_size}
              onChange={(e) => handleInputChange("min_group_size", Number.parseInt(e.target.value) || 1)}
            />
          </div>
          <div>
            <Label htmlFor="max_group_size">Máx. personas</Label>
            <Input
              id="max_group_size"
              type="number"
              min="1"
              value={formData.max_group_size}
              onChange={(e) => handleInputChange("max_group_size", Number.parseInt(e.target.value) || 1)}
            />
          </div>
        </CardContent>
      </Card>

      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles Específicos de {selectedCategory.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <CategorySpecificFields
              categoryName={selectedCategory.name}
              formData={formData}
              handleInputChange={handleInputChange}
              setFormData={setFormData}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Horarios</CardTitle>
        </CardHeader>
        <CardContent>
          <TagInput
            label="Añadir franja horaria"
            items={formData.schedule}
            setItems={(items) => setFormData({ ...formData, schedule: items })}
            placeholder="Ej: 10:00 - 12:00"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requisitos del Servicio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="min_age">Edad mínima</Label>
            <Input
              id="min_age"
              type="number"
              min="0"
              value={formData.min_age}
              onChange={(e) => handleInputChange("min_age", Number.parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="license_required"
              checked={formData.license_required}
              onCheckedChange={(checked) => handleInputChange("license_required", checked)}
            />
            <Label htmlFor="license_required">Se requiere carnet/licencia</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="permit_required"
              checked={formData.permit_required}
              onCheckedChange={(checked) => handleInputChange("permit_required", checked)}
            />
            <Label htmlFor="permit_required">Se requiere permiso especial</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imágenes del Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <Label
            htmlFor="image-upload"
            className="cursor-pointer block border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400"
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p>Haz clic para subir (Máx 5MB)</p>
          </Label>
          <Input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImages || loading}
            className="hidden"
          />
          {uploadingImages && <Loader2 className="h-4 w-4 animate-spin" />}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {formData.images.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="available">Servicio disponible</Label>
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => handleInputChange("available", checked)}
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="featured">Servicio destacado</Label>
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleInputChange("featured", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || uploadingImages} className="min-w-32">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>{service?.id ? "Actualizar" : "Crear"} Servicio</>
          )}
        </Button>
      </div>
    </form>
  )
}
