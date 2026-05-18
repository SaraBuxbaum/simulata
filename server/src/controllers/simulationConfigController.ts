import { Request, Response } from 'express';
import { readData, writeData } from '../utils/readWriteData.js';
import { v4 as uuidv4 } from 'uuid';

export const SimulationConfigController = {
    getAll: async (req: Request, res: Response) => {
        try {
            const simulations = await readData('simulationsConfig');
            res.json(simulations);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching simulations' });
        }
    },

    getSimulationsNames: async (req: Request, res: Response) => {
        try {
            const simulations = await readData('simulationsConfig');
            res.json(simulations.map((s: any) => s.scenario_name));
        } catch (error) {
            res.status(500).json({ message: 'Error fetching simulations names' });
        }
    },

    getByName: async (req: Request, res: Response) => {
        try {
            const { scenario_name } = req.params;
            const simulations = await readData('simulationsConfig');
            const simulation = simulations.find((s: any) => s.scenario_name === scenario_name);
            
            simulation ? res.json(simulation) : res.status(404).json({ message: 'Simulation not found' });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching simulation' });
        }
    },

    create: async (req: Request, res: Response) => {
        try {
            // חילוץ רק של השם ופרטי הקונפיגורציה מהגוף
            const { scenario_name, configuration_details } = req.body;
            const simulations = await readData('simulationsConfig');
            
            if (simulations.some((s: any) => s.scenario_name === scenario_name)) {
                return res.status(400).json({ message: 'Scenario name already exists. Please choose a unique name.' });
            }

            const newSimulation = {
                simulation_config_id: uuidv4(),
                scenario_name,
                configuration_details, // נכנס כמו שהוא עם כל המערכות והישויות
                created_at: new Date().toISOString()
            };

            simulations.push(newSimulation);
            await writeData('simulationsConfig', simulations);
            
            res.status(201).json(newSimulation);
        } catch (error) {
            res.status(500).json({ message: 'Error saving simulation configuration' });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const { simulation_config_id } = req.params;
            const simulations = await readData('simulationsConfig'); 
            const index = simulations.findIndex((s: any) => s.simulation_config_id === simulation_config_id);
            
            if (index === -1) {
                return res.status(404).json({ message: 'Simulation configuration not found' });
            }

            const existingSimulation = simulations[index];
            const { configuration_details } = req.body;

            const updatedSimulation = { ...existingSimulation };

            // פשוט מחליפים את פרטי הקונפיגורציה בחדשים (אם סופקו)
            if (configuration_details !== undefined) {
                updatedSimulation.configuration_details = configuration_details;
            }

            simulations[index] = updatedSimulation;
            await writeData('simulationsConfig', simulations);
            
            res.json(updatedSimulation);
        } catch (error) {
            console.error("Error updating simulation:", error);
            res.status(500).json({ message: 'Error updating simulation configuration' });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const { simulation_config_id } = req.params;
            let simulations = await readData('simulationsConfig');
            simulations = simulations.filter((s: any) => s.simulation_config_id !== simulation_config_id);
            
            await writeData('simulationsConfig', simulations);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting simulation' });
        }
    }
};