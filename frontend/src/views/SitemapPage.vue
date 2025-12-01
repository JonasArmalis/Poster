<script setup lang="ts">
import { ref } from 'vue'

let sitemapSrc: string | null = null

try {
  sitemapSrc = new URL('@/assets/sitemap.png', import.meta.url).href
} catch (e) {
  sitemapSrc = null
}

const message = ref(
  'This page shows the system sitemap'
)
</script>

<template>
  <div class="container" style="padding: 20px">
    <h1 class="title is-3">Sitemap</h1>
    <p class="subtitle is-6">{{ message }}</p>

    <div v-if="sitemapSrc">
      <img :src="sitemapSrc" alt="System sitemap" style="max-width: 100%; border-radius: 8px" />
    </div>

    <div v-else class="notification is-info">
      Image not found. Please add the file <strong>src/assets/sitemap.png</strong>.
    </div>
  </div>
</template>
