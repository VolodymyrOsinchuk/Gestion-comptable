import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-secondary)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "1rem",
          padding: "3rem",
          maxWidth: "600px",
          width: "100%",
          boxShadow: "var(--shadow-lg)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "6rem", marginBottom: "1rem" }}>404</div>

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "1rem",
          }}
        >
          Page Non Trouvée
        </h1>

        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--text-secondary)",
            marginBottom: "2rem",
            lineHeight: "1.6",
          }}
        >
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <div
          className="btn-group"
          style={{ justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}
        >
          <Link to="/" className="btn btn-primary btn-large">
            🏠 Retour à l'accueil
          </Link>

          <Link to="/companies" className="btn btn-secondary">
            🏢 Entreprises
          </Link>
        </div>
      </div>
    </div>
  );
}
