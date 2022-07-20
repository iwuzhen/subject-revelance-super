import { defineStore } from "pinia";
import { ref } from "vue";

export const powerlawDemoStore = defineStore("powerlawDemo", {
  state() {
    return {
      subjectSelect: ["Biology", "Chemistry", "Physics"],
      zipfTypeSelect: "zipf",
      monthSelect: 3,
      levelSelect: 2,
      nodeRange: ref([1, 10000]),
      yTo: 0.1,
      autoPlay: false,
    };
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "page",
        storage: localStorage,
      },
    ],
  },
});

export const homeStore = defineStore("home", {
  state() {
    return {
      title: "",
    };
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "home",
        storage: localStorage,
      },
    ],
  },
});
