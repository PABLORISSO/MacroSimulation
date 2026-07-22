function Estructura() {
    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <h1 className="dashboard-title">Estructura económica</h1>
                <p>Contenido de la página Estructura.</p>
                <p>En esta sección se pueden incluir gráficos, tablas o cualquier otro tipo de contenido relacionado con la estructura económica del país.</p>
                <p>Por ejemplo, se podrían mostrar gráficos de la composición del PIB por sectores, la distribución del empleo por ramas de actividad, o la evolución de la participación de cada sector en el crecimiento económico.</p>
                <p>
                    ModuloPage
                    ├── HeaderModulo
                    ├── CardsResumen
                    ├── GraficoPrincipal
                    ├── GraficoSecundario
                    ├── TablaDatos
                    └── AnalisisBasico</p>

                <p>
                    CAPA 1 — Datos por módulo
                    Inflación | Tipo de cambio | Reservas | IPIM | EMAE

                    CAPA 2 — Análisis IA por módulo
                    Resumen, tendencia, alertas, lectura coyuntural

                    CAPA 3 — Análisis integrado
                    Pass-through
                    Ciclo económico
                    Riesgo cambiario
                    Actividad vs precios
                    Reservas vs presión cambiaria

                    CAPA 4 — Producto consultivo
                    Informes automáticos
                    Señales macro
                    Escenarios
                    Recomendaciones
                </p>

            </div>
        </div>
    );
}

export default Estructura;
