/**
 * ECharts Initialization for Section 19 & 20
 * Charts: Area, Stacked Bar, Gauge, Donut, Sparklines, Benchmark Bar, KPI Ring, KPI Trend
 */
(function() {
  // Theme colors matching the design system
  const COLORS = {
    primary: '#a78bfa',   // violet
    secondary: '#38bdf8', // sky
    success: '#34d399',   // mint
    warning: '#fbbf24',   // amber
    danger: '#ff6b6b',    // coral
    rose: '#fb7185',
    text: '#e4e4eb',
    muted: '#71717a',
    border: '#2d2d3a',
    surface: '#1a1a24',
    card: '#22222e',
    bg: '#121218'
  };

  // Common tooltip config for glassmorphism style
  const tooltipConfig = {
    backgroundColor: 'rgba(26, 26, 36, 0.95)',
    borderColor: COLORS.border,
    borderWidth: 1,
    textStyle: { color: COLORS.text, fontSize: 12 },
    padding: [12, 16],
    extraCssText: 'backdrop-filter: blur(8px); border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);'
  };

  // Common axis styling
  const axisCommon = {
    axisLine: { lineStyle: { color: COLORS.border } },
    axisTick: { lineStyle: { color: COLORS.border } },
    axisLabel: { color: COLORS.muted, fontSize: 11 },
    splitLine: { lineStyle: { color: COLORS.border, type: 'dashed' } }
  };

  // Generate sample data
  function generateDates(days) {
    const dates = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return dates;
  }

  function generateRandomData(length, min, max) {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
  }

  // ===== Area Chart =====
  const areaChartEl = document.getElementById('areaChart');
  if (areaChartEl) {
    const areaChart = echarts.init(areaChartEl);
    const dates = generateDates(30);
    const data = generateRandomData(30, 2000, 8000);

    areaChart.setOption({
      tooltip: {
        ...tooltipConfig,
        trigger: 'axis',
        axisPointer: { type: 'cross', lineStyle: { color: COLORS.primary + '40' } }
      },
      grid: { top: 10, right: 10, bottom: 30, left: 45 },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        ...axisCommon
      },
      yAxis: {
        type: 'value',
        ...axisCommon,
        axisLabel: {
          ...axisCommon.axisLabel,
          formatter: v => v >= 1000 ? (v/1000).toFixed(0) + 'K' : v
        }
      },
      series: [{
        type: 'line',
        data: data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: { color: COLORS.primary, width: 2 },
        itemStyle: { color: COLORS.primary },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: COLORS.primary + '40' },
              { offset: 1, color: COLORS.primary + '05' }
            ]
          }
        }
      }]
    });

    window.addEventListener('resize', () => areaChart.resize());
  }

  // ===== Stacked Bar Chart =====
  const stackedBarEl = document.getElementById('stackedBarChart');
  if (stackedBarEl) {
    const stackedBar = echarts.init(stackedBarEl);
    const dates = generateDates(14);

    stackedBar.setOption({
      tooltip: {
        ...tooltipConfig,
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: { show: false },
      grid: { top: 10, right: 10, bottom: 30, left: 35 },
      xAxis: {
        type: 'category',
        data: dates,
        ...axisCommon
      },
      yAxis: {
        type: 'value',
        ...axisCommon
      },
      series: [
        {
          name: 'Hooks',
          type: 'bar',
          stack: 'content',
          data: generateRandomData(14, 2, 8),
          itemStyle: { color: COLORS.success, borderRadius: [0, 0, 0, 0] }
        },
        {
          name: 'Scripts',
          type: 'bar',
          stack: 'content',
          data: generateRandomData(14, 1, 5),
          itemStyle: { color: COLORS.secondary }
        },
        {
          name: 'Tweets',
          type: 'bar',
          stack: 'content',
          data: generateRandomData(14, 3, 10),
          itemStyle: { color: COLORS.primary, borderRadius: [4, 4, 0, 0] }
        }
      ]
    });

    window.addEventListener('resize', () => stackedBar.resize());
  }

  // ===== Gauge Chart =====
  const gaugeChartEl = document.getElementById('gaugeChart');
  if (gaugeChartEl) {
    const gaugeChart = echarts.init(gaugeChartEl);

    gaugeChart.setOption({
      series: [{
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        center: ['50%', '60%'],
        radius: '90%',
        itemStyle: { color: COLORS.warning },
        progress: {
          show: true,
          width: 12,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: COLORS.success },
                { offset: 0.5, color: COLORS.warning },
                { offset: 1, color: COLORS.danger }
              ]
            }
          }
        },
        axisLine: {
          lineStyle: { width: 12, color: [[1, COLORS.border]] }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 32,
          fontWeight: 600,
          color: COLORS.text,
          offsetCenter: [0, 0],
          formatter: '{value}'
        },
        data: [{ value: 73 }]
      }]
    });

    window.addEventListener('resize', () => gaugeChart.resize());
  }

  // ===== Donut Chart =====
  const donutChartEl = document.getElementById('donutChart');
  if (donutChartEl) {
    const donutChart = echarts.init(donutChartEl);

    donutChart.setOption({
      tooltip: {
        ...tooltipConfig,
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { color: COLORS.muted, fontSize: 11 },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 8
      },
      series: [{
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderColor: COLORS.card,
          borderWidth: 2
        },
        data: [
          { value: 45, name: 'Search', itemStyle: { color: COLORS.primary } },
          { value: 28, name: 'Suggested', itemStyle: { color: COLORS.secondary } },
          { value: 15, name: 'External', itemStyle: { color: COLORS.success } },
          { value: 8, name: 'Browse', itemStyle: { color: COLORS.warning } },
          { value: 4, name: 'Other', itemStyle: { color: COLORS.muted } }
        ]
      }]
    });

    window.addEventListener('resize', () => donutChart.resize());
  }

  // ===== Sparklines =====
  function createSparkline(elId, data, color) {
    const el = document.getElementById(elId);
    if (!el) return;

    const chart = echarts.init(el);
    chart.setOption({
      grid: { top: 2, right: 2, bottom: 2, left: 2 },
      xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
      yAxis: { type: 'value', show: false, min: 'dataMin', max: 'dataMax' },
      series: [{
        type: 'line',
        data: data,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: color, width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: color + '60' },
              { offset: 1, color: color + '10' }
            ]
          }
        }
      }]
    });

    window.addEventListener('resize', () => chart.resize());
  }

  createSparkline('sparkline1', [12, 14, 13, 15, 14, 16, 18], COLORS.success);
  createSparkline('sparkline2', [720, 680, 750, 800, 780, 820, 847], COLORS.success);
  createSparkline('sparkline3', [5.2, 5.0, 4.9, 5.1, 4.8, 4.7, 4.8], COLORS.danger);
  createSparkline('sparkline4', [4.1, 4.0, 4.2, 4.3, 4.4, 4.5, 4.53], COLORS.success);

  // ===== Benchmark Bar Chart =====
  const benchmarkEl = document.getElementById('benchmarkChart');
  if (benchmarkEl) {
    const benchmarkChart = echarts.init(benchmarkEl);
    const niches = ['Tech Reviews', 'Gaming', 'Beauty', 'Finance', 'Cooking', 'Fitness', 'Travel', 'Music'];
    const values = [4200, 3800, 3200, 2900, 2600, 2400, 2100, 1800];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    benchmarkChart.setOption({
      tooltip: {
        ...tooltipConfig,
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: { top: 20, right: 20, bottom: 60, left: 50 },
      xAxis: {
        type: 'category',
        data: niches,
        ...axisCommon,
        axisLabel: {
          ...axisCommon.axisLabel,
          rotate: 35,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        ...axisCommon,
        axisLabel: {
          ...axisCommon.axisLabel,
          formatter: v => v >= 1000 ? (v/1000).toFixed(1) + 'K' : v
        }
      },
      series: [{
        type: 'bar',
        data: values.map((v, i) => ({
          value: v,
          itemStyle: {
            color: v > avg * 1.2 ? COLORS.success :
                   v > avg ? COLORS.primary :
                   v > avg * 0.8 ? COLORS.warning : COLORS.danger,
            borderRadius: [4, 4, 0, 0]
          }
        })),
        barWidth: '60%',
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: COLORS.warning, type: 'dashed', width: 2 },
          data: [{ yAxis: avg, label: {
            show: true,
            position: 'end',
            formatter: 'Avg: {c}',
            color: COLORS.warning,
            fontSize: 11
          }}]
        }
      }]
    });

    window.addEventListener('resize', () => benchmarkChart.resize());
  }

  // ===== KPI Ring Chart =====
  const kpiRingEl = document.getElementById('kpiRing');
  if (kpiRingEl) {
    const kpiRing = echarts.init(kpiRingEl);

    kpiRing.setOption({
      series: [{
        type: 'pie',
        radius: ['70%', '90%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderWidth: 0 },
        data: [
          { value: 78, itemStyle: { color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 1,
            colorStops: [
              { offset: 0, color: COLORS.success },
              { offset: 1, color: COLORS.secondary }
            ]
          }}},
          { value: 22, itemStyle: { color: COLORS.border } }
        ]
      }]
    });

    window.addEventListener('resize', () => kpiRing.resize());
  }

  // ===== KPI Trend Line =====
  const kpiTrendEl = document.getElementById('kpiTrend');
  if (kpiTrendEl) {
    const kpiTrend = echarts.init(kpiTrendEl);
    const data = [2100, 2300, 2200, 2600, 2400, 2800, 2847];

    kpiTrend.setOption({
      grid: { top: 5, right: 5, bottom: 5, left: 5 },
      xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
      yAxis: { type: 'value', show: false, min: 'dataMin', max: 'dataMax' },
      series: [{
        type: 'line',
        data: data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: { color: COLORS.primary, width: 2 },
        itemStyle: { color: COLORS.primary },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: COLORS.primary + '40' },
              { offset: 1, color: COLORS.primary + '05' }
            ]
          }
        }
      }]
    });

    window.addEventListener('resize', () => kpiTrend.resize());
  }

})();
