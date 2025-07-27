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
import { X, Loader2, Plus, Trash2, Check, Shield, Car, Utensils, Activity, ClipboardList, Image as ImageIcon } from "lucide-react"
import { useCategories } from "@/hooks/use-categories"
import type { Service } from "@/lib/supabase"
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from "@/components/ui/use-toast"

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
  console.log('🔍 CategorySpecificFields - categoryName:', categoryName)
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

  console.log('🔍 Switch categoryName:', categoryName)
  switch (categoryName) {
    case "Actividades & Aventuras":
      console.log('✅ Caso Actividades & Aventuras encontrado')
      return adventureFields
    case "Alquiler de Vehículos":
      console.log('✅ Caso Alquiler de Vehículos encontrado')
      return vehicleFields
    case "Experiencias Gastronómicas":
      console.log('✅ Caso Experiencias Gastronómicas encontrado')
      return gastronomyFields
    default:
      console.log('❌ Caso por defecto - categoría no encontrada:', categoryName)
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
      console.log('🔄 Cargando servicio existente:', service)
      console.log('🖼️ service.images:', service.images)
      console.log('🖼️ Tipo de service.images:', typeof service.images)
      console.log('🖼️ Es array?', Array.isArray(service.images))
      
      // Extraer solo los campos de la tabla, no las relaciones
      const {
        category,
        subcategory,
        ...serviceFields
      } = service;
      
      const processedImages = Array.isArray(service.images) ? service.images : []
      console.log('🖼️ processedImages:', processedImages)
      
      setFormData((prev) => {
        const newFormData = {
          ...prev,
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
        console.log('🔄 Nuevo formData.images:', newFormData.images)
        return newFormData
      })
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
    () => {
      const category = categories.find((c) => c.id === formData.category_id)
      console.log('🔍 selectedCategory encontrado:', category)
      return category
    },
    [formData.category_id, categories],
  )

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const removeImage = (index: number) => {
    console.log('🗑️ Eliminando imagen en índice:', index)
    setFormData((prev) => {
      const currentImages = Array.isArray(prev.images) ? prev.images : []
      const newImages = currentImages.filter((_, i) => i !== index)
      console.log('🗑️ Nuevo estado de images después de eliminar:', newImages)
      return { 
        ...prev, 
        images: newImages
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('📝 Formulario enviado - formData.images:', formData.images)
    console.log('📝 Tipo de formData.images:', typeof formData.images)
    console.log('📝 Es array?', Array.isArray(formData.images))
    
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
    }
    
    console.log('🧹 Datos limpios a enviar:', cleanedData)
    console.log('🧹 cleanedData.images específicamente:', cleanedData.images)
    console.log('🧹 Tipo de cleanedData.images:', typeof cleanedData.images)
    console.log('🧹 Es array?', Array.isArray(cleanedData.images))
    
    await onSubmit(cleanedData)
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
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Imágenes del Servicio
          </CardTitle>
          <CardDescription>
            Sube imágenes de alta calidad. Se comprimirán automáticamente para optimizar el rendimiento y velocidad de carga.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            onImagesUploaded={(urls) => {
              console.log('🎯 Callback onImagesUploaded ejecutado con URLs:', urls)
              console.log('📝 Estado anterior de formData.images:', formData.images)
              
              // Asegurar que urls sea un array válido
              const validUrls = Array.isArray(urls) ? urls.filter(url => url && typeof url === 'string') : []
              console.log('📝 URLs válidas filtradas:', validUrls)
              
              setFormData((prev) => {
                // Asegurar que prev.images sea siempre un array
                const currentImages = Array.isArray(prev.images) ? prev.images : []
                const newImages = [...currentImages, ...validUrls]
                console.log('📝 Nuevo estado de formData.images:', newImages)
                return { ...prev, images: newImages }
              })
              
              if (validUrls.length > 0) {
                toast({
                  title: "Imágenes subidas",
                  description: `${validUrls.length} imagen(es) agregada(s) al servicio`,
                })
              } else {
                toast({
                  title: "Error",
                  description: "No se pudieron procesar las imágenes",
                  variant: "destructive"
                })
              }
            }}
            maxImages={10}
            maxSizeMB={5}
            disabled={loading}
            showCompressionInfo={true}
          />
          
          {/* Mostrar imágenes ya subidas */}
          {formData.images && formData.images.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Imágenes del servicio ({formData.images?.length || 0}/10)</h4>
                {formData.images && formData.images.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, images: [] }))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar todas
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative overflow-hidden rounded-lg border">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Número de imagen */}
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>
                      
                      {/* Botón eliminar */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Información de compresión */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <ImageIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Sistema de compresión activo</p>
                    <p className="text-blue-600 mt-1">
                      Las imágenes se comprimen automáticamente a máximo 5MB para optimizar la velocidad de carga.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
        <Button type="submit" disabled={loading} className="min-w-32">
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
