import { Button } from "@/components/ui/button";

export default function TagsBox() {
  return (
    <div className="box-padrao">
      <h2 className="text-lg font-semibold">Definir metas semanais por tags</h2>
      <div className="flex gap-2 flex-wrap">
        <input placeholder="tags +" className="px-2 py-1 rounded bg-white flex-1 min-w-[100px]" />
        <input placeholder="horas +" className="px-2 py-1 rounded bg-white w-20" />
        <button className="px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded">criar meta</button>
      </div>
      <div className="flex gap-2 mt-2 flex-wrap">
        <input placeholder="ler" className="px-2 py-1 rounded bg-white flex-1 min-w-[100px]" />
        <input placeholder="5" className="px-2 py-1 rounded bg-white w-20" />
        <Button> add meta</Button>
      
      </div>
    </div>
  );
}
