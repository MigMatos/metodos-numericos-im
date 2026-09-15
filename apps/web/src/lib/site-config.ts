export const SITE_CONFIG = {
  subject: "Métodos Numéricos",
  subjectDisplay: "MÉTODOS NUMÉRICOS",
  student: "Fernando Ivan Manrique Aguilar",
  career: "Ingeniería en Mecatrónica",

  presentation: {
    kicker: "Laboratorio virtual · Ingeniería en Mecatrónica",
    lead: "Un viaje interactivo por los métodos para encontrar raíces.",
    extra:
      "Explora, calcula y analiza cada iteración con datos reales: Regla Falsa, Newton-Raphson, Secante y Punto Fijo.",
    ctaLabel: "INICIAR EVENTO",
    hint: "Pulsa el botón para despegar. La secuencia se puede saltar con cualquier tecla.",
  },

  unitsMenu: {
    title: "MÉTODOS NUMÉRICOS",
    subtitle: "Selecciona una unidad para continuar.",
    backLabel: "VOLVER AL INICIO",
  },

  unitTwo: {
    label: "UNIDAD 2",
    title: "MÉTODOS PARA ENCONTRAR RAÍCES",
    subtitle: "Selecciona el método que deseas estudiar y ejecutar.",
    ctaLabel: "ABRIR LABORATORIO",
  },

  units: [
    {
      label: "UNIDAD 2",
      title: "Métodos para encontrar raíces",
      detail: "Regla Falsa · Newton-Raphson · Secante · Punto Fijo",
      available: true,
    },
    {
      label: "UNIDAD 3",
      title: "Contenido en desarrollo",
      detail: "Sistemas de ecuaciones lineales",
      available: false,
    },
    {
      label: "UNIDAD 4",
      title: "Contenido en desarrollo",
      detail: "Interpolación y ajuste de curvas",
      available: false,
    },
    {
      label: "UNIDAD 5",
      title: "Contenido en desarrollo",
      detail: "Integración y ecuaciones diferenciales",
      available: false,
    },
  ],
} as const
