import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { requestPersistentStorage } from './lib/db';

const app = mount(App, { target: document.getElementById('app')! });

requestPersistentStorage();

export default app;

// Toetsenbord op iOS: houd sheets boven het toetsenbord via de visual viewport.
const vv = window.visualViewport;
if (vv) {
  const update = () => {
    const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    document.documentElement.style.setProperty('--kb', `${kb}px`);
    document.documentElement.style.setProperty('--vvh', `${vv.height}px`);
  };
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  update();
}
