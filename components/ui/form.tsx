"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

type FormContextType = {
  values: Record<string, any>
  errors: Record<string, string>
  setValue: (name: string, value: any) => void
  setError: (name: string, message: string) => void
  clearErrors: (name: string) => void
}

const FormContext = React.createContext<FormContextType | null>(null)

function useFormContext() {
  const context = React.useContext(FormContext)
  if (!context) {
    throw new Error("useFormContext must be used within a <Form />")
  }
  return context
}

type FormProps = {
  children: React.ReactNode
  onSubmit?: (values: Record<string, any>) => void
  className?: string
}

const Form = React.forwardRef<
  HTMLFormElement,
  React.HTMLAttributes<HTMLFormElement> & FormProps
>(({ children, onSubmit, className, ...props }, ref) => {
  const [values, setValues] = React.useState<Record<string, any>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const setValue = React.useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    // Clear error when value is set
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }, [errors])

  const setError = React.useCallback((name: string, message: string) => {
    setErrors(prev => ({ ...prev, [name]: message }))
  }, [])

  const clearErrors = React.useCallback((name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }, [])

  const handleSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(values)
    }
  }, [onSubmit, values])

  return (
    <FormContext.Provider
      value={{
        values,
        errors,
        setValue,
        setError,
        clearErrors,
      }}
    >
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={cn("space-y-4", className)}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  )
})
Form.displayName = "Form"

type FormFieldProps = {
  name: string
  children: (props: {
    field: {
      value: any
      onChange: (value: any) => void
      onBlur: () => void
    }
    fieldState: {
      error?: string
    }
  }) => React.ReactNode
}

const FormField = ({ name, children }: FormFieldProps) => {
  const { values, errors, setValue } = useFormContext()

  const field = {
    value: values[name] || '',
    onChange: (value: any) => setValue(name, value),
    onBlur: () => {}, // Simple implementation
  }

  const fieldState = {
    error: errors[name],
  }

  return <>{children({ field, fieldState })}</>
}

type FormItemProps = {
  children: React.ReactNode
  className?: string
}

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & FormItemProps
>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-2", className)}
    {...props}
  >
    {children}
  </div>
))
FormItem.displayName = "FormItem"

type FormLabelProps = {
  children: React.ReactNode
  className?: string
}

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & FormLabelProps
>(({ children, className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("text-sm font-medium", className)}
    {...props}
  >
    {children}
  </Label>
))
FormLabel.displayName = "FormLabel"

type FormControlProps = {
  children: React.ReactNode
}

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & FormControlProps
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
))
FormControl.displayName = "FormControl"

type FormMessageProps = {
  children?: React.ReactNode
  className?: string
}

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & FormMessageProps
>(({ children, className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-red-600", className)}
    {...props}
  >
    {children}
  </p>
))
FormMessage.displayName = "FormMessage"

type FormDescriptionProps = {
  children: React.ReactNode
  className?: string
}

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & FormDescriptionProps
>(({ children, className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600", className)}
    {...props}
  >
    {children}
  </p>
))
FormDescription.displayName = "FormDescription"

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
  useFormContext,
}