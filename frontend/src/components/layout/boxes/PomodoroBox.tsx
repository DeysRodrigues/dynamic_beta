export default function PomodoroBox() {
  return (
    <div className="box-padrao">
      <div className="flex gap-2 flex-wrap">
        <button className="px-4 py-1 bg-indigo-200 rounded">work</button>
        <button className="px-4 py-1 bg-indigo-200 rounded">long break</button>
        <button className="px-4 py-1 bg-indigo-200 rounded">short break</button>
      </div>
      <h2 className="text-center font-semibold text-gray-700 mt-4">Pomodoro</h2>
      <p className="text-5xl text-center font-bold">23:31</p>
      <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full self-center">pause</button>
    </div>
  );
}

