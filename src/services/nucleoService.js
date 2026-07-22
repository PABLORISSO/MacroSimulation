export async function getInflacionNucleo() {
  const res = await fetch("/nucleo.csv");
  const text = await res.text();

  const rows = text.split("\n").slice(1);

  return rows
    .map((row) => {
      const [fecha, nucleo] = row.split(",");
      return {
        fecha,
        nucleo: parseFloat(nucleo),
      };
    })
    .filter((d) => d.fecha);
}