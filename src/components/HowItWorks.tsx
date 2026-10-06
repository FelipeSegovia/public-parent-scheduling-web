const steps = [
  {
    title: 'Elige un horario libre',
    text: 'Al reservar, el cupo queda tomado para tu familia.',
  },
  {
    title: 'Deja tus datos',
    text: 'Los tuyos y los de tu hijo o hija. No necesitas cuenta.',
  },
  {
    title: 'Confirma desde tu correo',
    text: 'Te llega un correo con los enlaces Confirmo y No puedo.',
  },
]

export function HowItWorks() {
  return (
    <section aria-labelledby="como-funciona" className="mb-10">
      <h2 id="como-funciona" className="sr-only">
        Cómo funciona
      </h2>
      <ol className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="flex items-start gap-3.5 rounded-2xl bg-brand-soft p-5 text-left"
          >
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-card text-sm font-semibold text-primary tabular-nums"
            >
              {i + 1}
            </span>
            <div>
              <p className="font-semibold text-foreground">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
