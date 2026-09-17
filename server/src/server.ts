import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = Number(process.env.PORT) || 5000;

// Listen on 0.0.0.0 so physical phones on local Wi-Fi can connect
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 EventHub REST API Server running on http://0.0.0.0:${PORT}`);
});
