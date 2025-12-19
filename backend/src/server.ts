import cors from 'cors';
import express from 'express';
import 'dotenv/config';
import './db/database';
import equipmentRoutes from './routes/equipment.routes';

const app = express();
const PORT = process.env.PORT

app.use(express.json());

app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN,
    })
);

app.use('/api/equipment', equipmentRoutes);

const server = app.listen(PORT, () => {
    console.log(`Backend server listening on http://localhost:${PORT}`);
});

server.on('error', (error) => {
    console.error('Failed to start server.', error);
    process.exitCode = 1;
});
