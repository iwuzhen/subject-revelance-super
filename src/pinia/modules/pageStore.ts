import { defineStore } from "pinia";
import { ref } from "vue";

export const pageStore = defineStore("pageStore", {
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
