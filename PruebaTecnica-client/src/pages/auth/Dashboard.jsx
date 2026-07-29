import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '@/lib/axiosClient'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTaxReceipts } from '@/hooks/useTaxReceipts'
import {
  Users,
  FileText,
  Wallet,
  Calculator,
  Tag,
  BarChart3,
  PieChart,
  CalendarDays,
  ChevronRight,
  Hash
} from 'lucide-react'
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

  const StatCard = ({ title, value, icon, chipClass, onClick }) => (
    <Card
      className="cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <p className="text-2xl font-semibold text-slate-900 wrap-break-words">{value}</p>
            )}
          </div>
          <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${chipClass}`}>
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen flex-1 p-6 space-y-6">


      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Contribuyentes"
          value={stats.totalTaxPayers}
          chipClass="bg-blue-50 text-blue-600"
          onClick={() => navigate('/auth/taxpayers')}
          icon={<Users className="h-5 w-5" />}
        />

        <StatCard
          title="Comprobantes"
          value={stats.totalReceipts}
          chipClass="bg-emerald-50 text-emerald-600"
          onClick={() => navigate('/auth/taxreceipts')}
          icon={<FileText className="h-5 w-5" />}
        />

        <StatCard
          title="Ingresos Total"
          value={formatCurrency(stats.totalRevenue)}
          chipClass="bg-violet-50 text-violet-600"
          onClick={() => navigate('/auth/taxreceipts')}
          icon={<Wallet className="h-5 w-5" />}
        />

        <StatCard
          title="ITBIS Total"
          value={formatCurrency(stats.totalITBIS)}
          chipClass="bg-amber-50 text-amber-600"
          onClick={() => navigate('/auth/taxreceipts')}
          icon={<Calculator className="h-5 w-5" />}
        />

        <StatCard
          title="Tipos"
          value={stats.totalTaxPayerTypes}
          chipClass="bg-sky-50 text-sky-600"
          onClick={() => navigate('/auth/taxpayertypes')}
          icon={<Tag className="h-5 w-5" />}
        />
      </div>

      {/* Charts Section */}
      {!loading && allReceipts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs ITBIS Chart */}
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BarChart3 className="h-5 w-5" />
                </span>
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
                        'rgba(42,120,214,0.85)',
                        'rgba(237,161,0,0.85)',
                        'rgba(0,131,0,0.85)'
                      ],
                      borderColor: [
                        '#2a78d6',
                        '#eda100',
                        '#008300'
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
                      backgroundColor: '#0f172a',
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
                        color: '#64748b',
                        callback: function(value) {
                          return '$' + (value / 1000).toFixed(0) + 'K'
                        }
                      },
                      grid: {
                        color: '#e2e8f0'
                      }
                    },
                    x: {
                      ticks: {
                        color: '#64748b'
                      },
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
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <PieChart className="h-5 w-5" />
                </span>
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
                          '#2a78d6',
                          '#eda100'
                        ],
                        borderColor: '#ffffff',
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
                          color: '#475569',
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
                        backgroundColor: '#0f172a',
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
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <CardTitle>Comprobantes por Mes - {selectedYear}</CardTitle>
              </div>

              {/* Year Selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="year-select" className="text-sm font-medium text-slate-700">
                  Año:
                </label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
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
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600"></div>
              </div>
            ) : monthlyStats.length === 0 ? (
              <div className="text-center py-12">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto mb-4">
                  <FileText className="h-7 w-7" />
                </span>
                <p className="text-base font-semibold text-slate-900">No hay datos para el año {selectedYear}</p>
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
                      backgroundColor: 'rgba(42,120,214,0.85)',
                      borderColor: '#2a78d6',
                      borderWidth: 2,
                      borderRadius: 8,
                      hoverBackgroundColor: '#1c5cab'
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
                      backgroundColor: '#0f172a',
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
                        color: '#64748b',
                        stepSize: 1,
                        callback: function(value) {
                          return Number.isInteger(value) ? value : ''
                        }
                      },
                      grid: {
                        color: '#e2e8f0'
                      }
                    },
                    x: {
                      ticks: {
                        color: '#64748b'
                      },
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
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Users className="h-5 w-5" />
                </span>
                <CardTitle>Contribuyentes Recientes</CardTitle>
              </div>
              <button
                onClick={() => navigate('/auth/taxpayers')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Ver todos
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
              <div className="text-center py-8 text-slate-500">
                <p>No hay contribuyentes registrados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTaxPayers.map((taxpayer, index) => (
                  <div
                    key={taxpayer.rncIdentification}
                    onClick={() => navigate(`/taxpayer/${taxpayer.rncIdentification}`)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                        {taxpayer.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate group-hover:text-blue-700">
                        {taxpayer.name}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5" />
                        {taxpayer.rncIdentification}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tax Receipts */}
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FileText className="h-5 w-5" />
                </span>
                <CardTitle>Comprobantes Recientes</CardTitle>
              </div>
              <button
                onClick={() => navigate('/auth/taxreceipts')}
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Ver todos
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {receiptsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-slate-200 p-4 rounded-xl space-y-2">
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
              <div className="text-center py-8 text-slate-500">
                <p>No hay comprobantes registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReceipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    onClick={() => navigate(`/taxpayer/${receipt.rncIdentification}`)}
                    className="border border-slate-200 p-4 rounded-xl hover:bg-slate-50 hover:shadow-md transition-all cursor-pointer group bg-white"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 group-hover:text-emerald-700 truncate">
                          NCF: {receipt.ncf}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Hash className="h-3 w-3" />
                          {receipt.rncIdentification}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
                        <p className="text-xs font-medium text-slate-500">Monto</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {formatCurrency(receipt.amount)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-center">
                        <p className="text-xs font-medium text-amber-700">ITBIS</p>
                        <p className="text-sm font-semibold text-amber-800 truncate">
                          {formatCurrency(receipt.itbis18)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-center">
                        <p className="text-xs font-medium text-emerald-700">Total</p>
                        <p className="text-sm font-semibold text-emerald-800 truncate">
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
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Tag className="h-5 w-5" />
                </span>
                <CardTitle>Tipos de Contribuyentes</CardTitle>
              </div>
              <button
                onClick={() => navigate('/auth/taxpayertypes')}
                className="text-sm font-semibold text-violet-600 hover:text-violet-700 hover:underline"
              >
                Gestionar
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
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-colors hover:bg-slate-50 hover:shadow-md">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto mb-3 flex items-center justify-center">
                      <span className="text-lg font-semibold">{index + 1}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
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
