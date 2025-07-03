export default function HoursBox() {
  return (
    <div className="box-padrao">
      <h2 className="text-lg font-semibold">Qual sua meta de horas produtividade para hoje?</h2>
      <div className="flex items-center gap-2 flex-wrap">
        <input type="number" className="w-16 px-2 py-1 rounded bg-white text-center" defaultValue={6} />
        <button className="px-4 py-1 bg-blue-500 text-white rounded">Definir meta</button>
      </div>
      <p className="text-sm">Você já planejou 3h da sua meta diária (25%)</p>
      <div className="w-full bg-white h-3 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: "25%" }}></div>
      </div>
    </div>
  );
}
