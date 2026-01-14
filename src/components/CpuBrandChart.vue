<template>
  <section class="panel">
    <div class="panel-head">
      <span class="badge" :data-brand="brand">{{ title }}</span>
      <span class="sub">发布时间 × rps（每秒打开网页数）</span>
    </div>
    <div ref="el" class="chart"></div>
  </section>
</template>

<script setup>
import * as echarts from "echarts";
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { cpus } from "../data/cpus";

const props = defineProps({
  brand: { type: String, required: true }, // 'intel' | 'amd' | 'apple'
  title: { type: String, required: true }
});

const el = ref(null);
let chart;

const COLORS = {
  intel: ["#4DA3FF", "#1B6CFF"],
  amd:   ["#FF4D6D", "#FF1F4B"],
  apple: ["#7CFFCB", "#00E6A8"],
};

const list = computed(() =>
  cpus
    .filter(x => x.brand === props.brand)
    .slice()
    .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
);

function optionOf(brand, items) {
  const grad = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: COLORS[brand][0] },
    { offset: 1, color: COLORS[brand][1] },
  ]);

  // bar 用 value: [date, rps]，在 time 轴上也能工作（ECharts 会解析日期字符串）
  const barData = items.map(d => [d.releaseDate, d.rps]);
  const dotData = items.map(d => ({
    value: [d.releaseDate, d.rps],
    name: d.name,
    brand: d.brand
  }));

  return {
    backgroundColor: "transparent",
    grid: { left: 46, right: 18, top: 26, bottom: 40 },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(10,16,28,.92)",
      borderColor: "rgba(80,160,255,.35)",
      textStyle: { color: "#EAF2FF" },
      formatter: (p) => {
        const data = p.data?.name ? p.data : { name: props.title };
        const [date, rps] = p.value;
        return `
          <div style="font-weight:700;margin-bottom:6px">${data.name ?? ""}</div>
          <div>发布时间：<b>${date}</b></div>
          <div>rps：<b>${rps}</b></div>
        `;
      },
    },
    xAxis: {
      type: "time",
      axisLine: { lineStyle: { color: "rgba(160,200,255,.35)" } },
      axisLabel: { color: "rgba(220,235,255,.8)" },
      splitLine: { lineStyle: { color: "rgba(160,200,255,.10)" } },
    },
    yAxis: {
      type: "value",
      name: "rps",
      nameTextStyle: { color: "rgba(220,235,255,.7)" },
      axisLine: { lineStyle: { color: "rgba(160,200,255,.35)" } },
      axisLabel: { color: "rgba(220,235,255,.8)" },
      splitLine: { lineStyle: { color: "rgba(160,200,255,.10)" } },
    },
    series: [
      // ① “垂直线”：极窄 bar，从值落到 0
      {
        name: "stem",
        type: "bar",
        data: barData,
        barWidth: 3,
        itemStyle: {
          color: grad,
          opacity: 0.55,
          shadowColor: COLORS[brand][0],
          shadowBlur: 12,
        },
        emphasis: { disabled: true },
        silent: true,
        z: 1,
      },

      // ② “发光点 + CPU 名称”
      {
        name: "dot",
        type: "scatter",
        data: dotData,
        symbolSize: (val) => Math.max(10, Math.min(22, val[1] / 22)),
        itemStyle: {
          color: COLORS[brand][0],
          shadowColor: COLORS[brand][0],
          shadowBlur: 18,
        },
        label: {
          show: true,
          formatter: (p) => p.data.name,
          position: "top",
          color: "rgba(235,245,255,.92)",
          fontSize: 11,
          backgroundColor: "rgba(0,0,0,.22)",
          padding: [3, 6],
          borderRadius: 8,
        },
        z: 2,
      },
    ],
  };
}

function render() {
  if (!chart) return;
  chart.setOption(optionOf(props.brand, list.value), true);
}

onMounted(() => {
  chart = echarts.init(el.value, null, { renderer: "canvas" });
  render();
  const onResize = () => chart?.resize();
  window.addEventListener("resize", onResize);

  onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize);
    chart?.dispose();
  });
});

watch(list, render);
</script>

<style scoped>
.panel{
  border: 1px solid rgba(120,180,255,.20);
  background: rgba(255,255,255,.05);
  border-radius: 18px;
  padding: 14px 14px 10px;
  backdrop-filter: blur(12px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 18px 55px rgba(0,0,0,.35);
  position: relative;
  overflow: hidden;
}
.panel::before{
  content:"";
  position:absolute; inset:-2px;
  background: linear-gradient(90deg, rgba(77,163,255,.16), rgba(255,77,109,.12), rgba(124,255,203,.12));
  filter: blur(22px);
  opacity:.55;
  pointer-events:none;
}

.panel-head{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  margin-bottom:8px;
  position: relative;
  z-index: 1;
}
.badge{
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding: 6px 10px;
  border-radius: 12px;
  border: 1px solid rgba(120,180,255,.22);
  background: rgba(0,0,0,.18);
  font-weight: 700;
  letter-spacing: .3px;
}
.badge::before{
  content:"";
  width:10px;height:10px;border-radius:999px;
  box-shadow: 0 0 14px rgba(255,255,255,.35);
  background: #4DA3FF;
}
.badge[data-brand="amd"]::before{ background:#FF4D6D; }
.badge[data-brand="apple"]::before{ background:#7CFFCB; }

.sub{ opacity:.75; font-size:12px; }

.chart{
  height: 420px;
  width: 100%;
  position: relative;
  z-index: 1;
}
</style>
