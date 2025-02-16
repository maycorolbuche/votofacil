import { createRouter, createWebHistory } from "vue-router";
import Controller from "@/views/Controller.vue";
import Voter from "@/views/Voter.vue";
import Viewer from "@/views/Viewer.vue";

const routes = [
  {
    path: "/",
    name: "Controller",
    component: Controller,
  },
  {
    path: "/voter",
    name: "Voter",
    component: Voter,
  },
  {
    path: "/viewer",
    name: "Viewer",
    component: Viewer,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
