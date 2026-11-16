export default function Card({ title, subtitle, image, stats = [], children }) {
  return (
    <article className="card">
      {image && <img className="card-img" src={image} alt={title} loading="lazy" />}
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
        {stats.length > 0 && (
          <ul className="card-stats">
            {stats.map((s) => (
              <li key={s.label}>
                <span className="stat-label">{s.label}</span>
                <span className="stat-value">{s.value}</span>
              </li>
            ))}
          </ul>
        )}
        {children}
      </div>
    </article>
  );
}