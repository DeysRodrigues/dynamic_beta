import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="p-40">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4">Bem-vindo ao seu painel!</p>

       <div className="flex min-h-svh flex-col items-center justify-center">
      <Button>Click me</Button>
    </div>
    </div>
  );
}
