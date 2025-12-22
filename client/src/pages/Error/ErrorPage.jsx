import { useRouteError, useNavigate, Link } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const getErrorMessage = () => {
    if (error?.status === 404) {
      return {
        title: "404 - Page Non Trouvée",
        message: "Désolé, la page que vous recherchez n'existe pas.",
        icon: "🔍",
      };
    }

    if (error?.status === 403) {
      return {
        title: "403 - Accès Refusé",
        message:
          "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
        icon: "🔒",
      };
    }

    if (error?.status === 500) {
      return {
        title: "500 - Erreur Serveur",
        message:
          "Une erreur interne du serveur est survenue. Veuillez réessayer plus tard.",
        icon: "⚠️",
      };
    }

    return {
      title: "Erreur",
      message: error?.message || "Une erreur inattendue est survenue.",
      icon: "❌",
    };
  };

  const errorInfo = getErrorMessage();

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
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
          {errorInfo.icon}
        </div>

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "1rem",
          }}
        >
          {errorInfo.title}
        </h1>

        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--text-secondary)",
            marginBottom: "2rem",
            lineHeight: "1.6",
          }}
        >
          {errorInfo.message}
        </p>

        {process.env.NODE_ENV === "development" && error?.stack && (
          <details
            style={{
              background: "var(--bg-secondary)",
              padding: "1rem",
              borderRadius: "0.5rem",
              marginBottom: "2rem",
              textAlign: "left",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                fontWeight: "600",
                color: "var(--error)",
                marginBottom: "0.5rem",
              }}
            >
              Détails de l'erreur (dev)
            </summary>
            <pre
              style={{
                fontSize: "0.875rem",
                overflow: "auto",
                color: "var(--text-secondary)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {error.stack}
            </pre>
          </details>
        )}

        <div
          className="btn-group"
          style={{ justifyContent: "center", gap: "1rem" }}
        >
          <button
            className="btn btn-primary btn-large"
            onClick={() => navigate(-1)}
          >
            ← Retour
          </button>

          <Link to="/" className="btn btn-secondary btn-large">
            🏠 Accueil
          </Link>
        </div>

        <div
          style={{
            marginTop: "2rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--border)",
          }}
        >
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Besoin d'aide ? Contactez le support technique
          </p>
        </div>
      </div>
    </div>
  );
}
