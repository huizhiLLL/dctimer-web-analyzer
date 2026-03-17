<script setup lang="ts">
import { Copyright } from 'lucide-vue-next'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="site-shell">
    <div class="site-backdrop" aria-hidden="true">
      <div class="site-backdrop-blush"></div>
      <div class="site-backdrop-glow"></div>
      <div class="site-backdrop-paper"></div>
    </div>

    <div class="site-content">
      <div class="site-frame">
        <RouterView />
      </div>
    </div>

    <footer class="site-footer">
      <p class="site-footer-inline">
        <Copyright :size="15" />
        <span>All rights reserved.</span>
        <span class="site-footer-separator">/</span>
        <span>By</span>
        <a class="site-footer-link" href="https://github.com/huizhiLLL" target="_blank" rel="noreferrer">
          huizhiLLL
        </a>
      </p>
    </footer>
  </div>
</template>
