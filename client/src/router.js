import Vue from 'vue';
import Router from 'vue-router';
import Search from './views/Search.vue';
import State from './views/State.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'state',
      component: State,
    },
    {
      path: '/search',
      name: 'search',
      component: Search,
    },
  ],
});
