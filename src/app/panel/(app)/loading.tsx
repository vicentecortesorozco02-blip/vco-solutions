/**
 * What a panel screen looks like while it loads.
 *
 * The chrome stays put and the canvas shows the shape of what is coming, so
 * a tap answers at once instead of leaving the screen frozen.
 */
export default function PanelLoading() {
  return (
    <div className="flex flex-col gap-8" aria-busy aria-label="Cargando">
      <div className="flex flex-col gap-3">
        <div className="h-8 w-48 rounded-xl bg-surface" />
        <div className="h-4 w-64 rounded-full bg-fill" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((tile) => (
          <div key={tile} className="h-24 rounded-2xl bg-surface" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="h-14 rounded-2xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
