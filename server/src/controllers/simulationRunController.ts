import { Request, Response } from 'express';
import { publishSimulationRun } from '../rabbitmq/index.js';  
import { readData, writeData } from '../utils/readWriteData.js';
import { v4 as uuidv4 } from 'uuid';

async function populateSimulationData(simulationConfig: any) {
    // 1. שליפת שמות המערכות מתוך קובץ המערכות
    const systems = await readData('systems'); 
    const system1 = systems.find((sys: any) => sys.system_id === simulationConfig.system1_id);
    const system2 = systems.find((sys: any) => sys.system_id === simulationConfig.system2_id);
    
    const system1_name = system1 ? system1.name : 'Unknown System 1';
    const system2_name = system2 ? system2.name : 'Unknown System 2';

    // 2. שליפת קצב וכמות ההודעות מתוך ה-Data Writer הראשון המוגדר בתצורה
    const dataWriters = await readData('dataWriter');
    const firstDwId = simulationConfig.configuration_details?.dw_ids?.[0];
    const selectedDw = dataWriters.find((dw: any) => dw.data_writer_id === firstDwId);

    const message_count = selectedDw ? Number(selectedDw.message_count) : 0;
    const message_frequency_hz = selectedDw ? Number(selectedDw.message_frequency_hz) : 0;

    return {
        system1_name,
        system2_name,
        message_count,
        message_frequency_hz
    };
}

export const SimulationRunController = {
    getAll: async (req: Request, res: Response) => {
        try {
            const runs = await readData('simulationRuns');
            res.json(runs);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching simulation runs' });
        }
    },

    //כרגע לא יהיה בזה כל כך שימוש- כי השם של הסימולציה הוא יוניקי ומהווה מזהה מעולה
    getBySimulationId: async (req: Request, res: Response) => {
        try {
            const { simulation_config_id } = req.params;
            const runs = await readData('simulationRuns');
            const scenarioRuns = runs.filter((r: any) => r.simulation_config_id === simulation_config_id);
            
            res.json(scenarioRuns);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching runs for this simulation' });
        }
    },

    getBySimulationName: async (req: Request, res: Response) => {
        try {
            const { scenario_name } = req.params;
            const runs = await readData('simulationRuns');
            const scenarioRuns = runs.filter((r: any) => r.scenario_name === scenario_name);
            
            res.json(scenarioRuns);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching runs for this simulation name' });
        }
    },

    getBySimulationByStatus: async (req: Request, res: Response) => {
        try {
            const { status } = req.params;
            const runs = await readData('simulationRuns');
            const scenarioRuns = runs.filter((r: any) => r.status === status);
            
            res.json(scenarioRuns);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching runs for this simulation status' });
        }
    },

    runSimulation: async (req: Request, res: Response) => {
        try {
            const { simulation_config_id } = req.body;
            
            // א. שליפת ובדיקת קיום התצורה הבסיסית
            const simulations = await readData('simulationsConfig');
            const simulationExists = simulations.find((s: any) => s.simulation_config_id === simulation_config_id);
            
            if (!simulationExists) {
                return res.status(404).json({ message: 'Simulation configuration not found' });
            }

            // ב. שימוש בפונקציית העזר המבודדת לקבלת הנתונים המועשרים
            const enrichedData = await populateSimulationData(simulationExists);

            // ג. הכנת אובייקט הריצה החדש בסטטוס ראשוני
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 5000); // ברירת מחדל של 5 שניות התמהמהות
            
            const newRun = {
                simulation_run_id: uuidv4(),
                simulation_config_id,
                status: 'Running', 
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                results: null 
            };

            console.log(`[SimulationRunController] Dispatching message to RabbitMQ for run_id: ${newRun.simulation_run_id}`);
            
            // ד. שידור ההודעה בצורה מאובטחת ומסונכרנת לרביט (ממתין ל-ACK מהברוקר)
            await publishSimulationRun(
                simulationExists, 
                newRun.simulation_run_id,
                enrichedData.system1_name,
                enrichedData.system2_name,
                enrichedData.message_count,
                enrichedData.message_frequency_hz
            );
            
            // ה. עדכון סטטוס הריצה ל-Completed ושמירה להיסטוריה רק לאחר הצלחת השידור
            newRun.status = 'Completed';
            const runs = await readData('simulationRuns');
            runs.push(newRun);
            await writeData('simulationRuns', runs);

            res.status(201).json({ 
                message: 'Simulation run triggered, verified by RabbitMQ, and logged successfully', 
                run: newRun 
            });

        } catch (error) {
            console.error("💥 Critical error during simulation dispatch:", error);
            res.status(500).json({ message: 'Simulation failed to start due to internal pipeline infrastructure issue' });
        }
    }
};