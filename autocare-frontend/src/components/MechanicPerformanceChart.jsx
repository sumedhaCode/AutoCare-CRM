import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const MechanicPerformanceChart = ({ data }) => {

  // 🔍 Safety log — remove later if you want
  console.log('MechanicPerformanceChart data:', data);

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-bold mb-2">Mechanic Performance</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          {/* ✅ FIXED FIELD */}
          <XAxis dataKey="mechanicName" />

          <YAxis />
          <Tooltip />

          {/* ✅ FIXED FIELD */}
          <Bar dataKey="completedJobs" fill="#3498db" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MechanicPerformanceChart;
