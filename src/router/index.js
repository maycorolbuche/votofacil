import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import About from "@/views/About.vue";
import Room from "@/views/admin/Room.vue";
import Voter from "@/views/user/Voter.vue";
import View from "@/views/view/View.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },

  //Admin routes
  {
    path: "/room",
    name: "Room",
    component: Room,
  },

  //Voter routes
  {
    path: "/voter",
    name: "Voter",
    component: Voter,
  },

  //View routes
  {
    path: "/view/:hash",
    name: "View",
    component: View,
  },
];
const router = createRouter({
  history: createWebHistory(
    import.meta.env.BASE_URL ?? import.meta.env.VITE_BASE_URL ?? "/"
  ),
  routes,
});
export default router;
