import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // La página del método vivía en /metodo antes de llamarse Método VCO.
      { source: "/metodo", destination: "/metodo-vco", permanent: true },
    ];
  },
  experimental: {
    // Volver a una pantalla vista hace menos de medio minuto no vuelve a
    // pedirla al servidor: la navegación del panel se siente instantánea.
    staleTimes: { dynamic: 30, static: 300 },
  },
};

export default nextConfig;
