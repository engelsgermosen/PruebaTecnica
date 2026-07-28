import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '@/lib/axiosClient'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTaxReceipts } from '@/hooks/useTaxReceipts'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Dashboard = () => {
  const navigate = useNavigate()
  const api = useApi()
  const [stats, setStats] = useState({
    totalTaxPayers: 0,
    totalReceipts: 0,
    totalRevenue: 0,
    totalITBIS: 0,
    totalTaxPayerTypes: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentTaxPayers, setRecentTaxPayers] = useState([])
  const { data: recentReceipts, loading: receiptsLoading } = useTaxReceipts(1, 5)
  const [taxPayerTypes, setTaxPayerTypes] = useState([])
  const [allReceipts, setAllReceipts] = useState([])
  const [allTaxPayers, setAllTaxPayers] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [monthlyStats, setMonthlyStats] = useState([])
  const [loadingMonthly, setLoadingMonthly] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch taxpayers
      const taxpayersRes = await api.get('/taxpayers')
      const taxpayers = taxpayersRes.data?.items || []
      
      // Fetch tax receipts for statistics
      const receiptsRes = await api.get('/taxreceipts?page=1&pageSize=1000')
      const allReceipts = receiptsRes.data?.items || []

      // Fetch monthly stats for current year
      const monthlyRes = await api.get(`/taxreceipts/stats/monthly?year=${selectedYear}`)
      setMonthlyStats(monthlyRes.data || [])
      
      // Fetch taxpayer types
      const typesRes = await api.get('/taxpayertypes')
      const types = typesRes.data || []
      
      // Calculate stats
      const totalRevenue = allReceipts.reduce((sum, r) => sum + (r.amount || 0), 0)
      const totalITBIS = allReceipts.reduce((sum, r) => sum + (r.itbis18 || 0), 0)
      
      setStats({
        totalTaxPayers: taxpayers.length,
        totalReceipts: allReceipts.length,
        totalRevenue: totalRevenue,
        totalITBIS: totalITBIS,
        totalTaxPayerTypes: types.length
      })
      
      // Get recent taxpayers (last 5)
      setRecentTaxPayers(taxpayers.slice(-5).reverse())
      setTaxPayerTypes(types)
      setAllReceipts(allReceipts)
      setAllTaxPayers(taxpayers)
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyStats = async (year) => {
    setLoadingMonthly(true)
    try {
      const monthlyRes = await api.get(`/taxreceipts/stats/monthly?year=${year}`)
      setMonthlyStats(monthlyRes.data || [])
    } catch (error) {
      console.error('Error fetching monthly stats:', error)
      setMonthlyStats([])
    } finally {
      setLoadingMonthly(false)
    }
  }

  const handleYearChange = (year) => {
    setSelectedYear(year)
    fetchMonthlyStats(year)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount || 0)
  }

  const StatCard = ({ title, value, icon, gradient, onClick }) => (
    <Card 
      className={`cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-xl border-2 ${gradient} group overflow-hidden`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/80 mb-1.5">{title}</p>
            {loading ? (
              <Skeleton className="h-6 w-20 bg-white/20" />
            ) : (
              <p className="text-xl font-bold text-white wrap-break-words">{value}</p>
            )}
          </div>
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors shrink-0">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen flex-1 p-6 space-y-6">
      

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="👥 Contribuyentes"
          value={stats.totalTaxPayers}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-300"
          onClick={() => navigate('/auth/taxpayers')}
          icon={
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        
        <StatCard
          title="📄 Comprobantes"
          value={stats.totalReceipts}
          gradient="bg-gradient-to-br from-green-500 to-emerald-600 border-green-300"
          onClick={() => navigate('/auth/taxreceipts')}
          icon={
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          }
        />
        
        <StatCard
          title="💰 Ingresos Total"
          value={formatCurrency(stats.totalRevenue)}
          gradient="bg-gradient-to-br from-purple-500 to-pink-600 border-purple-300"
          onClick={() => navigate('/auth/taxreceipts')}
          icon={
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />
        
        <StatCard
          title="🧮 ITBIS Total"
          value={formatCurrency(stats.totalITBIS)}
          gradient="bg-gradient-to-br from-red-500 to-rose-600 border-red-300"
          onClick={() => navigate('/auth/taxreceipts')}
          icon={
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
        />
        
        <StatCard
          title="🏷️ Tipos"
          value={stats.totalTaxPayerTypes}
          gradient="bg-gradient-to-br from-yellow-500 to-orange-600 border-yellow-300"
          onClick={() => navigate('/auth/taxpayertypes')}
          icon={
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />
      </div>

      {/* Charts Section */}
      {!loading && allReceipts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs ITBIS Chart */}
          <Card className="shadow-xl border-2 border-indigo-100 rounded-2xl">
            <CardHeader className="bg-linear-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle>Ingresos vs ITBIS</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Bar
                data={{
                  labels: ['Monto Base', 'ITBIS', 'Total'],
                  datasets: [
                    {
                      label: 'Ingresos (DOP)',
                      data: [
                        stats.totalRevenue,
                        stats.totalITBIS,
                        stats.totalRevenue + stats.totalITBIS
                      ],
                      backgroundColor: [
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                      ],
                      borderColor: [
                        'rgb(79, 70, 229)',
                        'rgb(239, 68, 68)',
                        'rgb(16, 185, 129)'
                      ],
                      borderWidth: 2,
                      borderRadius: 8
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      cornerRadius: 8,
                      titleFont: {
                        size: 14,
                        weight: 'bold'
                      },
                      bodyFont: {
                        size: 13
                      },
                      callbacks: {
                        label: function(context) {
                          return formatCurrency(context.parsed.y)
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '$' + (value / 1000).toFixed(0) + 'K'
                        }
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Distribution Chart */}
          <Card className="shadow-xl border-2 border-pink-100 rounded-2xl">
            <CardHeader className="bg-linear-to-r from-pink-50 to-rose-50 border-b-2 border-pink-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <CardTitle>Distribución de Ingresos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <Doughnut
                  data={{
                    labels: ['Monto Base', 'ITBIS'],
                    datasets: [
                      {
                        data: [stats.totalRevenue, stats.totalITBIS],
                        backgroundColor: [
                          'rgba(139, 92, 246, 0.8)',
                          'rgba(236, 72, 153, 0.8)'
                        ],
                        borderColor: [
                          'rgb(139, 92, 246)',
                          'rgb(236, 72, 153)'
                        ],
                        borderWidth: 3,
                        hoverOffset: 10
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          font: {
                            size: 13,
                            weight: 'bold'
                          },
                          usePointStyle: true,
                          pointStyle: 'circle'
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                          size: 14,
                          weight: 'bold'
                        },
                        bodyFont: {
                          size: 13
                        },
                        callbacks: {
                          label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0)
                            const percentage = ((context.parsed / total) * 100).toFixed(1)
                            return context.label + ': ' + formatCurrency(context.parsed) + ' (' + percentage + '%)'
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Receipts Chart */}
      {!loading && (
        <Card className="shadow-xl border-2 border-cyan-100 rounded-2xl">
          <CardHeader className="bg-linear-to-r from-cyan-50 to-blue-50 border-b-2 border-cyan-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <CardTitle>Comprobantes por Mes - {selectedYear}</CardTitle>
              </div>
              
              {/* Year Selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="year-select" className="text-sm font-semibold text-gray-700">
                  Año:
                </label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="px-3 py-2 bg-white border-2 border-cyan-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors cursor-pointer"
                  disabled={loadingMonthly}
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loadingMonthly ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-200 border-t-cyan-600"></div>
              </div>
            ) : monthlyStats.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-gray-500 font-semibold">No hay datos para el año {selectedYear}</p>
              </div>
            ) : (
              <Bar
                data={{
                  labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                  datasets: [
                    {
                      label: 'Comprobantes',
                      data: Array.from({ length: 12 }, (_, i) => {
                        const monthData = monthlyStats.find(m => m.month === i + 1)
                        return monthData ? monthData.count : 0
                      }),
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(14, 165, 233, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(249, 115, 22, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(132, 204, 22, 0.8)'
                      ],
                      borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(139, 92, 246)',
                        'rgb(236, 72, 153)',
                        'rgb(251, 146, 60)',
                        'rgb(14, 165, 233)',
                        'rgb(168, 85, 247)',
                        'rgb(34, 197, 94)',
                        'rgb(249, 115, 22)',
                        'rgb(239, 68, 68)',
                        'rgb(6, 182, 212)',
                        'rgb(132, 204, 22)'
                      ],
                      borderWidth: 2,
                      borderRadius: 8,
                      hoverBackgroundColor: [
                        'rgba(59, 130, 246, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(251, 146, 60, 1)',
                        'rgba(14, 165, 233, 1)',
                        'rgba(168, 85, 247, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(249, 115, 22, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(6, 182, 212, 1)',
                        'rgba(132, 204, 22, 1)'
                      ]
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      cornerRadius: 8,
                      titleFont: {
                        size: 14,
                        weight: 'bold'
                      },
                      bodyFont: {
                        size: 13
                      },
                      callbacks: {
                        label: function(context) {
                          return 'Comprobantes: ' + context.parsed.y
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        callback: function(value) {
                          return Number.isInteger(value) ? value : ''
                        }
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent TaxPayers */}
        <Card className="shadow-xl border-2 border-blue-100 rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <CardTitle>Contribuyentes Recientes</CardTitle>
              </div>
              <button
                onClick={() => navigate('/auth/taxpayers')}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                Ver todos →
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTaxPayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay contribuyentes registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTaxPayers.map((taxpayer, index) => (
                  <div
                    key={taxpayer.rncIdentification}
                    onClick={() => navigate(`/taxpayer/${taxpayer.rncIdentification}`)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group border-2 border-transparent hover:border-blue-200"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {taxpayer.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-blue-700">
                        {taxpayer.name}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                        {taxpayer.rncIdentification}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tax Receipts */}
        <Card className="shadow-xl border-2 border-green-100 rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <CardTitle>Comprobantes Recientes</CardTitle>
              </div>
              <button
                onClick={() => navigate('/auth/taxreceipts')}
                className="text-sm text-green-600 hover:text-green-800 font-semibold hover:underline"
              >
                Ver todos →
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {receiptsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border-2 p-4 rounded-xl space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Skeleton className="h-12 rounded-lg" />
                      <Skeleton className="h-12 rounded-lg" />
                      <Skeleton className="h-12 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentReceipts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay comprobantes registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReceipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    onClick={() => navigate(`/taxpayer/${receipt.rncIdentification}`)}
                    className="border-2 border-green-100 p-4 rounded-xl hover:border-green-300 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-white to-green-50/20"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 group-hover:text-green-700 truncate">
                          📄 NCF: {receipt.ncf}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                          </svg>
                          {receipt.rncIdentification}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-blue-100 rounded-lg p-2 text-center">
                        <p className="text-xs text-blue-700 font-semibold">Monto</p>
                        <p className="text-sm font-bold text-blue-900 truncate">
                          {formatCurrency(receipt.amount)}
                        </p>
                      </div>
                      <div className="bg-red-100 rounded-lg p-2 text-center">
                        <p className="text-xs text-red-700 font-semibold">ITBIS</p>
                        <p className="text-sm font-bold text-red-900 truncate">
                          {formatCurrency(receipt.itbis18)}
                        </p>
                      </div>
                      <div className="bg-green-100 rounded-lg p-2 text-center">
                        <p className="text-xs text-green-700 font-semibold">Total</p>
                        <p className="text-sm font-bold text-green-900 truncate">
                          {formatCurrency(receipt.amount + receipt.itbis18)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tax Payer Types */}
      {taxPayerTypes.length > 0 && (
        <Card className="shadow-xl border-2 border-purple-100 rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <CardTitle>Tipos de Contribuyentes</CardTitle>
              </div>
              <button
                onClick={() => navigate('/auth/taxpayertypes')}
                className="text-sm text-purple-600 hover:text-purple-800 font-semibold hover:underline"
              >
                Gestionar →
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {taxPayerTypes.map((type, index) => (
                <div
                  key={type.id}
                  onClick={() => navigate('/auth/taxpayertypes')}
                  className="group cursor-pointer"
                >
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-center shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{index + 1}</span>
                    </div>
                    <p className="text-sm font-bold text-white truncate group-hover:text-yellow-200 transition-colors">
                      {type.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Dashboard