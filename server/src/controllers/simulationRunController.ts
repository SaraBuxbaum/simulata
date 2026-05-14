import { Request, Response } from 'express';
import { readData, writeData } from '../utils/readWriteData.js';
import { v4 as uuidv4 } from 'uuid';

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
            
            // Verifying that the simulation actually exists in the database
            const simulations = await readData('simulationsConfig');
            const simulationExists = simulations.find((s: any) => s.simulation_config_id === simulation_config_id);
            
            if (!simulationExists) {
                return res.status(404).json({ message: 'Simulation configuration not found' });
            }

            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 5000);
            
            const newRun = {
                simulation_run_id: uuidv4(),
                simulation_config_id,
                status: 'In Progress', 
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                results: null 
            };
            await new Promise(resolve => setTimeout(resolve, 5000));
            newRun.status = 'Passed';
            const runs = await readData('simulationRuns');
            runs.push(newRun);
            await writeData('simulationRuns', runs);

            // TODO: שלב ההתממשקות לרכיב ההרצה האמיתי (RabbitMQ / ג'נרטור) יקרה כאן

            res.status(201).json({ message: 'Simulation started successfully', run: newRun });
        } catch (error) {
            res.status(500).json({ message: 'Error starting simulation' });
        }
    }
};