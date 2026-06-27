import { TurboDriftApp } from './app/TurboDriftApp';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Turbo Drift root element #app is missing');
}

const app = new TurboDriftApp(root);
app.init();
