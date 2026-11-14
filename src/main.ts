import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { requestPersistentStorage } from './lib/db';

const app = mount(App, { target: document.getElementById('app')! });

requestPersistentStorage();

export default app;
