import { Request, Response } from 'express';
import { publishCodeGeneration } from '../rabbitmq/index.js';  
import { readData, writeData } from '../utils/readWriteData.js';
import { v4 as uuidv4 } from 'uuid';

async function populateSimulationData(simulationConfig: any) {
    const systemsDB = await readData('systems'); 
    
    // שליפת מערך המערכות מתוך הקונפיגורציה
    const configSystems = simulationConfig.configuration_details?.systems || [];

    // דרישה: לקחת כרגע רק את שתי המערכות הראשונות במערך
    const sys1Config = configSystems[0];
    const sys2Config = configSystems[1];
    
    const system1 = sys1Config ? systemsDB.find((sys: any) => sys.system_id === sys1Config.system_id) : null;
    const system2 = sys2Config ? systemsDB.find((sys: any) => sys.system_id === sys2Config.system_id) : null;
    
    const system1_name = system1 ? system1.name : 'Unknown System 1';
    const system2_name = system2 ? system2.name : 'Unknown System 2';

    const data_writers: any[] = [];
    const data_readers: any[] = [];

    // פונקציית עזר פנימית שממיינת את הישויות (entities) לקוראים וכותבים
    const sortEntities = (entities: any[]) => {
        if (!entities) return;
        
        entities.forEach((entity: any) => {
            const mappedEntity = {
                // ממפה entity_id לשם השדה הישן שהרביט מכיר
                [entity.type === 'writer' ? 'data_writer_id' : 'data_reader_id']: entity.entity_id,
                name: entity.name || 'Unknown',
                message_count: Number(entity.message_count || 0),
                message_frequency_hz: Number(entity.message_frequency_hz || 0)
            };

            if (entity.type === 'writer') {
                data_writers.push(mappedEntity);
            } else if (entity.type === 'reader') {
                data_readers.push(mappedEntity);
            }
        });
    };

    // מיון הישויות של שתי המערכות הראשונות בלבד
    if (sys1Config) sortEntities(sys1Config.entities);
    if (sys2Config) sortEntities(sys2Config.entities);

    return {
        system1_name,
        system2_name,
        data_writers,
        data_readers 
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
            const { simulation_config_id, ip_address="10.56.49.227", simulated_systems } = req.body;
            
            if (!ip_address || !simulated_systems || !Array.isArray(simulated_systems)) {
                return res.status(400).json({ message: 'Missing required parameters: ip_address or simulated_systems' });
            }

            const simulations = await readData('simulationsConfig');
            const simulationExists = simulations.find((s: any) => s.simulation_config_id === simulation_config_id);
            
            if (!simulationExists) {
                return res.status(404).json({ message: 'Simulation configuration not found' });
            }

            const enrichedData = await populateSimulationData(simulationExists);
            const messageCount = enrichedData.data_writers?.[0]?.message_count || 0;
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 5000); // ברירת מחדל של 5 שניות התמהמהות
            
            const newRun = {
                simulation_run_id: uuidv4(),
                simulation_config_id,
                status: 'inProgress',
                pipeline_stage: 'Code_Generation',
                start_time: new Date().toISOString(),
                ip_address,
                simulated_systems,
                results: { success_rate: 0, error: 0, messages_sent: 0, messages_received: 0 }
            };

            const runs = await readData('simulationRuns');
            runs.push(newRun);
            await writeData('simulationRuns', runs);
            console.log(`[SimulationRunController] Dispatching messages to RabbitMQ queues for run_id: ${newRun.simulation_run_id}`);
            
            await publishCodeGeneration(
                newRun.simulation_run_id,
                ip_address,
                messageCount
            );
            
            // newRun.status = 'Completed'; 

            return res.status(201).json({ 
                message: 'Code generation started successfully. Waiting for Python to complete.', 
                run_id: newRun.simulation_run_id 
            });

        } catch (error) {
            console.error("Critical error:", error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};