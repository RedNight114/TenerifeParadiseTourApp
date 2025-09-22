"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Loader2, Plus, Trash2, Check, Shield, Car, Utensils, Activity, ClipboardList, Image as ImageIcon, Euro, Users, MapPin, CheckCircle, Star, Clock } from "lucide-react"
import { useCategories, useSubcategories } from "@/hooks/use-unified-cache"
import type { Service } from "@/lib/supabase"
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from "@/components/ui/use-toast"
import { SimpleAgePricing } from "@/components/admin/simple-age-pricing"

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
interface CategorySpecificFieldsProps {
  categoryName: string
  formData: any
  handleInputChange: (field: string, value: any) => void
  setFormData: (data: any) => void
  loading: boolean
}

function CategorySpecificFields({ categoryName, formData, handleInputChange, setFormData, loading }: CategorySpecificFieldsProps) {
  if (!categoryName) return null

  const adventureFields = (
    <div className="space-y-6">
      {/* Información Básica de la Actividad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> Información Básica de la Actividad
          </CardTitle>
          <CardDescription>
            Datos fundamentales para que los clientes entiendan la actividad
          </CardDescription>
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
                placeholder="Ej: Senderismo Guiado, Buceo Recreativo"
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
                <option value="bajo">Bajo - Apto para todos</option>
                <option value="medio">Medio - Forma física moderada</option>
                <option value="alto">Alto - Forma física buena</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty_level">Nivel de Dificultad</Label>
              <select
                id="difficulty_level"
                value={formData.difficulty_level}
                onChange={(e) => handleInputChange("difficulty_level", e.target.value)}
                disabled={loading}
                className="w-full mt-1 p-2 border rounded-md bg-white"
              >
                <option value="facil">Fácil - Principiantes</option>
                <option value="moderado">Moderado - Intermedio</option>
                <option value="dificil">Difícil - Experiencia requerida</option>
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
                placeholder="Ej: 180 para 3 horas"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_age">Edad Mínima</Label>
              <Input
                id="min_age"
                type="number"
                min="0"
                value={formData.min_age}
                onChange={(e) => handleInputChange("min_age", Number.parseInt(e.target.value) || 0)}
                disabled={loading}
                placeholder="Ej: 12 años"
              />
            </div>
            <div>
              <Label htmlFor="location">Ubicación Principal</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                disabled={loading}
                placeholder="Ej: Parque Nacional del Teide"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipo y Servicios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" /> Equipo y Servicios
          </CardTitle>
          <CardDescription>
            Qué se proporciona y qué debe llevar el cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TagInput
            label="Equipo Proporcionado"
            items={formData.equipment_provided}
            setItems={(items) => setFormData({ ...formData, equipment_provided: items })}
            placeholder="Ej: Bastones de senderismo, Chaleco salvavidas"
          />
          <TagInput
            label="Qué debe llevar el cliente"
            items={formData.what_to_bring}
            setItems={(items) => setFormData({ ...formData, what_to_bring: items })}
            placeholder="Ej: Crema solar, Ropa cómoda"
          />
          <TagInput
            label="Servicios Incluidos"
            items={formData.included_services}
            setItems={(items) => setFormData({ ...formData, included_services: items })}
            placeholder="Ej: Guía profesional, Seguro de actividad"
          />
          <TagInput
            label="Servicios No Incluidos"
            items={formData.not_included_services}
            setItems={(items) => setFormData({ ...formData, not_included_services: items })}
            placeholder="Ej: Almuerzo, Transporte desde hotel"
          />
        </CardContent>
      </Card>

      {/* Logística y Planificación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" /> Logística y Planificación
          </CardTitle>
          <CardDescription>
            Información sobre el desarrollo de la actividad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="itinerary">Itinerario Detallado</Label>
            <Textarea
              id="itinerary"
              value={formData.itinerary}
              onChange={(e) => handleInputChange("itinerary", e.target.value)}
              disabled={loading}
              placeholder="Ej: 08:00 - Reunión en punto de encuentro&#10;09:00 - Inicio de la actividad&#10;12:00 - Descanso y almuerzo&#10;15:00 - Fin de la actividad"
              rows={6}
            />
          </div>
          <div>
            <Label htmlFor="meeting_point_details">Detalles del Punto de Encuentro</Label>
            <Textarea
              id="meeting_point_details"
              value={formData.meeting_point_details}
              onChange={(e) => handleInputChange("meeting_point_details", e.target.value)}
              disabled={loading}
              placeholder="Ej: Oficina de Tenerife Paradise Tours en Santa Cruz. Transporte incluido desde puntos de recogida designados."
              rows={3}
            />
          </div>
          <TagInput
            label="Idiomas del Guía"
            items={formData.guide_languages}
            setItems={(items) => setFormData({ ...formData, guide_languages: items })}
            placeholder="Ej: Español, Inglés, Alemán"
          />
        </CardContent>
      </Card>

      {/* Políticas y Condiciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-blue-600" /> Políticas y Condiciones
          </CardTitle>
          <CardDescription>
            Información importante sobre cancelaciones y condiciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cancellation_policy">Política de Cancelación</Label>
            <Textarea
              id="cancellation_policy"
              value={formData.cancellation_policy}
              onChange={(e) => handleInputChange("cancellation_policy", e.target.value)}
              disabled={loading}
              placeholder="Ej: Cancelación gratuita hasta 24 horas antes. Reembolso del 50% si se cancela entre 24 y 12 horas antes."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="license_required"
                checked={formData.license_required}
                onCheckedChange={(checked) => handleInputChange("license_required", checked)}
                disabled={loading}
              />
              <Label htmlFor="license_required">Se requiere licencia</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="permit_required"
                checked={formData.permit_required}
                onCheckedChange={(checked) => handleInputChange("permit_required", checked)}
                disabled={loading}
              />
              <Label htmlFor="permit_required">Se requiere permiso especial</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const vehicleFields = (
    <div className="space-y-6">
      {/* Especificaciones del Vehículo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" /> Especificaciones del Vehículo
          </CardTitle>
          <CardDescription>
            Características técnicas y físicas del vehículo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicle_type">Tipo de Vehículo</Label>
              <Input
                id="vehicle_type"
                value={formData.vehicle_type}
                onChange={(e) => handleInputChange("vehicle_type", e.target.value)}
                disabled={loading}
                placeholder="Ej: Coche Convertible, Moto de Montaña, Barco de Vela"
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="seats">Número de Asientos</Label>
              <Input
                id="seats"
                type="number"
                min="1"
                value={formData.seats}
                onChange={(e) => handleInputChange("seats", Number.parseInt(e.target.value) || 0)}
                disabled={loading}
                placeholder="Ej: 5"
              />
            </div>
            <div>
              <Label htmlFor="doors">Número de Puertas</Label>
              <Input
                id="doors"
                type="number"
                min="1"
                value={formData.doors}
                onChange={(e) => handleInputChange("doors", Number.parseInt(e.target.value) || 0)}
                disabled={loading}
                placeholder="Ej: 4"
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacidad de Carga (kg)</Label>
              <Input
                id="capacity"
                type="number"
                min="0"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", Number.parseInt(e.target.value) || 0)}
                disabled={loading}
                placeholder="Ej: 500"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="characteristics">Características Especiales</Label>
            <Textarea
              id="characteristics"
              value={formData.characteristics}
              onChange={(e) => handleInputChange("characteristics", e.target.value)}
              rows={3}
              disabled={loading}
              placeholder="Ej: Aire acondicionado, GPS incluido, Techo solar, Sistema de sonido premium"
            />
          </div>
        </CardContent>
      </Card>

      {/* Servicios Incluidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" /> Servicios Incluidos
          </CardTitle>
          <CardDescription>
            Qué incluye el alquiler del vehículo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TagInput
            label="Servicios Incluidos"
            items={formData.included_services}
            setItems={(items) => setFormData({ ...formData, included_services: items })}
            placeholder="Ej: Seguro básico, GPS, Silla de bebé"
          />
          <TagInput
            label="Servicios No Incluidos"
            items={formData.not_included_services}
            setItems={(items) => setFormData({ ...formData, not_included_services: items })}
            placeholder="Ej: Combustible, Seguro adicional, Conductor"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Política de Combustible y Depósitos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Política de Combustible y Depósitos
          </CardTitle>
          <CardDescription>
            Información sobre combustible y depósitos requeridos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fuel_policy">Política de Combustible</Label>
            <select
              id="fuel_policy"
              value={formData.fuel_policy}
              onChange={(e) => handleInputChange("fuel_policy", e.target.value)}
              disabled={loading}
              className="w-full mt-1 p-2 border rounded-md bg-white"
            >
              <option value="">Seleccionar política</option>
              <option value="Full to Full">Lleno a Lleno</option>
              <option value="Full to Empty">Lleno a Vacío</option>
              <option value="Empty to Empty">Vacío a Vacío</option>
              <option value="Included">Incluido</option>
            </select>
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
                placeholder="Ej: 500"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ubicaciones y Recogida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" /> Ubicaciones y Recogida
          </CardTitle>
          <CardDescription>
            Dónde se puede recoger y devolver el vehículo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="location">Ubicación Principal</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              disabled={loading}
              placeholder="Ej: Aeropuerto Tenerife Sur"
            />
          </div>
          <TagInput
            label="Puntos de Recogida Disponibles"
            items={formData.pickup_locations}
            setItems={(items) => setFormData({ ...formData, pickup_locations: items })}
            placeholder="Ej: Aeropuerto Sur, Puerto de Los Cristianos, Hotel específico"
          />
          <div>
            <Label htmlFor="meeting_point_details">Instrucciones de Recogida</Label>
            <Textarea
              id="meeting_point_details"
              value={formData.meeting_point_details}
              onChange={(e) => handleInputChange("meeting_point_details", e.target.value)}
              disabled={loading}
              placeholder="Ej: Presentarse en el mostrador de la empresa con DNI y carnet de conducir. Vehículo disponible 24h después de la confirmación."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Requisitos y Condiciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" /> Requisitos y Condiciones
          </CardTitle>
          <CardDescription>
            Requisitos para alquilar el vehículo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_age">Edad Mínima</Label>
              <Input
                id="min_age"
                type="number"
                min="18"
                value={formData.min_age}
                onChange={(e) => handleInputChange("min_age", Number.parseInt(e.target.value) || 18)}
                disabled={loading}
                placeholder="Ej: 21"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duración Mínima (horas)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", Number.parseInt(e.target.value) || 0)}
                disabled={loading}
                placeholder="Ej: 24"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="license_required"
              checked={formData.license_required}
              onCheckedChange={(checked) => handleInputChange("license_required", checked)}
              disabled={loading}
            />
            <Label htmlFor="license_required">Se requiere carnet de conducir</Label>
          </div>
          <div>
            <Label htmlFor="cancellation_policy">Política de Cancelación</Label>
            <Textarea
              id="cancellation_policy"
              value={formData.cancellation_policy}
              onChange={(e) => handleInputChange("cancellation_policy", e.target.value)}
              disabled={loading}
              placeholder="Ej: Cancelación gratuita hasta 24 horas antes. Reembolso del 50% si se cancela entre 24 y 12 horas antes."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const gastronomyFields = (
    <div className="space-y-6">
      {/* Detalles de la Experiencia Gastronómica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" /> Detalles de la Experiencia
          </CardTitle>
          <CardDescription>
            Información específica sobre la experiencia gastronómica
          </CardDescription>
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
                placeholder="Ej: Menú degustación, Clase de cocina, Cena romántica"
              />
            </div>
            <div>
              <Label htmlFor="ambience">Ambiente del Restaurante</Label>
              <select
                id="ambience"
                value={formData.ambience}
                onChange={(e) => handleInputChange("ambience", e.target.value)}
                disabled={loading}
                className="w-full mt-1 p-2 border rounded-md bg-white"
              >
                <option value="">Seleccionar ambiente</option>
                <option value="Formal">Formal - Elegante</option>
                <option value="Casual">Casual - Relajado</option>
                <option value="Romántico">Romántico - Íntimo</option>
                <option value="Familiar">Familiar - Acogedor</option>
                <option value="Moderno">Moderno - Contemporáneo</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="chef_name">Nombre del Chef (Opcional)</Label>
              <Input
                id="chef_name"
                value={formData.chef_name}
                onChange={(e) => handleInputChange("chef_name", e.target.value)}
                disabled={loading}
                placeholder="Ej: Chef María González"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duración de la Experiencia (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="30"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", Number.parseInt(e.target.value) || 0)}
                disabled={loading}
                placeholder="Ej: 120 para 2 horas"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menú y Bebidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-orange-600" /> Menú y Bebidas
          </CardTitle>
          <CardDescription>
            Detalles del menú y opciones de bebidas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="menu">Descripción del Menú</Label>
            <Textarea
              id="menu"
              value={formData.menu}
              onChange={(e) => handleInputChange("menu", e.target.value)}
              rows={4}
              disabled={loading}
              placeholder="Ej: Entrante: Ensalada de aguacate y gambas&#10;Principal: Pescado fresco del día con papas arrugadas&#10;Postre: Queso asado con miel de palma&#10;Bebida: Vino local incluido"
            />
          </div>
          <div>
            <Label htmlFor="drink_options">Opciones de Bebida</Label>
            <Textarea
              id="drink_options"
              value={formData.drink_options}
              onChange={(e) => handleInputChange("drink_options", e.target.value)}
              rows={3}
              disabled={loading}
              placeholder="Ej: Vino local incluido, Maridaje disponible (coste adicional), Cócteles especiales, Bebidas sin alcohol incluidas"
            />
          </div>
          <TagInput
            label="Opciones Dietéticas Disponibles"
            items={formData.dietary_options}
            setItems={(items) => setFormData({ ...formData, dietary_options: items })}
            placeholder="Ej: Vegetariano, Vegano, Sin gluten, Sin lactosa"
          />
        </CardContent>
      </Card>

      {/* Servicios Incluidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" /> Servicios Incluidos
          </CardTitle>
          <CardDescription>
            Qué incluye la experiencia gastronómica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TagInput
            label="Servicios Incluidos"
            items={formData.included_services}
            setItems={(items) => setFormData({ ...formData, included_services: items })}
            placeholder="Ej: Menú completo, Bebidas incluidas, Servicio de mesa, Chef personal"
          />
          <TagInput
            label="Servicios No Incluidos"
            items={formData.not_included_services}
            setItems={(items) => setFormData({ ...formData, not_included_services: items })}
            placeholder="Ej: Transporte, Bebidas premium, Propinas"
          />
        </CardContent>
      </Card>

      {/* Ubicación y Reservas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" /> Ubicación y Reservas
          </CardTitle>
          <CardDescription>
            Información sobre la ubicación y proceso de reserva
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="location">Ubicación del Restaurante</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              disabled={loading}
              placeholder="Ej: Puerto de la Cruz, Zona histórica"
            />
          </div>
          <div>
            <Label htmlFor="meeting_point_details">Instrucciones de Llegada</Label>
            <Textarea
              id="meeting_point_details"
              value={formData.meeting_point_details}
              onChange={(e) => handleInputChange("meeting_point_details", e.target.value)}
              disabled={loading}
              placeholder="Ej: Restaurante ubicado en el centro histórico. Llegar 10 minutos antes de la hora reservada. Código de vestimenta: Smart casual."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_group_size">Tamaño Mínimo de Grupo</Label>
              <Input
                id="min_group_size"
                type="number"
                min="1"
                value={formData.min_group_size}
                onChange={(e) => handleInputChange("min_group_size", Number.parseInt(e.target.value) || 1)}
                disabled={loading}
                placeholder="Ej: 2"
              />
            </div>
            <div>
              <Label htmlFor="max_group_size">Tamaño Máximo de Grupo</Label>
              <Input
                id="max_group_size"
                type="number"
                min="1"
                value={formData.max_group_size}
                onChange={(e) => handleInputChange("max_group_size", Number.parseInt(e.target.value) || 1)}
                disabled={loading}
                placeholder="Ej: 8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Políticas y Condiciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" /> Políticas y Condiciones
          </CardTitle>
          <CardDescription>
            Información importante sobre cancelaciones y condiciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cancellation_policy">Política de Cancelación</Label>
            <Textarea
              id="cancellation_policy"
              value={formData.cancellation_policy}
              onChange={(e) => handleInputChange("cancellation_policy", e.target.value)}
              disabled={loading}
              placeholder="Ej: Cancelación gratuita hasta 48 horas antes. Reembolso del 50% si se cancela entre 48 y 24 horas antes. No reembolso si se cancela menos de 24 horas antes."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_age">Edad Mínima</Label>
              <Input
                id="min_age"
                type="number"
                min="0"
                value={formData.min_age}
                onChange={(e) => handleInputChange("min_age", Number.parseInt(e.target.value) || 0)}
                disabled={loading}
                placeholder="Ej: 18"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="license_required"
                checked={formData.license_required}
                onCheckedChange={(checked) => handleInputChange("license_required", checked)}
                disabled={loading}
              />
              <Label htmlFor="license_required">Se requiere reserva previa</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  switch (categoryName) {
    case "Actividades & Aventuras":
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
  onSubmit: (service: unknown) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ServiceForm({ service, onSubmit, onCancel, loading = false }: ServiceFormProps) {   
  const { data: categories, isLoading: loadingCategories } = useCategories()
  const { data: subcategories, isLoading: loadingSubcategories } = useSubcategories()
  const loadingServices = loadingCategories || loadingSubcategories
  
  // Función helper para obtener subcategorías por categoría
  const getSubcategoriesByCategory = useCallback((categoryId: string) => {
    return subcategories?.filter(sub => sub.category_id === categoryId) || []
  }, [subcategories])
  

  // Estado para detectar cambios en el formulario
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [initialFormData, setInitialFormData] = useState<any>(null)

  const [formData, setFormData] = useState({
    title: service?.title || "",
    description: service?.description || "",
    category_id: service?.category_id || "",
    subcategory_id: service?.subcategory_id || "",
    price: service?.price || 0,
    price_children: service?.price_children || 0,
    price_type: service?.price_type || "per_person",
    images: service?.images || [] as string[],
    available: service?.available ?? true,
    featured: service?.featured ?? false,
    duration: service?.duration || "",
    location: service?.location || "",
    min_group_size: service?.min_group_size || "",
    max_group_size: service?.max_group_size || "",
    difficulty_level: service?.difficulty_level || "facil",
    vehicle_type: service?.vehicle_type || "",
    characteristics: service?.characteristics || "",
    insurance_included: service?.insurance_included ?? false,
    fuel_included: service?.fuel_included ?? false,
    menu: service?.menu || "",
    schedule: service?.schedule || [],
    capacity: service?.capacity || "",
    dietary_options: service?.dietary_options || [],
    min_age: service?.min_age || "",
    license_required: service?.license_required ?? false,
    permit_required: service?.permit_required ?? false,
    what_to_bring: service?.what_to_bring || [],
    included_services: service?.included_services || [],
    not_included_services: service?.not_included_services || [],
    meeting_point_details: service?.meeting_point_details || "",
    transmission: service?.transmission || "manual",
    seats: service?.seats || "",
    doors: service?.doors || "",
    fuel_policy: service?.fuel_policy || "",
    pickup_locations: service?.pickup_locations || [],
    deposit_required: service?.deposit_required ?? false,
    deposit_amount: service?.deposit_amount || "",
    experience_type: service?.experience_type || "",
    chef_name: service?.chef_name || "",
    drink_options: service?.drink_options || "",
    ambience: service?.ambience || "",
    activity_type: service?.activity_type || "",
    fitness_level_required: service?.fitness_level_required || "bajo",
    equipment_provided: service?.equipment_provided || [],
    cancellation_policy: service?.cancellation_policy || "",
    itinerary: service?.itinerary || "",
    guide_languages: service?.guide_languages || [],
  })

  // Estado para rangos de edad personalizados
  const [precioNinos, setPrecioNinos] = useState<number | null>(null)
  const [edadMaximaNinos, setEdadMaximaNinos] = useState<number | null>(null)

  // Obtener subcategorías cuando cambia la categoría
  const currentSubcategories = formData.category_id 
    ? getSubcategoriesByCategory(formData.category_id)
    : []

  useEffect(() => {
    if (service) {
      
      // Extraer solo los campos de la tabla, no las relaciones
      const {
        category,
        subcategory,
        ...serviceFields
      } = service;
      
      const processedImages = Array.isArray(service.images) ? service.images : []
      
      const newFormData = {
        ...formData,
        ...serviceFields,
        images: processedImages,
        schedule: service.schedule || [],
        what_to_bring: service.what_to_bring || [],
        included_services: service.included_services || [],
        not_included_services: service.not_included_services || [],
        pickup_locations: service.pickup_locations || [],
        dietary_options: service.dietary_options || [],
        equipment_provided: service.equipment_provided || [],
        guide_languages: service.guide_languages || [],
      }
      
      setFormData(newFormData)
      
              // Cargar precios por edad existentes si los hay
        setPrecioNinos(service.precio_ninos || null)
        setEdadMaximaNinos(service.edad_maxima_ninos || null)
      
      // Guardar datos iniciales incluyendo los rangos de edad
      setInitialFormData({
        ...newFormData,
        precio_ninos: service.precio_ninos || null,
        edad_maxima_ninos: service.edad_maxima_ninos || null
      })
      setHasUnsavedChanges(false)
    }
  }, [service])

  useEffect(() => {
    if (formData.category_id) {
      // This line is no longer needed as getSubcategoriesByCategory handles it
      // fetchSubcategories(formData.category_id)
    } else {
      // setSubcategories([]) // This line is no longer needed
    }
  }, [formData.category_id, getSubcategoriesByCategory]) // Changed to getSubcategoriesByCategory

  // Detectar cambios en el formulario
  useEffect(() => {
    if (initialFormData) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
                        precioNinos !== initialFormData.precio_ninos ||
                        edadMaximaNinos !== initialFormData.edad_maxima_ninos
      setHasUnsavedChanges(hasChanges)
    }
  }, [formData, precioNinos, edadMaximaNinos, initialFormData])

  // Sincronizar precios por edad cuando cambien desde el padre
  useEffect(() => {
    if (service) {
      // Solo actualizar si realmente hay diferencias para evitar loops infinitos
      if (service.precio_ninos !== precioNinos) {
        setPrecioNinos(service.precio_ninos || null)
      }
      if (service.edad_maxima_ninos !== edadMaximaNinos) {
        setEdadMaximaNinos(service.edad_maxima_ninos || null)
      }
    }
  }, [service?.precio_ninos, service?.edad_maxima_ninos])

  // Prevenir cierre de página si hay cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.'
        return e.returnValue
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  // Confirmar antes de cancelar si hay cambios
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (typeof window !== 'undefined' && window.confirm('¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.')) {
        setHasUnsavedChanges(false)
        onCancel()
      }
    } else {
      onCancel()
    }
  }

  const selectedCategory = useMemo(
    () => {
      const category = categories?.find((c: any) => c.id === formData.category_id)
      return category as any
    },
    [formData.category_id, categories],
  )

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (urls: string[]) => {

setFormData(prev => {
      const newImages = [...(prev.images || []), ...urls]
return {
        ...prev,
        images: newImages
      }
    })
    
    // Marcar que hay cambios sin guardar
    setHasUnsavedChanges(true)
}

  const handleImageRemove = (index: number) => {
setFormData(prev => {
      const newImages = prev.images.filter((_: string, i: number) => i !== index)
return {
        ...prev,
        images: newImages
      }
    })
    // Marcar que hay cambios sin guardar
    setHasUnsavedChanges(true)
  }

  const handleImageReorder = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const newImages = [...prev.images]
      const [removed] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, removed)
      return {
        ...prev,
        images: newImages
      }
    })
    // Marcar que hay cambios sin guardar
    setHasUnsavedChanges(true)
  }

  const handleClearAllImages = () => {
setFormData(prev => ({
      ...prev,
      images: []
    }))
    // Marcar que hay cambios sin guardar
    setHasUnsavedChanges(true)
  }

  const handlePrecioNinosChange = (value: number | null) => {
    setPrecioNinos(value)
    // Marcar que hay cambios sin guardar
    setHasUnsavedChanges(true)
  }

  const handleEdadMaximaNinosChange = (value: number | null) => {
    setEdadMaximaNinos(value)
    // Marcar que hay cambios sin guardar
    setHasUnsavedChanges(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Limpiar y validar datos antes de enviar
    const cleanedData = {
      ...formData,
      // Asegurar que los arrays estén correctamente formateados
      images: Array.isArray(formData.images) ? formData.images : [],
      schedule: Array.isArray(formData.schedule) ? formData.schedule : [],
      what_to_bring: Array.isArray(formData.what_to_bring) ? formData.what_to_bring : [],
      included_services: Array.isArray(formData.included_services) ? formData.included_services : [],
      not_included_services: Array.isArray(formData.not_included_services) ? formData.not_included_services : [],
      pickup_locations: Array.isArray(formData.pickup_locations) ? formData.pickup_locations : [],
      dietary_options: Array.isArray(formData.dietary_options) ? formData.dietary_options : [],
      equipment_provided: Array.isArray(formData.equipment_provided) ? formData.equipment_provided : [],
      guide_languages: Array.isArray(formData.guide_languages) ? formData.guide_languages : [],
      // Asegurar que los números sean válidos
      price: Number(formData.price) || 0,
      duration: Number(formData.duration) || 60,
      min_group_size: Number(formData.min_group_size) || 1,
      max_group_size: Number(formData.max_group_size) || 1,
      capacity: Number(formData.capacity) || 0,
      min_age: Number(formData.min_age) || 18,
      seats: Number(formData.seats) || 4,
      doors: Number(formData.doors) || 4,
      deposit_amount: Number(formData.deposit_amount) || 0,
      // Asegurar que los booleanos sean válidos
      available: Boolean(formData.available),
      featured: Boolean(formData.featured),
      insurance_included: Boolean(formData.insurance_included),
      fuel_included: Boolean(formData.fuel_included),
      license_required: Boolean(formData.license_required),
      permit_required: Boolean(formData.permit_required),
      deposit_required: Boolean(formData.deposit_required),
      // Limpiar strings vacíos
      title: formData.title?.trim() || '',
      description: formData.description?.trim() || '',
      location: formData.location?.trim() || '',
      vehicle_type: formData.vehicle_type?.trim() || '',
      characteristics: formData.characteristics?.trim() || '',
      menu: formData.menu?.trim() || '',
      meeting_point_details: formData.meeting_point_details?.trim() || '',
      fuel_policy: formData.fuel_policy?.trim() || '',
      experience_type: formData.experience_type?.trim() || '',
      chef_name: formData.chef_name?.trim() || '',
      drink_options: formData.drink_options?.trim() || '',
      ambience: formData.ambience?.trim() || '',
      activity_type: formData.activity_type?.trim() || '',
      cancellation_policy: formData.cancellation_policy?.trim() || '',
      itinerary: formData.itinerary?.trim() || '',
      // Agregar rangos de edad personalizados
      precio_ninos: precioNinos,
      edad_maxima_ninos: edadMaximaNinos,
    }

    try {
      await onSubmit(cleanedData)
      // Si llegamos aquí, el envío fue exitoso - resetear estado de cambios
      setHasUnsavedChanges(false)
      
      // Actualizar initialFormData con los datos actuales incluyendo los rangos de edad
      const updatedInitialData = {
        ...cleanedData,
        precio_ninos: precioNinos,
        edad_maxima_ninos: edadMaximaNinos
      }
      setInitialFormData(updatedInitialData)
      
      // También actualizar el formData para mantener consistencia
      setFormData(prev => ({
        ...prev,
        ...cleanedData
      }))
    } catch (error) {
      // El error será manejado por el componente padre
      throw error
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
          <CardTitle className="flex items-center gap-2 text-green-900">
            <ClipboardList className="h-5 w-5" />
            Información Básica
          </CardTitle>
          <CardDescription className="text-green-700">
            Detalles principales del servicio que aparecerán en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                Título del Servicio *
              </Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ej: Excursión al Teide con Guía"
                className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500">Nombre atractivo que describa el servicio</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold text-gray-700">
                Ubicación General
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Ej: Parque Nacional del Teide"
                  className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <p className="text-xs text-gray-500">Ubicación principal donde se realiza el servicio</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Descripción *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              placeholder="Describe detalladamente el servicio, qué incluye, qué experiencias ofrece, etc."
              className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-xs text-gray-500">
              {formData.description.length}/500 caracteres
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                Categoría *
              </Label>
              <select
                id="category"
                value={formData.category_id}
                onChange={(e) => {
                  handleInputChange("category_id", e.target.value)
                }}
                disabled={loadingCategories}
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Selecciona una categoría</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Categoría principal del servicio</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory" className="text-sm font-semibold text-gray-700">
                Subcategoría
              </Label>
              <select
                id="subcategory"
                value={formData.subcategory_id}
                onChange={(e) => handleInputChange("subcategory_id", e.target.value)}
                disabled={loadingCategories || !formData.category_id || currentSubcategories.length === 0}
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">
                  {loadingCategories
                    ? "Cargando..."
                    : currentSubcategories.length === 0
                      ? "Sin subcategorías"
                      : "Selecciona una subcategoría"}
                </option>
                {currentSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Subcategoría específica (opcional)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Euro className="h-5 w-5" />
            Precios y Capacidad
          </CardTitle>
          <CardDescription className="text-blue-700">
            Configura los precios y la capacidad del servicio
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Precio principal */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                Precio Principal (€) *
              </Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500">Precio base para adultos</p>
            </div>

            {/* Capacidad total */}
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-sm font-semibold text-gray-700">
                Capacidad Total
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="capacity"
                  type="number"
                  min="0"
                  value={formData.capacity || ""}
                  onChange={(e) => handleInputChange("capacity", Number.parseInt(e.target.value) || 0)}
                  className="pl-10"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-gray-500">Máximo número de personas</p>
            </div>

            {/* Tipo de precio */}
            <div className="space-y-2">
              <Label htmlFor="price_type" className="text-sm font-semibold text-gray-700">
                Tipo de Precio
              </Label>
              <select
                id="price_type"
                value={formData.price_type}
                onChange={(e) => handleInputChange("price_type", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="per_person">Por persona</option>
                <option value="total">Precio total</option>
                <option value="age_ranges">Por rango de edad</option>
              </select>
              <p className="text-xs text-gray-500">
                {formData.price_type === "per_person" 
                  ? "Se cobra por cada participante" 
                  : formData.price_type === "total"
                  ? "Se cobra por el servicio completo"
                  : "Se cobra según la edad de cada participante"}
              </p>
            </div>

            {/* Tamaño mínimo del grupo */}
            <div className="space-y-2">
              <Label htmlFor="min_group_size" className="text-sm font-semibold text-gray-700">
                Mín. Personas
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="min_group_size"
                  type="number"
                  min="1"
                  value={formData.min_group_size || ""}
                  onChange={(e) => handleInputChange("min_group_size", Number.parseInt(e.target.value) || 1)}
                  className="pl-10"
                  placeholder="1"
                />
              </div>
              <p className="text-xs text-gray-500">Mínimo para reservar</p>
            </div>

            {/* Tamaño máximo del grupo */}
            <div className="space-y-2">
              <Label htmlFor="max_group_size" className="text-sm font-semibold text-gray-700">
                Máx. Personas
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="max_group_size"
                  type="number"
                  min="1"
                  value={formData.max_group_size || ""}
                  onChange={(e) => handleInputChange("max_group_size", Number.parseInt(e.target.value) || 1)}
                  className="pl-10"
                  placeholder="1"
                />
              </div>
              <p className="text-xs text-gray-500">Máximo por reserva</p>
            </div>
          </div>

          {/* Información adicional sobre precios */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Euro className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Información sobre precios</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Precio Principal:</strong> Se aplica a adultos y adolescentes</li>
                  <li>• <strong>Por persona:</strong> Cada participante paga individualmente</li>
                  <li>• <strong>Precio total:</strong> Se cobra una vez por el servicio completo</li>
                  <li>• <strong>Por rango de edad:</strong> Configura precios específicos por edad</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Editor de precios por edad */}
          {formData.price_type === "age_ranges" && (
            <div className="mt-6">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Configuración de Precios por Edad
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Configura precios específicos para diferentes rangos de edad. Los precios se aplicarán automáticamente según la edad de cada participante.
                </p>
                
                {service ? (
                  <SimpleAgePricing 
                    serviceId={service.id}
                    servicePrice={formData.price || 0}
                    onRangesChange={(ranges: unknown[]) => {
                      // Aquí puedes manejar los cambios en los rangos de edad
                      // Solo log en desarrollo y con throttling
                      if (process.env.NODE_ENV === 'development') {
                        console.log('Ranges changed:', ranges)
                      }
                    }}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Precios por edad</p>
                    <p className="text-sm">Los precios por edad se configurarán después de crear el servicio</p>
                    <p className="text-xs mt-2">Precio base: €{formData.price || 0}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles Específicos de {(selectedCategory as any).name}</CardTitle>
          </CardHeader>
          <CardContent>
            <CategorySpecificFields
              categoryName={(selectedCategory as any).name}
              formData={formData}
              handleInputChange={handleInputChange}
              setFormData={setFormData}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <Clock className="h-5 w-5" />
            Gestión de Horarios
          </CardTitle>
          <CardDescription className="text-indigo-700">
            Define los horarios disponibles para este servicio
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <TagInput
            label="Franjas Horarias Disponibles"
            items={formData.schedule}
            setItems={(items) => setFormData({ ...formData, schedule: items })}
            placeholder="Ej: 09:00 - 11:00, 14:00 - 16:00"
          />
          
          {/* Información sobre horarios */}
          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Clock className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-medium text-indigo-900 mb-1">Configuración de Horarios</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• <strong>Formato:</strong> Usa "HH:MM - HH:MM" para cada franja</li>
                  <li>• <strong>Múltiples horarios:</strong> Puedes añadir varios horarios disponibles</li>
                  <li>• <strong>Flexibilidad:</strong> Los clientes podrán elegir entre estos horarios</li>
                  <li>• <strong>Ejemplos:</strong> "09:00 - 11:00", "14:00 - 16:00", "Todo el día"</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Shield className="h-5 w-5" />
            Requisitos y Restricciones
          </CardTitle>
          <CardDescription className="text-orange-700">
            Define los requisitos necesarios para participar en el servicio
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="min_age" className="text-sm font-semibold text-gray-700">
                Edad Mínima Requerida
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="min_age"
                  type="number"
                  min="0"
                  value={formData.min_age || ""}
                  onChange={(e) => handleInputChange("min_age", Number.parseInt(e.target.value) || 0)}
                  className="pl-10"
                  placeholder="Ej: 18"
                />
              </div>
              <p className="text-xs text-gray-500">Edad mínima para participar en el servicio</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${formData.license_required ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <Shield className={`h-5 w-5 ${formData.license_required ? 'text-orange-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Label htmlFor="license_required" className="text-sm font-semibold text-gray-700">
                      Se Requiere Carnet/Licencia
                    </Label>
                    <p className="text-xs text-gray-500">
                      {formData.license_required ? 'Los participantes deben tener licencia válida' : 'No se requiere licencia especial'}
                    </p>
                  </div>
                </div>
                <Switch
                  id="license_required"
                  checked={formData.license_required}
                  onCheckedChange={(checked) => handleInputChange("license_required", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${formData.permit_required ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <Shield className={`h-5 w-5 ${formData.permit_required ? 'text-red-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Label htmlFor="permit_required" className="text-sm font-semibold text-gray-700">
                      Se Requiere Permiso Especial
                    </Label>
                    <p className="text-xs text-gray-500">
                      {formData.permit_required ? 'Se necesita permiso especial o autorización' : 'No se requiere permiso especial'}
                    </p>
                  </div>
                </div>
                <Switch
                  id="permit_required"
                  checked={formData.permit_required}
                  onCheckedChange={(checked) => handleInputChange("permit_required", checked)}
                />
              </div>
            </div>
          </div>
          
          {/* Información sobre requisitos */}
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-orange-900 mb-1">Importante sobre los Requisitos</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• <strong>Edad mínima:</strong> Se aplica a todos los participantes</li>
                  <li>• <strong>Licencia:</strong> Puede ser carnet de conducir, licencia deportiva, etc.</li>
                  <li>• <strong>Permiso especial:</strong> Para actividades que requieren autorización oficial</li>
                  <li>• Esta información se muestra claramente a los clientes antes de reservar</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
          <CardTitle className="flex items-center gap-2 text-pink-900">
            <ImageIcon className="h-5 w-5" />
            Imágenes del Servicio
          </CardTitle>
          <CardDescription className="text-pink-700">
            Sube imágenes de alta calidad que muestren el servicio. Se comprimirán automáticamente para optimizar el rendimiento.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <ImageIcon className="h-4 w-4 text-pink-600" />
              </div>
              <div>
                <h4 className="font-medium text-pink-900 mb-1">Recomendaciones para las imágenes</h4>
                <ul className="text-sm text-pink-700 space-y-1">
                  <li>• <strong>Calidad:</strong> Usa imágenes de alta resolución (mínimo 1200x800px)</li>
                  <li>• <strong>Formato:</strong> JPG o PNG preferiblemente</li>
                  <li>• <strong>Tamaño:</strong> Máximo 5MB por imagen</li>
                  <li>• <strong>Cantidad:</strong> Hasta 10 imágenes por servicio</li>
                  <li>• <strong>Contenido:</strong> Muestra el servicio, ubicación, equipamiento, etc.</li>
                </ul>
              </div>
            </div>
          </div>
          
          <ImageUpload
            onImagesUploaded={handleImageUpload}
            onImageRemove={handleImageRemove}
            initialImages={formData.images || []}
            maxImages={10}
            maxSizeMB={5}
            disabled={loading}
            showCompressionInfo={true}
          />
          
          {/* Mostrar imágenes ya subidas */}
          {formData.images && formData.images.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">Imágenes del servicio</h4>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800 border-pink-200">
                    {formData.images?.length || 0}/10
                  </Badge>
                </div>
                {formData.images && formData.images.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllImages}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar todas
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-pink-300 transition-colors">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Número de imagen */}
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs bg-white/90 text-gray-700 border-gray-300">
                          {index + 1}
                        </Badge>
                      </div>
                      
                      {/* Botón eliminar */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={() => handleImageRemove(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Información de compresión */}
              <div className="mt-4 p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <ImageIcon className="h-4 w-4 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium text-pink-900 mb-1">Sistema de optimización activo</p>
                    <p className="text-pink-700 text-sm">
                      Las imágenes se comprimen automáticamente para optimizar la velocidad de carga y mejorar la experiencia del usuario.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nueva sección para servicios incluidos */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <CheckCircle className="h-5 w-5" />
            Servicios Incluidos y Qué Llevar
          </CardTitle>
          <CardDescription className="text-emerald-700">
            Define qué incluye el servicio y qué debe traer el cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Servicios Incluidos */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <Label className="text-base font-semibold text-gray-900">
                  Servicios Incluidos
                </Label>
                <p className="text-sm text-gray-600">
                  Lista todos los servicios, equipos y beneficios incluidos en el precio
                </p>
              </div>
            </div>
            <TagInput
              label=""
              items={formData.included_services}
              setItems={(items) => setFormData({ ...formData, included_services: items })}
              placeholder="Ej: Guía profesional, Seguro de actividad, Equipamiento básico, Transporte, Comida..."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Incluye servicios, equipos y beneficios</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Separar cada elemento con Enter</span>
              </div>
            </div>
          </div>

          {/* Qué Llevar */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Label className="text-base font-semibold text-gray-900">
                  Qué Debe Llevar el Cliente
                </Label>
                <p className="text-sm text-gray-600">
                  Especifica qué elementos debe traer el cliente para el servicio
                </p>
              </div>
            </div>
            <TagInput
              label=""
              items={formData.what_to_bring}
              setItems={(items) => setFormData({ ...formData, what_to_bring: items })}
              placeholder="Ej: Crema solar, Ropa cómoda, Zapatos de senderismo, Cámara, Documentación..."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
              <div className="flex items-start gap-2">
                <ClipboardList className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Elementos que el cliente debe traer</span>
              </div>
              <div className="flex items-start gap-2">
                <ClipboardList className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Incluye ropa, equipos y documentos</span>
              </div>
            </div>
          </div>

          {/* Servicios No Incluidos */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <X className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <Label className="text-base font-semibold text-gray-900">
                  Servicios No Incluidos
                </Label>
                <p className="text-sm text-gray-600">
                  Aclara qué servicios o elementos NO están incluidos en el precio
                </p>
              </div>
            </div>
            <TagInput
              label=""
              items={formData.not_included_services}
              setItems={(items) => setFormData({ ...formData, not_included_services: items })}
              placeholder="Ej: Almuerzo, Bebidas, Propinas, Transporte desde hotel, Seguro adicional..."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
              <div className="flex items-start gap-2">
                <X className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>Servicios con costo adicional</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>Evita confusiones sobre el precio</span>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-medium text-emerald-900 mb-2">💡 Consejos para una buena descripción</h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• <strong>Servicios incluidos:</strong> Sé específico sobre qué está cubierto en el precio</li>
                  <li>• <strong>Qué llevar:</strong> Incluye elementos esenciales para la experiencia</li>
                  <li>• <strong>No incluidos:</strong> Aclara costos adicionales para evitar sorpresas</li>
                  <li>• <strong>Separación clara:</strong> Usa una línea por cada elemento para mejor legibilidad</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Shield className="h-5 w-5" />
            Configuración del Servicio
          </CardTitle>
          <CardDescription className="text-purple-700">
            Controla la visibilidad y el estado del servicio en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${formData.available ? 'bg-green-100' : 'bg-red-100'}`}>
                  {formData.available ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <Label htmlFor="available" className="text-sm font-semibold text-gray-700">
                    Servicio Disponible
                  </Label>
                  <p className="text-xs text-gray-500">
                    {formData.available ? 'Los clientes pueden reservar este servicio' : 'El servicio está temporalmente desactivado'}
                  </p>
                </div>
              </div>
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => handleInputChange("available", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${formData.featured ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  <Star className={`h-5 w-5 ${formData.featured ? 'text-yellow-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <Label htmlFor="featured" className="text-sm font-semibold text-gray-700">
                    Servicio Destacado
                  </Label>
                  <p className="text-xs text-gray-500">
                    {formData.featured ? 'Aparece en la sección de servicios destacados' : 'Aparece en la lista normal de servicios'}
                  </p>
                </div>
              </div>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleInputChange("featured", checked)}
              />
            </div>
          </div>
          
          {/* Información sobre la configuración */}
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-purple-900 mb-1">Gestión del Estado del Servicio</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• <strong>Disponible:</strong> Los clientes pueden ver y reservar el servicio</li>
                  <li>• <strong>No disponible:</strong> El servicio se oculta de la búsqueda pero no se elimina</li>
                  <li>• <strong>Destacado:</strong> Aparece en posiciones privilegiadas en la plataforma</li>
                  <li>• Puedes cambiar estos estados en cualquier momento</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancel} 
          disabled={loading}
          className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancelar {hasUnsavedChanges && <span className="text-orange-500 ml-1">*</span>}
        </Button>
        <Button 
          type="submit" 
          disabled={loading} 
          className="min-w-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              {service?.id ? "Actualizar" : "Crear"} Servicio
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default ServiceForm


