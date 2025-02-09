<script setup lang="ts">
import { useCounterStore } from './stores/counter'
import { useNonSharedCounterStore } from './stores/nonSharedCounter'

const sharedCounter = useCounterStore()
const nonSharedCounter = useNonSharedCounterStore()
</script>

<template>
  <main class="container">
    <div class="app">
      <section class="counter counter--shared">
        <h2 class="counter__title">Shared Counter</h2>
        <p class="counter__count">Count: {{ sharedCounter.count }}</p>
        <p class="counter__double">Double Count: {{ sharedCounter.doubleCount }}</p>
        <button class="counter__button" @click="sharedCounter.increment()">Increment</button>
      </section>
      <section class="counter counter--non-shared">
        <h2 class="counter__title">Non-Shared Counter</h2>
        <p class="counter__count">Count: {{ nonSharedCounter.count }}</p>
        <p class="counter__double">Double Count: {{ nonSharedCounter.doubleCount }}</p>
        <button class="counter__button" @click="nonSharedCounter.increment()">Increment</button>
      </section>
    </div>
  </main>
</template>

<style>
/* Global CSS variables */
:root {
  --color-fill: 33, 39, 55;
  --color-text-base: 234, 237, 243;
  --color-accent: 255, 107, 237;
  --color-card: 52, 63, 96;
  --color-card-muted: 138, 51, 123;
  --color-border: 171, 75, 153;
}
</style>

<style>
.container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(var(--color-fill));
  padding: 4rem 2rem;
}

.app {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 800px;
  background-color: rgb(var(--color-fill));
  color: rgb(var(--color-text-base));
}

.counter {
  width: 100%;
  max-width: 350px;
  border: 2px solid rgb(var(--color-border));
  padding: 1.5rem;
  border-radius: 0.75rem;
  text-align: center;
  background-color: rgb(var(--color-card));
  box-shadow: 0 4px 6px rgba(var(--color-card-muted), 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.counter:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(var(--color-card-muted), 0.5);
}

.counter__title {
  margin: 0 0 1rem;
  font-size: 1.75rem;
  font-weight: bold;
  color: rgb(var(--color-accent));
  text-shadow: 0 0 10px rgba(var(--color-accent), 0.3);
}

.counter__count,
.counter__double {
  margin: 0.75rem 0;
  font-size: 1.4rem;
  color: rgb(var(--color-text-base));
  text-shadow: 0 0 5px rgba(var(--color-text-base), 0.2);
}

.counter__button {
  padding: 0.75rem 1.5rem;
  border: none;
  background-color: rgb(var(--color-accent));
  color: rgb(var(--color-fill));
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  font-weight: bold;
  font-size: 1rem;
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(var(--color-accent), 0.3);
}

.counter__button:hover {
  background-color: rgb(var(--color-card-muted));
  color: rgb(var(--color-text-base));
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(var(--color-border), 0.4);
}

.counter__button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(var(--color-border), 0.2);
}
</style>
