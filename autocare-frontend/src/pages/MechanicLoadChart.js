import React, { useEffect, useState } from 'react';
import axios from 'axios';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#333',
        font: { size: 16, weight: 'bold' }
      }
    },
    title: {
      display: false
    },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#4285f4',
      bodyColor: '#333',
      borderColor: '#4285f4',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      grid: {
        color: '#e3e3e3'
      },
      ticks: {
        color: '#555',
        font: { size: 14 }
      }
    },
    y: {
      grid: {
        color: '#f5f5f5'
      },
      ticks: {
        color: '#555',
        font: { size: 14 }
      },
      beginAtZero: true
    }
  },
  elements: {
    bar: {
      borderRadius: 8
    }
  },
  animation: {
    duration: 1200,
    easing: 'easeOutQuart'
  }
};

const MechanicLoadChart = () => {
  const [chartData, setChartData] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:8080/api/admin/reports/mechanics', {

      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
  // ===============================
  // FIX — align with backend DTO
  // ===============================
  const labels = res.data.map(item => item.mechanicName);
  const values = res.data.map(item => item.completedJobs); 
  // OR use item.totalTasks if you prefer

  setChartData({
    labels,
    datasets: [
      {
        label: 'Completed Jobs per Mechanic',
        data: values,
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, '#4285f4');
          gradient.addColorStop(1, '#90caf9');
          return gradient;
        },
        borderWidth: 1,
        borderColor: '#4285f4',
        hoverBackgroundColor: '#1565c0'
      }
    ]
  });
})

    .catch(err => console.error('Failed to fetch mechanic load data:', err));
  }, [token]);

  return (
    <div
      style={{
        maxWidth: '650px',
        margin: '40px auto',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '18px',
        boxShadow: '0 6px 32px rgba(66,133,244,0.12)',
        padding: '32px 28px 28px 28px'
      }}
    >
      <h2 style={{
        textAlign: 'center',
        color: '#1565c0',
        letterSpacing: '1px',
        marginBottom: '28px',
        fontWeight: 700
      }}>
        📊 Mechanic Load Chart
      </h2>
      {chartData ? (
        <Bar data={chartData} options={chartOptions} height={340} />
      ) : (
        <p style={{ textAlign: 'center', color: '#888', fontSize: '18px' }}>Loading chart...</p>
      )}
    </div>
  );
};

export default MechanicLoadChart;

