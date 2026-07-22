import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#071426",
            background: "#f3f6fa",
            minHeight: "400px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2 style={{ margin: "0 0 20px", fontSize: "2rem" }}>Algo salió mal</h2>
          <p style={{ maxWidth: "500px", lineHeight: "1.6", color: "#475569" }}>
            Tuvimos un problema cargando esta sección. Por favor, recarga la página
            o intenta más tarde.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              borderRadius: "8px",
              background: "#006dff",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: "800",
              fontSize: "1rem",
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
