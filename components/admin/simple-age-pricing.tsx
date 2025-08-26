import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Euro, Users } from 'lucide-react';

interface SimpleAgePricingProps {
  precioNinos: number | null;
  edadMaximaNinos: number | null;
  onPrecioNinosChange: (value: number | null) => void;
  onEdadMaximaNinosChange: (value: number | null) => void;
}

export function SimpleAgePricing({
  precioNinos,
  edadMaximaNinos,
  onPrecioNinosChange,
  onEdadMaximaNinosChange
}: SimpleAgePricingProps) {
  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onPrecioNinosChange(null);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onPrecioNinosChange(numValue);
      }
    }
  };

  const handleEdadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onEdadMaximaNinosChange(null);
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 18) {
        onEdadMaximaNinosChange(numValue);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-blue-600" />
          Precios por Edad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Precio para Niños */}
          <div className="space-y-2">
            <Label htmlFor="precio-ninos" className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-green-600" />
              Precio para Niños
            </Label>
            <Input
              id="precio-ninos"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={precioNinos || ''}
              onChange={handlePrecioChange}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Precio especial para niños menores de la edad especificada
            </p>
          </div>

          {/* Edad Máxima para Niños */}
          <div className="space-y-2">
            <Label htmlFor="edad-maxima-ninos" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-600" />
              Edad Máxima para Niños
            </Label>
            <Input
              id="edad-maxima-ninos"
              type="number"
              min="0"
              max="18"
              placeholder="12"
              value={edadMaximaNinos || ''}
              onChange={handleEdadChange}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Edad máxima para aplicar precio de niños (0-18 años)
            </p>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Si no se especifica precio para niños, se aplicará el precio normal a todas las edades.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
