import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from '../views/Home.vue'
// import Login from '../components/Login.vue'
const Login = () =>import(/* webpackChunkName:"login_home_welcome" */ '../components/Login.vue');
// import Home from '../components/home.vue'
const Home = () =>import(/* webpackChunkName:"login_home_welcome" */ '../components/home.vue');
// import Welcome from '../components/welcome.vue'
const Welcome  = () =>import(/* webpackChunkName:"login_home_welcome" */ '../components/welcome.vue');
// import Users from '../components/user/users.vue'
const Users  = () =>import(/* webpackChunkName:"Users_Rights" */ '../components/user/users.vue');
// import Rights from '../components/power/rights.vue'
const Rights  = () =>import(/* webpackChunkName:"Users_Rights" */ '../components/power/rights.vue');
// import Roles from '../components/power/roles.vue'
const Roles  = () =>import(/* webpackChunkName:"Roles_Cates_Params" */ '../components/power/roles.vue');
// import Cates from '../components/goods/cates.vue'
const Cates  = () =>import(/* webpackChunkName:"Roles_Cates_Params" */ '../components/goods/cates.vue');
// import Params from '../components/goods/params.vue'
const Params  = () =>import(/* webpackChunkName:"Roles_Cates_Params" */ '../components/goods/params.vue');
// import Goods from '../components/goods/goods.vue'
const Goods  = () =>import(/* webpackChunkName:"Goods_Order" */ '../components/goods/goods.vue');
// import Order from '../components/order/order.vue'
const Order   = () =>import(/* webpackChunkName:"Goods_Order" */ '../components/order/order.vue');
// import Add from '../components/goods/add.vue'
const Add   = () =>import(/* webpackChunkName:"Add_Report" */ '../components/goods/add.vue');
// import Report from '../components/repote/report.vue'
const Report  = () =>import(/* webpackChunkName:"Add_Report" */ '../components/repote/report.vue');

Vue.use(VueRouter)


const routes = [
  {
    path: '/',
   redirect:'/Login'
  },
  {
    path: '/Login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect:'/welcome',
    children:[
      {path:'/welcome',component:Welcome},
      {path:'/users',component:Users},
      {path:'/rights',component:Rights},
      {path:'/roles',component:Roles},
      {path:'/categories',component:Cates},
      {path:'/params',component:Params},
      {path:'/goods',component:Goods},
      {path:'/orders',component:Order},
      {path:'/goods/add',component:Add},
      {path:'/reports',component:Report}
    ]
  }
]

const router = new VueRouter({
  routes
})
// 增加路由导航守卫，这里有三个参数  一个to 表示从哪个页面来的，一个是form表示要去哪个页面，一个next 表示放行到下一个页面
router.beforeEach((to,from,next)=>{
  // 判断一下是否从登录页面过来的
  if(to.path =='/Login') return next()
  // 验证token是否正确
 const tokenStr =  window.sessionStorage.getItem('token')
//  如果token不正确就跳转登录页面，要求强制登录
 if(!tokenStr) return next('/Login')
//  其实这一步还需要去验证TOKEN 的规则
 next()
})

export default router
