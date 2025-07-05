import { useState } from "react";
import { Sparkles, Clock, User, Lock, Download, LogOut } from "lucide-react";

export default function Settings() {
  const [pomodoroWork, setPomodoroWork] = useState(25);
  const [pomodoroBreak, setPomodoroBreak] = useState(5);
  const [pomodoroLongBreak, setPomodoroLongBreak] = useState(15);

  const [username, setUsername] = useState("Venushim");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notifications, setNotifications] = useState(true);
  const [monospace, setMonospace] = useState(false);

  const handleBackup = () => {
    console.log("Backup JSON gerado");
  };

  return (
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold mb-4">Configurações da Conta</h2>

      {/* Perfil */}
      <div className="space-y-4 max-w-md">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <User size={18} /> Perfil
        </h3>

        <div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-xl shadow">
          <label className="font-semibold">Nome de usuário</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-xl px-4 py-2 bg-white shadow text-center"
          />
        </div>
      </div>

      {/* Trocar Senha */}
      <div className="space-y-4 max-w-md">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Lock size={18} /> Segurança
        </h3>

        <div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-xl shadow">
          <label className="font-semibold">Senha atual</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="rounded-xl px-4 py-2 bg-white shadow"
          />

          <label className="font-semibold mt-2">Nova senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-xl px-4 py-2 bg-white shadow"
          />

          <label className="font-semibold mt-2">Confirmar nova senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-xl px-4 py-2 bg-white shadow"
          />
        </div>
      </div>

      {/* Configurações Pomodoro */}
      <div className="space-y-4 max-w-md">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Clock size={18} /> Pomodoro
        </h3>

        <div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <span>Tempo de trabalho (min)</span>
            <input
              type="number"
              min={5}
              max={120}
              value={pomodoroWork}
              onChange={(e) => setPomodoroWork(Number(e.target.value))}
              className="w-20 text-center rounded-full px-3 py-1 bg-white shadow"
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Pausa curta (min)</span>
            <input
              type="number"
              min={1}
              max={30}
              value={pomodoroBreak}
              onChange={(e) => setPomodoroBreak(Number(e.target.value))}
              className="w-20 text-center rounded-full px-3 py-1 bg-white shadow"
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Pausa longa (min)</span>
            <input
              type="number"
              min={5}
              max={60}
              value={pomodoroLongBreak}
              onChange={(e) => setPomodoroLongBreak(Number(e.target.value))}
              className="w-20 text-center rounded-full px-3 py-1 bg-white shadow"
            />
          </div>
        </div>
      </div>

      {/* Preferências */}
      <div className="space-y-4 max-w-md">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Sparkles size={18} /> Preferências
        </h3>

        <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl shadow">
          <span>Notificações</span>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`px-4 py-1 rounded-full text-white ${
              notifications ? "bg-indigo-500" : "bg-gray-400"
            }`}
          >
            {notifications ? "Ativo" : "Desativado"}
          </button>
        </div>

        <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl shadow">
          <span>Fonte monoespaçada</span>
          <button
            onClick={() => setMonospace(!monospace)}
            className={`px-4 py-1 rounded-full text-white ${
              monospace ? "bg-indigo-500" : "bg-gray-400"
            }`}
          >
            {monospace ? "Ativo" : "Desativado"}
          </button>
        </div>
      </div>

      {/* Backup */}
      <div className="space-y-4 max-w-md">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Download size={18} /> Backup de Dados
        </h3>

        <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl shadow">
          <span>Exportar JSON</span>
          <button
            onClick={handleBackup}
            className="px-4 py-1 bg-indigo-500 text-white rounded-full hover:opacity-90"
          >
            Baixar
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="max-w-md">
        <button className="flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-xl shadow hover:opacity-90">
          <LogOut size={18} />
          Sair da conta
        </button>
      </div>
    </div>
  );
}
