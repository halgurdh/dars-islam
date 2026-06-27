import { bootstrapTurboDrift } from './app/TurboDriftPlayCanvas';

bootstrapTurboDrift().catch((error: unknown) => {
  console.error('Failed to start Turbo Drift', error);
});
