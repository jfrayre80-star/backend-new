#!/usr/bin/env node
/**
 * RNF-05 — Benchmark del tiempo de escaneo y validación de QR.
 *
 * Mide la latencia del endpoint POST /api/attendance/scan (el mismo que usa el
 * alumno al escanear el QR), reporta métricas y valida el requisito:
 *   "El escaneo y validación del QR dinámico no debe demorar más de 2 segundos
 *    en impactar en la pantalla del profesor."  (umbral: 2000 ms)
 *
 * Uso:
 *   node scripts/benchmark-qr.mjs --url http://localhost:3000 \
 *       --token <token-del-alumno> --qr <hash-del-qr> \
 *       --iterations 30 --concurrency 5 --threshold 2000
 *
 * Si el token/qr no son válidos la petición igualmente recorre el handler de
 * validación del QR (lookups en BD), por lo que la métrica sigue siendo
 * representativa de la latencia de validación del lado del servidor.
 */
import process from "node:process";

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
};

const url = getArg("--url", "http://localhost:3000");
const token = getArg("--token", "");
const qrHash = getArg("--qr", "");
const iterations = parseInt(getArg("--iterations", "30"), 10);
const concurrency = parseInt(getArg("--concurrency", "5"), 10);
const threshold = parseInt(getArg("--threshold", "2000"), 10);
const timeoutMs = parseInt(getArg("--timeout", "5000"), 10);

if (!token || !qrHash) {
  console.error("Falta --token o --qr. Uso:");
  console.error(
    "  node scripts/benchmark-qr.mjs --url <url> --token <token-alumno> --qr <hash> [--iterations N] [--concurrency N] [--threshold MS]"
  );
  process.exit(2);
}

const endpoint = `${url}/api/attendance/scan`;

/**
 * Realiza una petición de escaneo y devuelve la latencia en ms.
 * @returns {{ ms: number, status: number }}
 */
function singleScan() {
  const start = process.hrtime.bigint();
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ qrHash }),
    signal: AbortSignal.timeout(timeoutMs),
  })
    .then((res) => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      return { ms, status: res.status };
    })
    .catch((err) => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      return { ms, status: err.name === "TimeoutError" ? 0 : -1 };
    });
}

/** Ejecuta `tasks` promesas con `limit` en paralelo. */
async function runPool(tasks, limit) {
  const results = [];
  let cursor = 0;
  const worker = async () => {
    while (cursor < tasks.length) {
      const i = cursor++;
      results[i] = await tasks[i]();
    }
  };
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

/** p-percentil de un arreglo ordenado. */
function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.ceil((p / 100) * sorted.length) - 1
  );
  return sorted[Math.max(0, idx)];
}

async function main() {
  console.log(`RNF-05 Benchmark QR`);
  console.log(`  Endpoint   : ${endpoint}`);
  console.log(`  Peticiones : ${iterations} (concurrencia ${concurrency})`);
  console.log(`  Umbral     : ${threshold} ms\n`);

  const tasks = Array.from({ length: iterations }, () => singleScan);
  const results = await runPool(tasks, concurrency);

  const latencies = results.map((r) => r.ms).sort((a, b) => a - b);
  const ok = results.filter((r) => r.status >= 200 && r.status < 300).length;
  const failed = results.filter((r) => r.status === 0 || r.status === -1).length;
  const others = results.length - ok - failed;

  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const report = {
    peticiones: iterations,
    ok: ok,
    error: failed,
    otros_http: others,
    avg_ms: Number(avg.toFixed(2)),
    min_ms: Number(latencies[0]?.toFixed(2) ?? 0),
    p50_ms: Number(percentile(latencies, 50).toFixed(2)),
    p95_ms: Number(percentile(latencies, 95).toFixed(2)),
    p99_ms: Number(percentile(latencies, 99).toFixed(2)),
    max_ms: Number(latencies[latencies.length - 1]?.toFixed(2) ?? 0),
  };

  console.table(report);

  const p99 = report.p99_ms;
  const pass = p99 <= threshold && failed === 0;
  console.log(
    pass
      ? `\n[PASS] p99 (${p99} ms) dentro del límite de ${threshold} ms sin errores.`
      : `\n[FAIL] p99 (${p99} ms) excede ${threshold} ms o hubo ${failed} errores.`
  );
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error("Error ejecutando el benchmark:", err);
  process.exit(1);
});
