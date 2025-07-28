import './service-details.css'

export default function ServiceDetailsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="service-details-page">
      {children}
    </div>
  )
} 