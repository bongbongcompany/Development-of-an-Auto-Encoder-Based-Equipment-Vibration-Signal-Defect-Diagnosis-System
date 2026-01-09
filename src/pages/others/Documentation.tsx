import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme, // 테마 상태를 직접 감지하기 위해 추가
} from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import { SettingsContext } from 'pages/users/UserList';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const SummaryCard = ({ title, value, color, isDark }: any) => (
  <Paper
    sx={{
      p: 2,
      borderRadius: 2,
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : 3,
      bgcolor: isDark ? '#1e1e1e' : '#ffffff',
      color: isDark ? '#ffffff' : 'inherit',
      transition: 'all 0.3s ease',
    }}
  >
    <Typography variant="subtitle2" sx={{ color: isDark ? grey[400] : 'text.secondary' }}>
      {title}
    </Typography>
    <Typography
      variant="h5"
      fontWeight="bold"
      sx={{ color: color ?? (isDark ? '#ffffff' : '#2d3748') }}
    >
      {value}
    </Typography>
  </Paper>
);

const Documentation = () => {
  const theme = useTheme(); // MUI 테마 엔진에서 직접 모드 가져오기
  const context = useContext(SettingsContext);

  // Context가 우선이지만, 시스템 테마와도 동기화되도록 판정
  const isDark = context?.themeMode === 'dark' || theme.palette.mode === 'dark';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/monitoring/latest-analysis');
      const json = await res.json();
      if (json?.rpm) setData(json);
    } catch (e) {
      console.error('Data fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 5000);
    return () => clearInterval(timer);
  }, []);

  const tcrSeries = useMemo(() => {
    if (!data?.chartData) return [];
    return data.chartData.map((d: any, idx: number) => ({ index: idx, tcr: d.current }));
  }, [data]);

  if (loading) return <Box sx={{ p: 4, color: isDark ? '#fff' : '#000' }}>Loading...</Box>;
  if (!data) return <Box sx={{ p: 4, color: isDark ? '#fff' : '#000' }}>No Data Available</Box>;

  const { metrics, chartData } = data;

  return (
    <Box
      sx={{
        p: 4,
        // 중요: 배경색을 강제로 지정하여 Context 불일치 해결
        bgcolor: isDark ? '#121212' : '#f5f5f5',
        color: isDark ? '#ffffff' : '#000000',
        minHeight: '100vh',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{ color: isDark ? blue[300] : blue[700] }}
      >
        MLOps 실시간 성능 모니터링 (RPM: {data.rpm})
      </Typography>

      <Typography variant="body2" sx={{ mb: 4, color: isDark ? grey[400] : 'text.secondary' }}>
        마지막 업데이트: {new Date(data.timestamp).toLocaleString()} | 현재 모드:{' '}
        {isDark ? 'DARK' : 'LIGHT'}
      </Typography>

      {/* Grid 에러 해결: 'item' 대신 개별 props 사용 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: 'Model Status',
            value: metrics.variance > 1.5 && metrics.tcr > 0.2 ? 'DEGRADED' : 'STABLE',
            color: metrics.variance > 1.5 ? '#f44336' : '#4caf50',
          },
          {
            title: 'Error Variance',
            value: metrics.variance.toFixed(4),
            color: metrics.variance > 1.5 ? '#f44336' : undefined,
          },
          {
            title: 'Threshold Crossing Rate',
            value: `${(metrics.tcr * 100).toFixed(1)} %`,
            color: metrics.tcr > 0.2 ? '#ff9800' : undefined,
          },
          {
            title: 'KS-test P-Value',
            value: metrics.p_value.toFixed(4),
            color: metrics.p_value < 0.05 ? '#f44336' : undefined,
          },
        ].map((card, idx) => (
          // Documentation.tsx : 136번 라인 수정
          <Grid key={`card-${idx}`} size={{ xs: 12, md: 3 }} sx={{ display: 'block' }}>
            <Box sx={{ p: 1.5 }}>
              <SummaryCard {...card} isDark={isDark} />
            </Box>
          </Grid>
        ))}
      </Grid>

      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          bgcolor: isDark ? '#000000' : '#ffffff',
          border: isDark ? `1px solid ${grey[900]}` : 'none',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: isDark ? '#ffffff' : 'inherit' }}>
          Threshold Crossing Rate Trend
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={tcrSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#eee'} />
            <XAxis dataKey="index" stroke={isDark ? grey[500] : grey[700]} />
            <YAxis stroke={isDark ? grey[500] : grey[700]} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#222' : '#fff',
                borderColor: isDark ? '#444' : '#ccc',
                color: isDark ? '#fff' : '#000',
              }}
            />
            <ReferenceLine
              y={0.2}
              stroke="#f44336"
              strokeDasharray="5 5"
              label={{ value: 'Limit', fill: '#f44336', fontSize: 12 }}
            />
            <Line type="monotone" dataKey="tcr" stroke={blue[500]} strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? '#000000' : '#ffffff',
          border: isDark ? `1px solid ${grey[900]}` : 'none',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: isDark ? '#ffffff' : 'inherit' }}>
          Error Distribution Shape
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#eee'} />
            <XAxis dataKey="range" stroke={isDark ? grey[500] : grey[700]} />
            <YAxis stroke={isDark ? grey[500] : grey[700]} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#222' : '#fff',
                borderColor: isDark ? '#444' : '#ccc',
              }}
              itemStyle={{ color: isDark ? '#fff' : '#000' }}
            />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Bar dataKey="baseline" fill={isDark ? '#5c5aaa' : '#8884d8'} name="Baseline" />
            <Bar dataKey="current" fill={isDark ? '#388e3c' : '#82ca9d'} name="Current" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default Documentation;
