export function UploadCard({ title, description, children }) {
  return (
    <article className="upload-card">
      <div className="section-heading">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </article>
  )
}
