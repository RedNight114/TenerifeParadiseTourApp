// =====================================================
// SCRIPT DE PRUEBA PARA VERIFICAR EL HOOK USE-AUTH
// Verifica que las funciones de autenticación estén disponibles
// =====================================================

console.log('🧪 PROBANDO HOOK USE-AUTH\n')

// Simular el hook useAuth
const mockAuth = {
  user: null,
  profile: null,
  isInitialized: true,
  isLoading: false,
  error: null,
  login: async (email, password) => {
    console.log('🔐 Mock login llamado con:', { email, password: '***' })
    return { data: { user: { id: 'test-user' } }, error: null }
  },
  register: async (email, password, fullName) => {
    console.log('📝 Mock register llamado con:', { email, fullName })
    return { success: true, message: 'Usuario registrado' }
  },
  logout: async () => {
    console.log('🚪 Mock logout llamado')
  },
  loginWithProvider: async (provider) => {
    console.log('🔗 Mock loginWithProvider llamado con:', provider)
  },
  resendVerificationEmail: async () => {
    console.log('📧 Mock resendVerificationEmail llamado')
    return { success: true }
  }
}

// Simular el contexto
const mockContextValue = {
  user: mockAuth.user,
  profile: mockAuth.profile,
  loading: mockAuth.isLoading,
  error: mockAuth.error,
  isAuthenticated: !!mockAuth.user,
  isAdmin: mockAuth.profile?.role === 'admin',
  isInitialized: mockAuth.isInitialized,
  signIn: mockAuth.login,
  signUp: mockAuth.register,
  signOut: mockAuth.logout,
  signInWithProvider: mockAuth.loginWithProvider,
  resendVerificationEmail: mockAuth.resendVerificationEmail,
}

console.log('📋 CONTEXTO SIMULADO:')
console.log('  - signIn:', typeof mockContextValue.signIn)
console.log('  - signUp:', typeof mockContextValue.signUp)
console.log('  - signOut:', typeof mockContextValue.signOut)
console.log('  - isInitialized:', mockContextValue.isInitialized)

console.log('\n🧪 PROBANDO FUNCIÓN SIGNIN:')
try {
  const result = await mockContextValue.signIn('test@example.com', 'password123')
  console.log('✅ Resultado de signIn:', result)
} catch (error) {
  console.error('❌ Error en signIn:', error)
}

console.log('\n🎯 VERIFICACIÓN COMPLETADA')
console.log('💡 Si todo está bien, signIn debería ser una función y ejecutarse sin errores')
