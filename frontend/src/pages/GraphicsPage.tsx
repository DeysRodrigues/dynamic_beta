// src/pages/graphics.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTaskContext } from "../context/TaskContext";

export default function GraphicsPage() {
  const { tasks } = useTaskContext();

  const groupTasksByDate = () => {
    const grouped: {
      [key: string]: { completed: number; incomplete: number };
    } = {};

    tasks.forEach((task) => {
      if (!grouped[task.date]) {
        grouped[task.date] = { completed: 0, incomplete: 0 };
      }
      if (task.completed) {
        grouped[task.date].completed += 1;
      } else {
        grouped[task.date].incomplete += 1;
      }
    });

    return Object.entries(grouped).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  };

  const pieChartData = [
    {
      name: "Concluídas",
      value: tasks.filter((task) => task.completed).length,
    },
    {
      name: "Não Concluídas",
      value: tasks.filter((task) => !task.completed).length,
    },
  ];

  const COLORS = ["#6366F1", "#F43F5E"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Gráficos de Tarefas</h1>

      {/* Gráfico de Barras */}
      <div className="bg-gray-100 p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Tarefas por Data</h2>
        <BarChart
          width={600}
          height={300}
          data={groupTasksByDate()}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" fill="#6366F1" name="Concluídas" />
          <Bar dataKey="incomplete" fill="#F43F5E" name="Não Concluídas" />
        </BarChart>
      </div>

      {/* Gráfico de Pizza */}
      <div className="bg-gray-100 p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Distribuição de Tarefas</h2>
        <PieChart width={400} height={300}>
          <Pie
            data={pieChartData}
            cx={200}
            cy={150}
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) =>
              `${name}: ${percent ? (percent * 100).toFixed(0) : "0"}%`
            }
          >
            {pieChartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
    </div>
  );
}
