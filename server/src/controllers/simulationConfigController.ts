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
            const { scenario_name, system1_id, system2_id, configuration_details } = req.body;
            const simulations = await readData('simulationsConfig');
            
            // Making sure the name is unique
            if (simulations.some((s: any) => s.scenario_name === scenario_name)) {
                return res.status(400).json({ message: 'Scenario name already exists. Please choose a unique name.' });
            }

            const newSimulation = {
                simulation_config_id: uuidv4(),
                scenario_name,
                system1_id,
                system2_id,
                configuration_details, // An object that will contain all selected DRs and DWs with their settings.
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
            const simulations = await readData('simulationsConfig'); // או השם שקראת לקובץ ה-JSON
            const index = simulations.findIndex((s: any) => s.simulation_config_id === simulation_config_id);
            
            if (index === -1) {
                return res.status(404).json({ message: 'Simulation configuration not found' });
            }

            const existingSimulation = simulations[index];
            
            // 1. מחלצים במפורש רק את מה שמותר לעדכן מה-body
            const { 
                system1_id, 
                system2_id, 
                configuration_details 
            } = req.body;

            const updatedSimulation = { ...existingSimulation };

            if (system1_id !== undefined) updatedSimulation.system1_id = system1_id;
            if (system2_id !== undefined) updatedSimulation.system2_id = system2_id;

            if (configuration_details) {
                const { selected_contracts, dr_ids, dw_ids } = configuration_details;
                
                updatedSimulation.configuration_details = {
                    ...existingSimulation.configuration_details
                };

                if (selected_contracts !== undefined) {
                    updatedSimulation.configuration_details.selected_contracts = selected_contracts;
                }
                if (dr_ids !== undefined) {
                    updatedSimulation.configuration_details.dr_ids = dr_ids;
                }
                if (dw_ids !== undefined) {
                    updatedSimulation.configuration_details.dw_ids = dw_ids;
                }
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