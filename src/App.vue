<template>
  <div class="bg">
    <header class="topbar">
      <div class="logo-dot"></div>
      <div>
        <h1>CPU 数据展示</h1>
        <p>按品牌拆分：Intel / AMD / Apple（点 + 垂直落地线）</p>
      </div>
    </header>

    <main class="grid">
      <CpuBrandChart brand="intel" title="INTEL" />
      <CpuBrandChart brand="amd" title="AMD" />
      <CpuBrandChart brand="apple" title="APPLE" />
    </main>
  </div>
</template>

<script setup>
import CpuBrandChart from "./components/CpuBrandChart.vue";
</script>
