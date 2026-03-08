import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-mango text-white hover:bg-mango-dark',
  secondary: 'bg-mango-light text-mango-dark border border-border',
  danger: 'bg-red-light text-red border border-red/30',
  success: 'bg-green-light text-green border border-green/30',
  ghost: 'bg-transparent hover:bg-mango-light',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl font-medium
        transition-all duration-150
        cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}
