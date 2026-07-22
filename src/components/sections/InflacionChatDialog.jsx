import { useState, useRef, useEffect } from "react";
import { chatInflacion } from "../../services/aiAnalysisService";

/**
 * Dialog flotante para hacer preguntas sobre inflación a la IA.
 * Recibe `contexto` con { mensual, interanual, acumulada, ultimaFecha }
 */
export default function InflacionChatDialog({ contexto = {} }) {
  const [open, setOpen] = useState(false);
  const [pregunta, setPregunta] = useState("");
  const [historial, setHistorial] = useState([]); // [{ rol, texto }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // Scroll automático al último mensaje
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historial, open]);

  // Focus en el input al abrir
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleEnviar = async () => {
    const texto = pregunta.trim();
    if (!texto || loading) return;

    const nuevaConv = [...historial, { rol: "user", texto }];
    setHistorial(nuevaConv);
    setPregunta("");
    setError("");
    setLoading(true);

    try {
      const result = await chatInflacion({
        pregunta: texto,
        contexto,
        historial: historial,
      });
      setHistorial([...nuevaConv, { rol: "assistant", texto: result.respuesta }]);
    } catch (err) {
      setError(err.message.includes("no disponible") ? "La IA no está disponible ahora." : `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  const handleLimpiar = () => {
    setHistorial([]);
    setError("");
    setPregunta("");
  };

  return (
    <>
      {/* Botón para abrir */}
      <button
        className="inflacion-chat-toggle"
        onClick={() => setOpen((v) => !v)}
        title="Preguntar a la IA sobre inflación"
      >
        💬 Preguntar a la IA
      </button>

      {/* Panel del chat */}
      {open && (
        <div className="inflacion-chat-dialog" role="dialog" aria-label="Chat IA inflación">
          {/* Cabecera */}
          <div className="inflacion-chat-header">
            <span>🤖 Asistente de inflación</span>
            <div className="inflacion-chat-header-actions">
              {historial.length > 0 && (
                <button
                  className="inflacion-chat-clear"
                  onClick={handleLimpiar}
                  title="Limpiar conversación"
                >
                  ↺
                </button>
              )}
              <button
                className="inflacion-chat-close"
                onClick={() => setOpen(false)}
                title="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="inflacion-chat-messages">
            {historial.length === 0 && !loading && (
              <p className="inflacion-chat-hint">
                Preguntame sobre la inflación actual, tendencias, categorías o cualquier dato del panel.
              </p>
            )}

            {historial.map((msg, i) => (
              <div
                key={i}
                className={`inflacion-chat-msg inflacion-chat-msg--${msg.rol}`}
              >
                <span className="inflacion-chat-bubble">{msg.texto}</span>
              </div>
            ))}

            {loading && (
              <div className="inflacion-chat-msg inflacion-chat-msg--assistant">
                <span className="inflacion-chat-bubble inflacion-chat-typing">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </span>
              </div>
            )}

            {error && (
              <div className="inflacion-chat-error">{error}</div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="inflacion-chat-input-row">
            <textarea
              ref={inputRef}
              className="inflacion-chat-input"
              placeholder="Escribí tu pregunta..."
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={loading}
            />
            <button
              className="inflacion-chat-send"
              onClick={handleEnviar}
              disabled={loading || !pregunta.trim()}
              title="Enviar (Enter)"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
