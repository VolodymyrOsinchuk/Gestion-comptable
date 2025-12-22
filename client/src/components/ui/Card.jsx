export default function Card({ title, subtitle, children }) {
  return (
    <div className="card">
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h2 className="card-title">{title}</h2>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
