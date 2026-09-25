export function EducatorCard() {
  return (
    <aside className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className="relative">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#f3ddd0] font-medium text-primary">
          MF
        </div>
        <span
          className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-card bg-emerald-500"
          aria-label="Disponible"
        />
      </div>
      <div className="min-w-0 text-left">
        <p className="font-medium text-foreground">María Fernanda</p>
        <p className="text-sm text-muted-foreground">Educadora diferencial</p>
      </div>
    </aside>
  )
}
